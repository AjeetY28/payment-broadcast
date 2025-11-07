# 🧾 Zoho Books Integration Setup Guide

## Overview

This system automatically receives invoice creation webhooks from Zoho Books and:
- ✅ Sends WhatsApp notifications with invoice details
- ✅ Stores invoice data to Google Sheets
- ✅ Displays invoices on the dashboard UI

---

## 📋 Features

1. **Automatic Webhook Reception**: Receives invoice creation events from Zoho Books
2. **WhatsApp Notifications**: Sends formatted messages with invoice details
3. **Google Sheets Logging**: Stores invoice data automatically
4. **Dashboard Display**: Shows invoices in real-time on UI
5. **Multiple Organizations**: Supports multiple Zoho Books organizations

---

## 🚀 Setup Steps

### Step 1: Configure Zoho Books Webhook

1. **Login to Zoho Books**
   - Go to [Zoho Books](https://books.zoho.com)
   - Login to your organization

2. **Navigate to Webhooks**
   - Go to **Settings** → **Automation** → **Webhooks**
   - Or go to: `https://books.zoho.com/[organization-id]/settings/webhooks`

3. **Create New Webhook**
   - Click **"Create Webhook"** or **"Add Webhook"**
   - **Event**: Select **"Invoice Created"** or **"Invoice.Created"**
   - **URL**: `https://your-domain.com/webhook` (or `http://localhost:3001/webhook` for testing)
   - **Method**: POST
   - **Content Type**: JSON

4. **Save Webhook**
   - Click **Save** or **Create**
   - Copy the webhook URL for reference

---

### Step 2: Configure Backend (if needed)

The backend automatically detects Zoho Books webhooks. No additional configuration needed!

**Optional Environment Variables:**
```env
# In server/.env (optional)
ZOHO_WEBHOOK_SECRET=your_webhook_secret
ZOHO_ORG_ID=your_organization_id
```

---

### Step 3: Test Webhook

#### Option 1: Create Test Invoice in Zoho Books

1. Create a new invoice in Zoho Books
2. Save the invoice
3. Check backend console for webhook reception
4. Check WhatsApp for notification
5. Check Google Sheet for invoice data
6. Check dashboard UI for invoice display

#### Option 2: Test with cURL

```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_id": "12345",
    "invoice_number": "INV-001",
    "customer_name": "Test Customer",
    "total": 1000,
    "currency_code": "INR",
    "invoice_date": "2025-01-15",
    "payment_status": "paid"
  }'
```

---

## 📊 Webhook Payload Format

Zoho Books sends different webhook formats. The system handles:

### Format 1: Standard Zoho Books
```json
{
  "invoice": {
    "invoice_id": "12345",
    "invoice_number": "INV-001",
    "customer_name": "John Doe",
    "total": 1000,
    "currency_code": "INR",
    "invoice_date": "2025-01-15",
    "payment_status": "paid"
  }
}
```

### Format 2: Event-based
```json
{
  "event": {
    "type": "invoice.created",
    "data": {
      "invoice_id": "12345",
      "invoice_number": "INV-001",
      "customer_name": "John Doe",
      "total": 1000
    }
  }
}
```

### Format 3: Flat Structure
```json
{
  "invoice_id": "12345",
  "invoice_number": "INV-001",
  "customer_name": "John Doe",
  "total": 1000,
  "currency_code": "INR",
  "invoice_date": "2025-01-15"
}
```

---

## 📱 WhatsApp Notification Format

When an invoice is created, you'll receive:

```
🧾 New Invoice Created!

Invoice ID: INV-001
Customer: John Doe
Amount: INR 1,000
Date: Jan 15, 2025
Time: 1/15/2025, 10:30:00 AM

Invoice has been created in Zoho Books!
```

---

## 📊 Google Sheets Structure

Invoices are stored with additional columns:

| Payment ID | Customer Name | Amount | Currency | Timestamp | Status | Invoice ID | Invoice Number | Invoice Date | Source |
|------------|---------------|--------|----------|-----------|--------|------------|----------------|--------------|--------|
| INV-001 | John Doe | 1000 | INR | 2025-01-15T10:30:00.000Z | paid | 12345 | INV-001 | 2025-01-15 | zoho_books |

---

## 🎯 Multiple Organizations Setup

### For Multiple Zoho Books Organizations:

1. **Create Separate Webhooks** for each organization
2. **Point to Same Backend URL**: `https://your-domain.com/webhook`
3. **System Auto-Detects**: Different organizations automatically
4. **All Invoices Stored**: In the same Google Sheet
5. **Source Tracking**: Each invoice shows its source

### Example Setup:

**Organization 1:**
- Webhook URL: `https://your-domain.com/webhook`
- Event: Invoice Created

**Organization 2:**
- Webhook URL: `https://your-domain.com/webhook`
- Event: Invoice Created

Both will work with the same backend!

---

## ✅ Verification Checklist

- [ ] Zoho Books webhook configured
- [ ] Webhook URL points to your backend
- [ ] Event selected: "Invoice Created"
- [ ] Backend server is running
- [ ] Test invoice created in Zoho Books
- [ ] Webhook received (check backend console)
- [ ] WhatsApp notification sent
- [ ] Invoice stored in Google Sheets
- [ ] Invoice appears on dashboard UI

---

## 🔍 Troubleshooting

### Problem: Webhook not received

**Solutions:**
1. ✅ Check webhook URL is correct
2. ✅ Verify backend server is running
3. ✅ Check Zoho Books webhook is active
4. ✅ Test with cURL (see above)
5. ✅ Check backend console for errors

### Problem: Invoice data not parsed correctly

**Solutions:**
1. ✅ Check webhook payload format in console
2. ✅ Verify Zoho Books webhook format
3. ✅ Check `server/services/zohoBooks.js` for parsing logic
4. ✅ Update parsing logic if needed

### Problem: WhatsApp not sending

**Solutions:**
1. ✅ Check Twilio credentials
2. ✅ Verify WhatsApp service is working
3. ✅ Check console for WhatsApp errors
4. ✅ Test with manual webhook first

### Problem: Invoice not in Google Sheets

**Solutions:**
1. ✅ Check Google Sheets permissions
2. ✅ Verify service account access
3. ✅ Check console for sheets errors
4. ✅ Verify sheet headers exist

---

## 📝 Example Workflow

1. **Invoice Created in Zoho Books**
   - User creates invoice in Zoho Books
   - Invoice saved with ID: INV-001

2. **Webhook Sent to Backend**
   - Zoho Books sends webhook to `/webhook` endpoint
   - Backend receives invoice data

3. **Processing**
   - Backend parses invoice data
   - Extracts: Invoice ID, Customer, Amount, Date

4. **WhatsApp Notification**
   - Formatted message sent via WhatsApp
   - Customer receives notification

5. **Google Sheets Storage**
   - Invoice data stored in Google Sheets
   - Includes all invoice details

6. **Dashboard Update**
   - UI auto-refreshes (every 5 seconds)
   - New invoice appears on dashboard

---

## 🎯 Supported Invoice Fields

The system extracts and stores:

- ✅ Invoice ID
- ✅ Invoice Number
- ✅ Customer Name
- ✅ Amount
- ✅ Currency
- ✅ Invoice Date
- ✅ Payment Status
- ✅ Timestamp

---

## 🔧 Customization

### Custom WhatsApp Message

Edit `server/services/zohoBooks.js`:
```javascript
function formatInvoiceWhatsAppMessage(paymentData) {
  // Customize your message here
  return `Your custom message...`;
}
```

### Custom Webhook Parsing

Edit `server/services/zohoBooks.js`:
```javascript
function parseZohoBooksWebhook(webhookPayload) {
  // Add custom parsing logic
}
```

---

## 📞 Support

For issues:
1. Check backend console logs
2. Verify webhook payload format
3. Test with cURL
4. Check Google Sheets permissions
5. Verify Twilio credentials

---

**🎉 Your Zoho Books integration is ready! Create an invoice and watch the magic happen!**

