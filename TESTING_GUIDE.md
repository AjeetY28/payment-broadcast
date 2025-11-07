# 🧪 Complete Testing Guide

## How to Test: Payment Entry → UI Display + WhatsApp Notification

### Prerequisites

1. **Backend Server Running**
2. **Frontend Dashboard Running**
3. **Google Sheets Configured** (optional - CSV fallback works)
4. **Twilio WhatsApp** (optional - mock mode works)

---

## 🚀 Step-by-Step Testing

### Step 1: Start Backend Server

```bash
cd server
npm start
```

**Expected Output:**
```
🚀 Server running on port 3001
📊 Health check: http://localhost:3001/health
📥 Webhook endpoint: http://localhost:3001/webhook
📋 Logs endpoint: http://localhost:3001/logs
✅ Google Sheets initialized: Your Sheet Name
```

### Step 2: Start Frontend Dashboard

Open a **new terminal**:

```bash
cd client
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view client in the browser.
  Local:            http://localhost:3000
```

The dashboard will automatically open in your browser at `http://localhost:3000`

### Step 3: Test Payment Entry (3 Methods)

---

## 📥 Method 1: Using Test Script (Easiest)

```bash
# From project root
node test-webhook.js
```

**What Happens:**
1. ✅ Sends test payment to webhook
2. ✅ WhatsApp notification sent (or mock if not configured)
3. ✅ Payment logged to Google Sheets/CSV
4. ✅ Dashboard auto-refreshes (within 5 seconds) and shows new payment

---

## 📥 Method 2: Using cURL (Command Line)

```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "INV-2304",
    "customer_name": "Riya Mehta",
    "amount": 1200,
    "currency": "INR"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "payment_id": "INV-2304",
  "whatsapp": {
    "success": true,
    "mock": false,
    "messageSid": "SM..."
  },
  "sheets": {
    "success": true,
    "method": "google_sheets"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 📥 Method 3: Using Postman/Insomnia

1. **Create New Request:**
   - Method: `POST`
   - URL: `http://localhost:3001/webhook`
   - Headers: `Content-Type: application/json`

2. **Body (JSON):**
   ```json
   {
     "payment_id": "INV-2304",
     "customer_name": "Riya Mehta",
     "amount": 1200,
     "currency": "INR"
   }
   ```

3. **Click Send**

---

## ✅ What to Check After Sending Payment

### 1. Check Backend Console

You should see:
```
📥 Received webhook: { payment_id: 'INV-2304', ... }
✅ Payment logged to Google Sheets: INV-2304
✅ WhatsApp alert sent: SM...
```

### 2. Check WhatsApp (If Configured)

You should receive a WhatsApp message like:
```
💰 Payment Alert!

Payment ID: INV-2304
Customer: Riya Mehta
Amount: INR 1200
Time: 1/1/2024, 12:00:00 PM

Thank you for your payment!
```

**If Twilio not configured:** Check console for mock message:
```
📱 [MOCK] WhatsApp Alert: { ... }
```

### 3. Check Google Sheet

Open your Google Sheet - you should see:
- **Row 1:** Headers (Payment ID, Customer Name, Amount, Currency, Timestamp, Status)
- **Row 2:** New payment data

**If Google Sheets not configured:** Check `logs/payments.csv` file

### 4. Check Dashboard UI

1. **Open:** `http://localhost:3000`
2. **Wait 5 seconds** (auto-refresh) or click **🔄 Refresh** button
3. **Check:**
   - ✅ Payment appears in the table
   - ✅ Statistics update (Total Payments, Total Amount)
   - ✅ Latest payment highlighted with blue background
   - ✅ Timestamp shows correctly

---

## 🎯 Multiple Payment Test

Send multiple payments to test the dashboard:

```bash
# Payment 1
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "INV-001", "customer_name": "John Doe", "amount": 5000, "currency": "INR"}'

# Payment 2
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "INV-002", "customer_name": "Jane Smith", "amount": 7500, "currency": "INR"}'

# Payment 3
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "INV-003", "customer_name": "Bob Johnson", "amount": 3000, "currency": "USD"}'
```

**Dashboard should show:**
- All 3 payments in the table
- Total Payments: 3
- Total Amount: Updated sum
- Payments sorted by newest first

---

## 🔍 Troubleshooting

### Problem: Payment not showing in UI

**Solutions:**
1. ✅ Check backend is running on port 3001
2. ✅ Check frontend is running on port 3000
3. ✅ Wait 5 seconds for auto-refresh, or click Refresh button
4. ✅ Open browser console (F12) and check for errors
5. ✅ Check backend console for errors

### Problem: WhatsApp not sending

**Solutions:**
1. ✅ Check Twilio credentials in `server/.env`
2. ✅ Verify `TWILIO_FROM_NUMBER` and `TWILIO_TO_NUMBER` are correct
3. ✅ Check console for mock mode message (if credentials missing)
4. ✅ Verify Twilio account has WhatsApp enabled

### Problem: Google Sheet not updating

**Solutions:**
1. ✅ Check `SHEET_ID` in `server/.env` is correct
2. ✅ Verify service account has Editor access
3. ✅ Check `GOOGLE_CREDS_PATH` is correct
4. ✅ Check `logs/payments.csv` as fallback
5. ✅ Run `node server/test-sheets.js` to test connection

### Problem: Dashboard shows "Failed to connect to server"

**Solutions:**
1. ✅ Ensure backend server is running
2. ✅ Check backend URL in browser console
3. ✅ Verify CORS is enabled in backend
4. ✅ Check firewall/antivirus isn't blocking port 3001

---

## 📊 Testing Checklist

- [ ] Backend server started successfully
- [ ] Frontend dashboard opened in browser
- [ ] Sent test payment via webhook
- [ ] Backend console shows payment received
- [ ] WhatsApp notification received (or mock message in console)
- [ ] Google Sheet updated (or CSV file updated)
- [ ] Dashboard shows new payment (within 5 seconds)
- [ ] Statistics updated correctly
- [ ] Multiple payments test successful
- [ ] Auto-refresh working (wait 5 seconds)

---

## 🎬 Quick Test Command

Run this command multiple times to test:

```bash
node test-webhook.js
```

Each run will:
1. Generate a unique payment ID
2. Send payment to webhook
3. Trigger WhatsApp notification
4. Log to Google Sheets/CSV
5. Update dashboard (within 5 seconds)

---

## 💡 Pro Tips

1. **Keep dashboard open** while testing to see real-time updates
2. **Check browser console** (F12) for any frontend errors
3. **Check backend console** for payment processing logs
4. **Test with different currencies** (INR, USD, EUR) to verify formatting
5. **Test with large amounts** to verify number formatting
6. **Send payments quickly** to test auto-refresh functionality

---

## 📱 WhatsApp Testing

### If Twilio is NOT configured:

- System runs in **mock mode**
- Check backend console for mock WhatsApp logs
- No actual WhatsApp message will be sent

### If Twilio IS configured:

- Real WhatsApp messages will be sent
- Verify `TWILIO_TO_NUMBER` is correct
- Check Twilio dashboard for message logs
- Verify WhatsApp is enabled in Twilio account

---

## ✅ Success Indicators

**Backend:**
- ✅ "Payment processed successfully" message
- ✅ "Payment logged to Google Sheets" message
- ✅ "WhatsApp alert sent" message

**Frontend:**
- ✅ New payment appears in table
- ✅ Statistics update
- ✅ Latest payment highlighted
- ✅ No error messages

**Google Sheet:**
- ✅ Headers in row 1
- ✅ Payment data in row 2+
- ✅ Timestamp in ISO format

**WhatsApp:**
- ✅ Message received (or mock in console)
- ✅ Contains payment details
- ✅ Formatted correctly

---

**🎉 You're all set! Start testing and watch the magic happen!**

