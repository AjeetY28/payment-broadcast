const whatsappService = require('../services/whatsapp');
const sheetsService = require('../services/sheets');
const zohoBooksService = require('../services/zohoBooks');

/**
 * Handle incoming webhook from Zoho Books or manual entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleWebhook(req, res) {
  try {
    const webhookPayload = req.body;
    const headers = req.headers;

    console.log('📥 Received webhook:', {
      headers: {
        'user-agent': headers['user-agent'],
        'content-type': headers['content-type']
      },
      payload: webhookPayload
    });

    let paymentData = null;
    let whatsappMessage = null;
    let source = 'manual';
    const isInvoiceCreatedEvent = webhookPayload?.event?.type === 'invoice.created';

    // Check if this is a Zoho Books webhook
    const isZohoWebhook = zohoBooksService.validateZohoWebhook(webhookPayload) ||
                         headers['user-agent']?.includes('Zoho') ||
                         webhookPayload.invoice_id ||
                         webhookPayload.invoice_number ||
                         isInvoiceCreatedEvent;

    if (isZohoWebhook) {
      console.log('🧾 Detected Zoho Books webhook');
      
      // Parse Zoho Books invoice data
      paymentData = zohoBooksService.parseZohoBooksWebhook(webhookPayload);
      
      if (!paymentData) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Zoho Books webhook format',
          message: 'Could not parse invoice data from webhook payload'
        });
      }

      source = 'zoho_books';
      
      // Format custom WhatsApp message for invoice (for created events)
      if (isInvoiceCreatedEvent) {
        whatsappMessage = zohoBooksService.formatInvoiceWhatsAppMessage(paymentData);
      }
      
      console.log('✅ Parsed Zoho Books invoice:', {
        invoice_id: paymentData.invoice_id,
        invoice_number: paymentData.invoice_number,
        customer: paymentData.customer_name,
        amount: paymentData.amount,
        currency: paymentData.currency
      });
    } else {
      // Manual webhook format (original format)
      paymentData = webhookPayload;
      source = 'manual';
      
      // Validate required fields for manual webhook
      if (!paymentData.payment_id || !paymentData.customer_name || !paymentData.amount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: payment_id, customer_name, amount',
          message: 'For manual webhooks, provide: payment_id, customer_name, amount'
        });
      }
    }

    // Keep provided status; do not force 'paid'. For manual payloads without status, allow fallback to 'paid'.
    if (!paymentData.status && source === 'manual') {
      paymentData.status = 'paid';
    }

    // Add source and timestamp
    paymentData.source = source;
    paymentData.timestamp = paymentData.timestamp || new Date().toISOString();

    console.log('📊 Processing payment:', {
      payment_id: paymentData.payment_id,
      customer: paymentData.customer_name,
      amount: paymentData.amount,
      source: source
    });

    // Decide whether to send WhatsApp alert
    let whatsappResult = { success: false, skipped: true, reason: 'status_filter' };
    const statusNorm = (paymentData.status || '').toString().toLowerCase();
    const shouldSend = isInvoiceCreatedEvent || statusNorm === 'paid';

    if (shouldSend) {
      try {
        whatsappResult = await whatsappService.sendWhatsAppAlert(paymentData, whatsappMessage);
      } catch (error) {
        console.error('WhatsApp alert error:', error.message);
        whatsappResult = { success: false, error: error.message };
      }
    } else {
      console.log(`⏭️ Skipping WhatsApp send. Status="${paymentData.status}" (only "paid" or invoice.created sends).`);
    }

    // Log to Google Sheets or CSV
    let sheetsResult;
    try {
      sheetsResult = await sheetsService.logPaymentToSheet(paymentData);
    } catch (error) {
      console.error('Sheets logging error:', error.message);
      sheetsResult = { success: false, error: error.message };
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: source === 'zoho_books' ? 'Invoice processed successfully' : 'Payment processed successfully',
      source: source,
      payment_id: paymentData.payment_id,
      invoice_id: paymentData.invoice_id || paymentData.payment_id,
      invoice_number: paymentData.invoice_number || paymentData.payment_id,
      customer_name: paymentData.customer_name,
      amount: paymentData.amount,
      currency: paymentData.currency,
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

