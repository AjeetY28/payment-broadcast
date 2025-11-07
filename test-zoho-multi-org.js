/**
 * Test script: simulate two Zoho orgs sending invoice.created
 * Run: node test-zoho-multi-org.js
 */

const http = require('http');

function send(payload, name) {
  const data = JSON.stringify(payload);
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'User-Agent': 'ZohoBooks/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          console.log(`\n[${name}] Status:`, res.statusCode);
          console.log(`[${name}] Response:`, JSON.stringify(JSON.parse(body), null, 2));
        } catch {
          console.log(`[${name}] Response:`, body);
        }
        resolve();
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('🧪 Sending two org invoice.created events...');

  const org1 = {
    event: { type: 'invoice.created' },
    data: { invoice: { invoice_id: 'A-1001', invoice_number: 'INV-A-1001', customer_name: 'Org1 Customer', total: 1500, currency_code: 'INR', invoice_date: '2025-01-15' } },
    organization_id: 'ORG_001',
    organization_name: 'Alpha Org'
  };

  const org2 = {
    event: { type: 'invoice.created' },
    data: { invoice: { invoice_id: 'B-2001', invoice_number: 'INV-B-2001', customer_name: 'Org2 Customer', total: 3200, currency_code: 'USD', invoice_date: '2025-01-16' } },
    organization_id: 'ORG_002',
    organization_name: 'Beta Org'
  };

  await send(org1, 'ORG_001');
  await new Promise(r => setTimeout(r, 500));
  await send(org2, 'ORG_002');

  console.log('\n✅ Done. Check /logs or your Sheet/CSV.');
}

run().catch((e) => {
  console.error('❌ Error:', e.message);
  console.log('Ensure server is running on port 3001');
});

