const fs = require('fs').promises;
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const CSV_FILE = path.join(LOG_DIR, 'payments.csv');

/**
 * Ensure logs directory exists
 */
async function ensureLogDir() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

/**
 * Ensure CSV file exists with headers
 */
async function ensureCSVFile() {
  await ensureLogDir();
  
  try {
    await fs.access(CSV_FILE);
    // File exists
  } catch {
    // File doesn't exist, create it with headers
    const headers = 'Payment ID,Customer Name,Amount,Currency,Timestamp,Status\n';
    await fs.writeFile(CSV_FILE, headers, 'utf8');
  }
}

/**
 * Log payment to CSV file
 * @param {Object} paymentData - Payment information
 */
async function logToCSV(paymentData) {
  await ensureCSVFile();

  const { payment_id, customer_name, amount, currency = 'INR' } = paymentData;
  const timestamp = new Date().toISOString();
  const status = 'Processed';

  // Escape commas and quotes in CSV
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const row = [
    escapeCSV(payment_id),
    escapeCSV(customer_name),
    escapeCSV(amount),
    escapeCSV(currency),
    escapeCSV(timestamp),
    escapeCSV(status)
  ].join(',') + '\n';

  try {
    await fs.appendFile(CSV_FILE, row, 'utf8');
    console.log('✅ Payment logged to CSV:', payment_id);
  } catch (error) {
    console.error('❌ Failed to write to CSV:', error.message);
    throw error;
  }
}

/**
 * Read all payments from CSV file
 * @returns {Promise<Array>} - Array of payment records
 */
async function readFromCSV() {
  await ensureCSVFile();

  try {
    const content = await fs.readFile(CSV_FILE, 'utf8');
    const lines = content.trim().split('\n');

    if (lines.length <= 1) {
      return []; // Only headers or empty file
    }

    // Skip header row
    const payments = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (handles quoted fields)
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          if (inQuotes && line[j + 1] === '"') {
            current += '"';
            j++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current); // Add last value

      if (values.length >= 6) {
        payments.push({
          payment_id: values[0],
          customer_name: values[1],
          amount: parseFloat(values[2]) || 0,
          currency: values[3] || 'INR',
          timestamp: values[4],
          status: values[5]
        });
      }
    }

    return payments;
  } catch (error) {
    console.error('❌ Failed to read CSV:', error.message);
    return [];
  }
}

module.exports = {
  logToCSV,
  readFromCSV,
  CSV_FILE
};

