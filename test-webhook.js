/**
 * Simple script to test the webhook endpoint
 * Usage: node test-webhook.js
 */

const http = require('http');

const testPayment = {
  payment_id: `INV-${Date.now()}`,
  customer_name: 'Riya Mehta',
  amount: 1200,
  currency: 'INR'
};

const data = JSON.stringify(testPayment);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);

  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse:');
    try {
      const json = JSON.parse(responseData);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  console.log('\nMake sure the server is running on port 3001');
});

req.write(data);
req.end();

