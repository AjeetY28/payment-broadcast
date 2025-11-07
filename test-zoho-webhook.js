/**
 * Test script for Zoho Books webhook
 * Run: node test-zoho-webhook.js
 */

const http = require('http');

// Zoho Books webhook payload format
const zohoWebhookPayload = {
  invoice: {
    invoice_id: "12345",
    invoice_number: "INV-001",
    customer_name: "John Doe",
    total: 5000,
    currency_code: "INR",
    invoice_date: "2025-01-15",
    payment_status: "paid"
  }
};

// Alternative format
const zohoWebhookPayload2 = {
  invoice_id: "12346",
  invoice_number: "INV-002",
  customer_name: "Jane Smith",
  total: 7500,
  currency_code: "USD",
  invoice_date: "2025-01-15",
  payment_status: "paid"
};

// Event format
const zohoWebhookPayload3 = {
  event: {
    type: "invoice.created",
    data: {
      invoice_id: "12347",
      invoice_number: "INV-003",
      customer_name: "Bob Johnson",
      total: 3000,
      currency_code: "EUR",
      invoice_date: "2025-01-15"
    }
  }
};

function testWebhook(payload, testName) {
  const data = JSON.stringify(payload);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'User-Agent': 'ZohoBooks/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          console.log(`\n✅ ${testName}`);
          console.log('Response:', JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          console.log(`\n✅ ${testName}`);
          console.log('Response:', responseData);
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`\n❌ ${testName} - Error:`, error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Zoho Books Webhook Integration...\n');
  console.log('Make sure the server is running on port 3001\n');

  try {
    // Test 1: Standard Zoho Books format
    await testWebhook(zohoWebhookPayload, 'Test 1: Standard Zoho Books Format');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Flat format
    await testWebhook(zohoWebhookPayload2, 'Test 2: Flat Format');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Event format
    await testWebhook(zohoWebhookPayload3, 'Test 3: Event Format');

    console.log('\n✅ All tests completed!');
    console.log('\nCheck:');
    console.log('1. Backend console for processing logs');
    console.log('2. WhatsApp for notifications (if configured)');
    console.log('3. Google Sheets for invoice data');
    console.log('4. Dashboard UI for invoice display');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\nMake sure the server is running:');
    console.log('cd server && npm start');
  }
}

runTests();

