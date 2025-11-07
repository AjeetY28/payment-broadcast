const whatsappService = require('../services/whatsapp');
const sheetsService = require('../services/sheets');

/**
 * Handle incoming webhook from Zoho Books
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleWebhook(req, res) {
  try {
    const paymentData = req.body;

    // Validate required fields
    if (!paymentData.payment_id || !paymentData.customer_name || !paymentData.amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: payment_id, customer_name, amount'
      });
    }

    console.log('📥 Received webhook:', paymentData);

    // Send WhatsApp alert
    let whatsappResult;
    try {
      whatsappResult = await whatsappService.sendWhatsAppAlert(paymentData);
    } catch (error) {
      console.error('WhatsApp alert error:', error.message);
      whatsappResult = { success: false, error: error.message };
    }

    // Log to Google Sheets or CSV
    let sheetsResult;
    try {
      sheetsResult = await sheetsService.logPaymentToSheet(paymentData);
      // Note: WhatsApp already sent above, so we don't need to send again
      // The sheet monitor will skip this entry because it's recent and already processed
    } catch (error) {
      console.error('Sheets logging error:', error.message);
      sheetsResult = { success: false, error: error.message };
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      payment_id: paymentData.payment_id,
      whatsapp: whatsappResult,
      sheets: sheetsResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  handleWebhook
};

