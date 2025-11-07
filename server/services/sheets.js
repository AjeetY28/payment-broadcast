let GoogleSpreadsheet = null;
let JWT = null;
try {
  ({ GoogleSpreadsheet } = require('google-spreadsheet'));
  ({ JWT } = require('google-auth-library'));
} catch (e) {
  console.warn('⚠️ Google Sheets SDK not installed. Will use CSV fallback unless GOOGLE_CREDS_JSON present and modules available.');
}
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const SHEET_ID = process.env.SHEET_ID;
const GOOGLE_CREDS_PATH = process.env.GOOGLE_CREDS_PATH;
const GOOGLE_CREDS_JSON = process.env.GOOGLE_CREDS_JSON; // Optional: JSON content for serverless (Vercel)

let doc = null;
let sheet = null;
let isGoogleSheetsConfigured = false;

/**
 * Initialize Google Sheets connection
 */
async function initializeGoogleSheets() {
  if (!SHEET_ID || (!GOOGLE_CREDS_PATH && !GOOGLE_CREDS_JSON)) {
    console.warn('⚠️ Google Sheets credentials not found. Using CSV fallback.');
    return false;
  }

  if (!GoogleSpreadsheet || !JWT) {
    console.warn('⚠️ Google Sheets libraries not available. Using CSV fallback.');
    return false;
  }

  try {
    // Check if credentials file exists
    let credentials;
    if (GOOGLE_CREDS_JSON) {
      // Prefer env var JSON for serverless platforms (e.g., Vercel)
      credentials = JSON.parse(GOOGLE_CREDS_JSON);
    } else {
      const credsPath = path.resolve(GOOGLE_CREDS_PATH);
      const credsContent = await fs.readFile(credsPath, 'utf8');
      credentials = JSON.parse(credsContent);
    }

    // Initialize JWT auth
    const serviceAccountAuth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // Initialize Google Spreadsheet
    doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    // Get or create the first sheet
    sheet = doc.sheetsByIndex[0] || (await doc.addSheet({ title: 'Payments' }));

    // Ensure headers exist
    await ensureHeaders();

    isGoogleSheetsConfigured = true;
    console.log('✅ Google Sheets initialized:', doc.title);
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to initialize Google Sheets:', error.message);
    console.warn('⚠️ Falling back to CSV logging.');
    return false;
  }
}

/**
 * Ensure sheet has proper headers
 */
async function ensureHeaders() {
  if (!sheet) return;

  const requiredHeaders = [
    'Payment ID', 'Customer Name', 'Amount', 'Currency', 'Timestamp', 'Status',
    'Invoice ID', 'Invoice Number', 'Invoice Date', 'Source',
    'Organization ID', 'Organization Name'
  ];
  
  try {
    // Try to load existing header row
    await sheet.loadHeaderRow();
    const existingHeaders = sheet.headerValues || [];
    
    // Check if all required headers exist
    const hasAllHeaders = requiredHeaders.every(h => existingHeaders.includes(h));
    
    if (hasAllHeaders) {
      console.log('✅ Headers already exist in Google Sheet');
      return;
    } else {
      console.log('⚠️ Headers are incomplete, will update...');
    }
  } catch (error) {
    // No headers exist yet, we'll create them
    console.log('📝 No headers found, creating new headers...');
  }

  // Set headers using setHeaderRow (this writes to row 1)
  try {
    await sheet.setHeaderRow(requiredHeaders);
    console.log('✅ Headers created in Google Sheet');
  } catch (setError) {
    console.warn('⚠️ setHeaderRow failed, trying alternative method...', setError.message);
    
    // Alternative: Directly write to row 1 using cells
    try {
      await sheet.loadCells('A1:F1');
      
      const headerValues = requiredHeaders;
      for (let i = 0; i < headerValues.length; i++) {
        const cell = sheet.getCell(0, i); // Row 0 (first row), Column i
        cell.value = headerValues[i];
      }
      
      await sheet.saveUpdatedCells();
      console.log('✅ Headers created using direct cell method');
    } catch (cellError) {
      console.warn('⚠️ Direct cell method failed, trying addRow fallback...', cellError.message);
      
      // Final fallback: Add header row as data (less ideal but works)
      try {
        // Check if first row is empty
        const rows = await sheet.getRows({ limit: 1 });
        if (rows.length === 0) {
          await sheet.addRow({
            'Payment ID': 'Payment ID',
            'Customer Name': 'Customer Name',
            'Amount': 'Amount',
            'Currency': 'Currency',
            'Timestamp': 'Timestamp',
            'Status': 'Status'
          });
          console.log('✅ Headers added as first row (fallback method)');
        }
      } catch (addError) {
        console.error('❌ Could not set headers:', addError.message);
        throw addError;
      }
    }
  }
}

/**
 * Log payment to Google Sheets
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} - Result of logging
 */
async function logPaymentToSheet(paymentData) {
  const { payment_id, customer_name, amount, currency = 'INR' } = paymentData;
  const timestamp = new Date().toISOString();

  // If Google Sheets is not configured, use CSV logger
  if (!isGoogleSheetsConfigured) {
    await logger.logToCSV(paymentData);
    return {
      success: true,
      method: 'csv',
      message: 'Payment logged to CSV file'
    };
  }

  try {
    // Ensure headers are loaded before adding row
    try {
      await sheet.loadHeaderRow();
    } catch (headerError) {
      // Headers might not exist, create them
      console.log('⚠️ Headers not found when adding row, creating them...');
      await ensureHeaders();
      await sheet.loadHeaderRow();
    }

    // Add row to Google Sheet with additional fields if available
    const rowData = {
      'Payment ID': payment_id,
      'Customer Name': customer_name,
      'Amount': amount,
      'Currency': currency,
      'Timestamp': timestamp,
      'Status': paymentData.status || 'Processed'
    };

    // Add invoice fields if available (for Zoho Books)
    if (paymentData.invoice_id) {
      rowData['Invoice ID'] = paymentData.invoice_id;
    }
    if (paymentData.invoice_number) {
      rowData['Invoice Number'] = paymentData.invoice_number;
    }
    if (paymentData.invoice_date) {
      rowData['Invoice Date'] = paymentData.invoice_date;
    }
    if (paymentData.source) {
      rowData['Source'] = paymentData.source;
    }

    // Organization fields if available
    if (paymentData.organization_id) {
      rowData['Organization ID'] = paymentData.organization_id;
    }
    if (paymentData.organization_name) {
      rowData['Organization Name'] = paymentData.organization_name;
    }

    await sheet.addRow(rowData);

    console.log('✅ Payment logged to Google Sheets:', payment_id);
    return {
      success: true,
      method: 'google_sheets',
      message: 'Payment logged to Google Sheets'
    };
  } catch (error) {
    console.error('❌ Failed to log to Google Sheets:', error.message);
    // Fallback to CSV
    await logger.logToCSV(paymentData);
    return {
      success: true,
      method: 'csv_fallback',
      message: 'Payment logged to CSV (Google Sheets failed)',
      error: error.message
    };
  }
}

/**
 * Get all payments from Google Sheets
 * @returns {Promise<Array>} - Array of payment records
 */
async function getAllPayments() {
  // If Google Sheets not configured, read from CSV
  if (!isGoogleSheetsConfigured) {
    return await logger.readFromCSV();
  }

  try {
    // Load header row first to enable column name access
    try {
      await sheet.loadHeaderRow();
    } catch (headerError) {
      console.warn('⚠️ Could not load header row:', headerError.message);
      // If headers don't exist, ensure they're created
      await ensureHeaders();
      await sheet.loadHeaderRow();
    }

    const rows = await sheet.getRows();
    
    // Filter out header rows and empty rows, then map to objects
    const payments = rows
      .filter(row => {
        // Skip rows where Payment ID is actually a header or empty
        const paymentId = row.get('Payment ID');
        return paymentId && 
               paymentId !== 'Payment ID' && 
               paymentId.toString().trim() !== '';
      })
      .map(row => {
        const paymentId = row.get('Payment ID');
        return {
          payment_id: paymentId,
          invoice_id: row.get('Invoice ID') || paymentId,
          invoice_number: row.get('Invoice Number') || paymentId,
          customer_name: row.get('Customer Name'),
          amount: parseFloat(row.get('Amount')) || 0,
          currency: row.get('Currency') || 'INR',
          timestamp: row.get('Timestamp'),
          invoice_date: row.get('Invoice Date') || row.get('Timestamp'),
          status: row.get('Status'),
          source: row.get('Source') || 'manual',
          organization_id: row.get('Organization ID') || null,
          organization_name: row.get('Organization Name') || null
        };
      });

    return payments;
  } catch (error) {
    console.error('❌ Failed to read from Google Sheets:', error.message);
    // Fallback to CSV
    return await logger.readFromCSV();
  }
}

// Initialize on module load
initializeGoogleSheets().catch(console.error);

module.exports = {
  logPaymentToSheet,
  getAllPayments,
  initializeGoogleSheets,
  isGoogleSheetsConfigured: () => isGoogleSheetsConfigured,
  doc,
  sheet
};
