# 🔧 Troubleshooting: WhatsApp Notifications Not Received

## Problem: Manual Entry Not Triggering WhatsApp Notification

If you manually added data to Google Sheet but didn't receive WhatsApp notification, check these:

---

## ✅ Quick Checklist

- [ ] Server is running (`npm start` in server folder)
- [ ] Sheet monitoring is enabled (check console for "Started monitoring Google Sheets")
- [ ] Entry was added AFTER server started
- [ ] Payment ID is not empty
- [ ] Timestamp format is correct
- [ ] Twilio credentials are configured (or check mock mode)

---

## 🔍 Step-by-Step Troubleshooting

### Step 1: Check Server is Running

**Check backend console:**
```bash
cd server
npm start
```

**You should see:**
```
🚀 Server running on port 3001
✅ Google Sheets initialized: Your Sheet Name
✅ Started monitoring Google Sheets (checking every 30 seconds)
💡 Manual sheet entries will trigger WhatsApp notifications!
📊 Sheet monitoring initialized. Current payments: X
```

**If you don't see "Started monitoring Google Sheets":**
- Check `server/.env` file has `ENABLE_SHEET_MONITORING=true`
- Restart the server

---

### Step 2: Check Entry Timing

**Important:** Monitoring only detects entries added AFTER the server starts.

**Problem:** If you added entry before starting server, it won't trigger notification.

**Solution:**
1. Make sure server is running
2. Add a NEW entry to the sheet
3. Wait 30 seconds
4. Check console for processing message

---

### Step 3: Check Timestamp Format

Your timestamp: `2025-11-07T15:06:23+05:30`

**This format works!** The system now handles `+05:30` format.

**But recommended format:**
```
2025-11-07T15:06:23.000Z
```

**To fix your timestamp:**
1. Replace `+05:30` with `.000Z`
2. Or use this formula in Google Sheets:
   ```
   =CONCATENATE(TEXT(NOW(),"yyyy-mm-dd"),"T",TEXT(NOW(),"HH:MM:SS"),".000Z")
   ```

---

### Step 4: Check Payment ID

**Required:** Payment ID must be filled and unique.

**Your entry:**
- ✅ Payment ID: `pv-102` (Good!)
- ✅ Customer Name: `Ajeet` (Good!)
- ✅ Amount: `200` (Good!)
- ✅ Currency: `GBP` (Good!)
- ⚠️ Timestamp: `2025-11-07T15:06:23+05:30` (Works, but see below)
- ⚠️ Status: `paid` (Should be "Processed" or any text - this is OK)

---

### Step 5: Check Backend Console

**After adding entry, check console for:**

**Success messages:**
```
📊 Found 1 new payment(s) in Google Sheet
📧 Processing new payment from sheet: pv-102
✅ WhatsApp notification sent for manual entry: pv-102
```

**Error messages:**
```
❌ Error monitoring Google Sheets: [error message]
❌ Failed to send WhatsApp for pv-102: [error message]
```

---

### Step 6: Check Twilio Configuration

**If Twilio is configured:**
- Check `server/.env` has correct credentials
- Verify `TWILIO_TO_NUMBER` is correct
- Check Twilio dashboard for message logs

**If Twilio is NOT configured:**
- System runs in mock mode
- Check console for: `📱 [MOCK] WhatsApp Alert`
- No actual WhatsApp message will be sent

---

## 🛠️ Common Issues & Solutions

### Issue 1: "Sheet monitoring not started"

**Symptoms:**
- Console doesn't show "Started monitoring Google Sheets"

**Solution:**
1. Check `server/.env`:
   ```env
   ENABLE_SHEET_MONITORING=true
   SHEET_MONITOR_INTERVAL=30
   ```
2. Restart server:
   ```bash
   cd server
   npm start
   ```

---

### Issue 2: "Entry added before server started"

**Symptoms:**
- Entry exists in sheet
- No notification received
- Console shows: "Skipping old payment"

**Solution:**
1. **Option A:** Delete and re-add the entry (after server is running)
2. **Option B:** Add a NEW entry with different Payment ID
3. **Option C:** Wait for next monitoring cycle (30 seconds)

---

### Issue 3: "Invalid timestamp format"

**Symptoms:**
- Console shows: "Invalid timestamp" or "Error parsing timestamp"

**Solution:**
1. Use recommended formula:
   ```
   =CONCATENATE(TEXT(NOW(),"yyyy-mm-dd"),"T",TEXT(NOW(),"HH:MM:SS"),".000Z")
   ```
2. Or manually format as: `2025-11-07T15:06:23.000Z`
3. Replace `+05:30` with `.000Z`

---

### Issue 4: "WhatsApp not sending"

**Symptoms:**
- Console shows: "Processing new payment" but no WhatsApp

**Solution:**
1. Check Twilio credentials in `server/.env`
2. Verify `TWILIO_TO_NUMBER` format: `+1234567890`
3. Check Twilio account has WhatsApp enabled
4. Check console for error messages

---

### Issue 5: "Payment not detected"

**Symptoms:**
- Entry in sheet
- No console messages
- No processing

**Solution:**
1. Check Payment ID is not empty
2. Check Payment ID is not "Payment ID" (header)
3. Verify all required fields are filled
4. Check sheet permissions (service account has Editor access)

---

## 🧪 Test Steps

### Test 1: Verify Monitoring is Running

1. Start server
2. Check console for monitoring messages
3. Wait 30 seconds
4. Check console for monitoring cycle (should run every 30 seconds)

### Test 2: Add Test Entry

1. **Server must be running**
2. Add new row to Google Sheet:
   ```
   Payment ID: TEST-001
   Customer Name: Test Customer
   Amount: 100
   Currency: INR
   Timestamp: =CONCATENATE(TEXT(NOW(),"yyyy-mm-dd"),"T",TEXT(NOW(),"HH:MM:SS"),".000Z")
   Status: Processed
   ```
3. Wait 30 seconds
4. Check console for processing message
5. Check WhatsApp (or console for mock message)

### Test 3: Check Server Logs

**Watch console output:**
```bash
cd server
npm start
```

**Look for:**
- `📊 Found X new payment(s) in Google Sheet`
- `📧 Processing new payment from sheet: [ID]`
- `✅ WhatsApp notification sent`

---

## 📝 Fix Your Current Entry

### Option 1: Update Timestamp

1. Open Google Sheet
2. Click on Timestamp cell (E2)
3. Replace with formula:
   ```
   =CONCATENATE(TEXT(NOW(),"yyyy-mm-dd"),"T",TEXT(NOW(),"HH:MM:SS"),".000Z")
   ```
4. Or manually type: `2025-11-07T15:06:23.000Z`

### Option 2: Add New Entry

1. **Make sure server is running**
2. Add NEW row:
   ```
   Payment ID: pv-103
   Customer Name: Ajeet
   Amount: 200
   Currency: GBP
   Timestamp: =CONCATENATE(TEXT(NOW(),"yyyy-mm-dd"),"T",TEXT(NOW(),"HH:MM:SS"),".000Z")
   Status: Processed
   ```
3. Wait 30 seconds
4. Check for notification

---

## 🎯 Quick Fix for Your Entry

**Your current entry:**
- Payment ID: `pv-102` ✅
- Timestamp: `2025-11-07T15:06:23+05:30` ⚠️

**Quick fix:**
1. **Make sure server is running**
2. Update Timestamp cell to use formula:
   ```
   =CONCATENATE(TEXT(NOW(),"yyyy-mm-dd"),"T",TEXT(NOW(),"HH:MM:SS"),".000Z")
   ```
3. Or change to: `2025-11-07T15:06:23.000Z`
4. Wait 30 seconds
5. Check console and WhatsApp

**Or add a NEW entry** (easier):
1. Add row with Payment ID: `pv-103`
2. Use formula for timestamp
3. Wait for notification

---

## 📊 Debug Mode

**To see detailed logs, check console for:**
- Sheet monitoring initialization
- New payment detection
- Timestamp parsing
- WhatsApp sending status

**Example console output:**
```
📊 Sheet monitoring initialized. Current payments: 1
💡 Monitoring will detect new entries added after this point.
📊 Found 1 new payment(s) in Google Sheet
📧 Processing new payment from sheet: pv-102
   Timestamp: 2025-11-07T15:06:23+05:30 (parsed: 2025-11-07T09:36:23.000Z)
   Customer: Ajeet, Amount: 200 GBP
✅ WhatsApp notification sent for manual entry: pv-102
```

---

## ✅ Success Indicators

**You'll know it's working when you see:**
- ✅ Console shows "Processing new payment"
- ✅ Console shows "WhatsApp notification sent"
- ✅ WhatsApp message received (or mock message in console)
- ✅ Dashboard shows the payment

---

## 🆘 Still Not Working?

1. **Restart server:**
   ```bash
   cd server
   npm start
   ```

2. **Add NEW entry** (with server running)

3. **Check console logs** for errors

4. **Verify `.env` configuration:**
   ```env
   ENABLE_SHEET_MONITORING=true
   SHEET_MONITOR_INTERVAL=30
   ```

5. **Check Google Sheets permissions:**
   - Service account has Editor access
   - Sheet ID is correct

---

**🎯 Most Common Issue:** Entry was added before server started. Solution: Add a NEW entry after server is running!

