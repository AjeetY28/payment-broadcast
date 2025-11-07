# 📝 Manual Sheet Entry Guide

## Can I Manually Add Data to Google Sheet?

**Yes!** The system now supports manual entries with automatic notifications.

---

## ✅ What Happens When You Manually Add Data?

### 1. **UI Dashboard** ✅
- **Will Update**: Yes, automatically!
- **When**: Within 5 seconds (auto-refresh)
- **How**: Dashboard reads from `/logs` endpoint which pulls from Google Sheets

### 2. **WhatsApp Notification** ✅
- **Will Send**: Yes, automatically!
- **When**: Within 30 seconds (monitoring interval)
- **How**: Background service detects new entries and sends notification

---

## 🚀 How It Works

```
Manual Entry in Google Sheet
         ↓
Background Monitor (checks every 30 seconds)
         ↓
Detects New Row
         ↓
Sends WhatsApp Notification
         ↓
UI Shows Updated Data (on next refresh)
```

---

## 📋 Steps to Test Manual Entry

### Step 1: Ensure Monitoring is Enabled

Check your `server/.env` file:
```env
ENABLE_SHEET_MONITORING=true
SHEET_MONITOR_INTERVAL=30
```

### Step 2: Start Server

```bash
cd server
npm start
```

You should see:
```
✅ Started monitoring Google Sheets (checking every 30 seconds)
💡 Manual sheet entries will trigger WhatsApp notifications!
```

### Step 3: Manually Add Data to Google Sheet

1. Open your Google Sheet
2. Add a new row with this format:

| Payment ID | Customer Name | Amount | Currency | Timestamp | Status |
|------------|---------------|--------|----------|-----------|--------|
| INV-9999 | Test Customer | 5000 | INR | **Use Formula Below** | Processed |

**Important Fields:**
- **Payment ID**: Unique identifier (e.g., INV-9999)
- **Customer Name**: Customer name
- **Amount**: Payment amount (number)
- **Currency**: INR, USD, etc.
- **Timestamp**: **Use this formula for current India time:**
  ```
  =CONCATENATE(TEXT(NOW(),"yyyy-mm-dd"),"T",TEXT(NOW(),"HH:MM:SS"),".000Z")
  ```
- **Status**: Processed (or any text)

**Quick Formula for Timestamp (Copy-Paste):**
```
=CONCATENATE(TEXT(NOW(),"yyyy-mm-dd"),"T",TEXT(NOW(),"HH:MM:SS"),".000Z")
```

See `GOOGLE_SHEETS_TIMESTAMP_FORMULA.md` for more timestamp formulas.

### Step 4: Wait and Check

**Within 30 seconds:**
- ✅ WhatsApp notification will be sent
- ✅ Backend console will show: `📧 Processing new payment from sheet: INV-9999`

**Within 5 seconds:**
- ✅ Dashboard UI will show the new payment (auto-refresh)

---

## 🔧 Configuration

### Enable/Disable Monitoring

In `server/.env`:
```env
# Enable monitoring (default: true)
ENABLE_SHEET_MONITORING=true

# Disable monitoring
ENABLE_SHEET_MONITORING=false
```

### Change Check Interval

In `server/.env`:
```env
# Check every 30 seconds (default)
SHEET_MONITOR_INTERVAL=30

# Check every 60 seconds (1 minute)
SHEET_MONITOR_INTERVAL=60

# Check every 10 seconds (more frequent)
SHEET_MONITOR_INTERVAL=10
```

---

## ⚠️ Important Notes

### 1. **Timestamp Format**
- Use ISO format: `2024-01-01T12:00:00.000Z`
- Or current time: `new Date().toISOString()` (if using Google Sheets formula)
- System only processes entries from last 10 minutes

### 2. **Duplicate Prevention**
- System tracks last processed row count
- Only new rows trigger notifications
- Webhook entries are processed separately (won't trigger duplicate notifications)

### 3. **Required Fields**
- **Payment ID**: Must be unique and not empty
- **Customer Name**: Required
- **Amount**: Must be a number
- **Currency**: Optional (defaults to INR)
- **Timestamp**: Required for proper processing

### 4. **Status Field**
- Can be any text
- Doesn't affect notification sending
- Used for display purposes

---

## 🧪 Testing Manual Entry

### Quick Test:

1. **Open Google Sheet**
2. **Add this row:**
   ```
   Payment ID: TEST-001
   Customer Name: Manual Test
   Amount: 9999
   Currency: INR
   Timestamp: =CONCATENATE(TEXT(NOW(),"yyyy-mm-dd"),"T",TEXT(NOW(),"HH:MM:SS"),".000Z")
   Status: Processed
   ```
   
   **Or use simpler formula:**
   ```
   Timestamp: =TEXT(NOW(),"yyyy-mm-ddTHH:MM:SS.000Z")
   ```

3. **Wait 30 seconds**
4. **Check:**
   - ✅ Backend console shows processing message
   - ✅ WhatsApp notification received
   - ✅ Dashboard shows new payment

---

## 📊 Example: Using Google Sheets Formula for Timestamp (India Time)

Instead of typing timestamp manually, use this formula in the Timestamp column:

**Recommended Formula (Copy-Paste):**
```
=CONCATENATE(TEXT(NOW(),"yyyy-mm-dd"),"T",TEXT(NOW(),"HH:MM:SS"),".000Z")
```

**Simpler Alternative:**
```
=TEXT(NOW(),"yyyy-mm-ddTHH:MM:SS.000Z")
```

This automatically generates the current timestamp in ISO format using India timezone.

**For more timestamp formulas and examples, see:** `GOOGLE_SHEETS_TIMESTAMP_FORMULA.md`

---

## 🔍 Troubleshooting

### Problem: WhatsApp not sending for manual entry

**Solutions:**
1. ✅ Check `ENABLE_SHEET_MONITORING=true` in `.env`
2. ✅ Restart server after changing `.env`
3. ✅ Check backend console for monitoring messages
4. ✅ Verify timestamp is recent (within last 10 minutes)
5. ✅ Check Payment ID is not empty

### Problem: UI not showing manual entry

**Solutions:**
1. ✅ Wait 5 seconds for auto-refresh
2. ✅ Click Refresh button manually
3. ✅ Check backend `/logs` endpoint returns the data
4. ✅ Verify data format is correct

### Problem: Duplicate notifications

**Solutions:**
1. ✅ System prevents duplicates automatically
2. ✅ Webhook entries won't trigger monitoring
3. ✅ Only truly new rows trigger notifications

---

## 💡 Best Practices

1. **Use Consistent Format**: Always use same format for Payment ID
2. **Valid Timestamps**: Use ISO format or Google Sheets formula
3. **Unique IDs**: Don't reuse Payment IDs
4. **Valid Amounts**: Use numbers only (no commas or currency symbols)
5. **Monitor Console**: Watch backend console for processing messages

---

## 🎯 Summary

| Feature | Manual Entry Support |
|---------|---------------------|
| **UI Display** | ✅ Yes (auto-refresh) |
| **WhatsApp Notification** | ✅ Yes (monitoring service) |
| **Google Sheets Logging** | ✅ Yes (direct entry) |
| **Real-time Updates** | ✅ Yes (within 30 seconds) |

**✅ You can now manually add data to Google Sheet and get WhatsApp notifications automatically!**

---

## 📝 Example Manual Entry

```
Row 2:
Payment ID: MANUAL-001
Customer Name: John Doe
Amount: 5000
Currency: INR
Timestamp: 2024-01-15T10:30:00.000Z
Status: Processed
```

**Result:**
- ✅ WhatsApp notification sent within 30 seconds
- ✅ Dashboard shows payment within 5 seconds
- ✅ All features work as expected!

---

**🎉 Happy Manual Entry!**

