let twilio = null;
try {
  twilio = require('twilio');
} catch (e) {
  console.warn('⚠️ Twilio SDK not installed. Using mock mode.');
}
const dotenv = require('dotenv');

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const toNumber = process.env.TWILIO_TO_NUMBER;

// Check if Twilio credentials are available
const isTwilioConfigured = !!(twilio && accountSid && authToken && fromNumber && toNumber);

let twilioClient = null;

if (isTwilioConfigured) {
  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Twilio client:', error.message);
  }
} else {
  console.warn('⚠️ Twilio credentials not found. Using mock mode.');
}

/**
 * Send WhatsApp alert for payment
 * @param {Object} paymentData - Payment information
 * @param {String} customMessage - Optional custom message (for invoices)
 * @returns {Promise<Object>} - Response from Twilio or mock response
 */
async function sendWhatsAppAlert(paymentData, customMessage = null) {
  const { payment_id, customer_name, amount, currency = 'INR' } = paymentData;

  // Use custom message if provided (for invoices), otherwise use default
  const message = customMessage || (
    `💰 Payment Alert!\n\n` +
    `Payment ID: ${payment_id}\n` +
    `Customer: ${customer_name}\n` +
    `Amount: ${currency} ${amount}\n` +
    `Time: ${new Date().toLocaleString()}\n\n` +
    `Thank you for your payment!`
  );

  // If Twilio is not configured, return mock response
  if (!isTwilioConfigured || !twilioClient) {
    console.log('📱 [MOCK] WhatsApp Alert:', {
      to: toNumber || '+1234567890',
      message: message.substring(0, 50) + '...',
      status: 'sent (mock)'
    });
    return {
      success: true,
      mock: true,
      message: 'WhatsApp alert sent (mock mode)',
      timestamp: new Date().toISOString()
    };
  }

  try {
    // Send WhatsApp message via Twilio
    const messageResponse = await twilioClient.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${toNumber}`,
      body: message
    });

    console.log('✅ WhatsApp alert sent:', messageResponse.sid);
    return {
      success: true,
      mock: false,
      messageSid: messageResponse.sid,
      status: messageResponse.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Failed to send WhatsApp alert:', error.message);
    throw new Error(`WhatsApp alert failed: ${error.message}`);
  }
}

module.exports = {
  sendWhatsAppAlert,
  isTwilioConfigured
};

