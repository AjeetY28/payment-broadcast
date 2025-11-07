/**
 * Test script to verify Google Sheets header creation
 * Run: node test-sheets.js
 */

require('dotenv').config();
const { logPaymentToSheet, initializeGoogleSheets, getAllPayments } = require('./services/sheets');

async function testSheets() {
  console.log('🧪 Testing Google Sheets integration...\n');

  // Initialize
  console.log('1. Initializing Google Sheets...');
  const initialized = await initializeGoogleSheets();
  
  if (!initialized) {
    console.error('❌ Google Sheets not initialized. Check your credentials.');
    process.exit(1);
  }

  console.log('✅ Google Sheets initialized\n');

  // Test getting payments (this will trigger header check)
  console.log('2. Testing getPayments (will check/create headers)...');
  try {
    const payments = await getAllPayments();
    console.log(`✅ Retrieved ${payments.length} payments\n`);
  } catch (error) {
    console.error('❌ Error getting payments:', error.message);
  }

  // Test adding a payment
  console.log('3. Testing addPayment...');
  const testPayment = {
    payment_id: `TEST-${Date.now()}`,
    customer_name: 'Test Customer',
    amount: 999,
    currency: 'INR'
  };

  try {
    const result = await logPaymentToSheet(testPayment);
    console.log('✅ Payment added:', result);
  } catch (error) {
    console.error('❌ Error adding payment:', error.message);
  }

  // Verify payment was added
  console.log('\n4. Verifying payment was added...');
  try {
    const payments = await getAllPayments();
    const testPayments = payments.filter(p => p.payment_id === testPayment.payment_id);
    if (testPayments.length > 0) {
      console.log('✅ Test payment found in sheet:', testPayments[0]);
    } else {
      console.log('⚠️ Test payment not found (might need to refresh sheet)');
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error.message);
  }

  console.log('\n✅ Test complete! Check your Google Sheet to verify headers and data.');
}

testSheets().catch(console.error);

