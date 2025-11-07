# ✅ Status Condition Guide: WhatsApp Notifications Only for "Paid" Status

## 📋 Overview

The system now sends WhatsApp notifications **ONLY** when the payment status is **"paid"** or **"processed"**.

---

## ✅ Status Values That Trigger Notification

The following status values will trigger WhatsApp notifications (case-insensitive):

- ✅ **"paid"** - Will send notification
- ✅ **"process"** - Will send notification  
- ✅ **"processed"** - Will send notification
- ✅ **"Paid"** - Will send notification (case-insensitive)
- ✅ **"PAID"** - Will send notification (case-insensitive)

---

## ❌ Status Values That DON'T Trigger Notification

The following status values will **NOT** trigger WhatsApp notifications:

- ❌ **"pending"** - No notification
- ❌ **"pending payment"** - No notification
- ❌ **"unpaid"** - No notification
- ❌ **"cancelled"** - No notification
- ❌ **"failed"** - No notification
- ❌ **Empty/blank** - No notification
- ❌ **Any other value** - No notification

---

## 📝 How It Works

### Step 1: Entry Added to Sheet

When you add a new entry to Google Sheet:

```
Payment ID: pv-102
Customer Name: Ajeet
Amount: 200
Currency: GBP
Timestamp: 2025-11-07T15:06:23+05:30
Status: paid  ← This is checked!
```

### Step 2: System Checks Status

The monitoring service checks:
- ✅ Is status "paid" or "processed"? → **Send WhatsApp**
- ❌ Is status anything else? → **Skip, no notification**

### Step 3: Console Output

**If Status is "paid":**
```
📧 Processing new payment from sheet: pv-102
   Status: paid (✅ Paid - will send notification)
   Customer: Ajeet, Amount: 200 GBP
✅ WhatsApp notification sent for manual entry: pv-102
```

**If Status is NOT "paid":**
```
⏭️ Skipping payment pv-102: Status is "pending" (only "paid"/"processed" triggers notification)
```

---

## 🧪 Testing Examples

### Example 1: Status = "paid" ✅

**Sheet Entry:**
```
Payment ID: TEST-001
Customer Name: John Doe
Amount: 1000
Currency: INR
Timestamp: 2025-01-15T10:30:00.000Z
Status: paid
```

**Result:** ✅ WhatsApp notification **WILL BE SENT**

---

### Example 2: Status = "pending" ❌

**Sheet Entry:**
```
Payment ID: TEST-002
Customer Name: Jane Smith
Amount: 2000
Currency: USD
Timestamp: 2025-01-15T10:30:00.000Z
Status: pending
```

**Result:** ❌ WhatsApp notification **WILL NOT BE SENT**

---

### Example 3: Status = "processed" ✅

**Sheet Entry:**
```
Payment ID: TEST-003
Customer Name: Bob Johnson
Amount: 500
Currency: EUR
Timestamp: 2025-01-15T10:30:00.000Z
Status: processed
```

**Result:** ✅ WhatsApp notification **WILL BE SENT**

---

### Example 4: Status = Empty ❌

**Sheet Entry:**
```
Payment ID: TEST-004
Customer Name: Alice Brown
Amount: 750
Currency: INR
Timestamp: 2025-01-15T10:30:00.000Z
Status: [empty]
```

**Result:** ❌ WhatsApp notification **WILL NOT BE SENT**

---

## 📊 Complete Example

### Google Sheet Setup

| Payment ID | Customer Name | Amount | Currency | Timestamp | Status |
|------------|---------------|--------|----------|-----------|--------|
| pv-101 | Customer A | 500 | INR | 2025-01-15T10:00:00.000Z | pending |
| pv-102 | Customer B | 1000 | USD | 2025-01-15T10:30:00.000Z | paid |
| pv-103 | Customer C | 750 | EUR | 2025-01-15T11:00:00.000Z | unpaid |
| pv-104 | Customer D | 2000 | GBP | 2025-01-15T11:30:00.000Z | paid |

**Result:**
- ✅ pv-102: WhatsApp sent (Status = "paid")
- ✅ pv-104: WhatsApp sent (Status = "paid")
- ❌ pv-101: No WhatsApp (Status = "pending")
- ❌ pv-103: No WhatsApp (Status = "unpaid")

---

## 🔄 Changing Status to Trigger Notification

### Scenario: Update Status from "pending" to "paid"

1. **Initial Entry:**
   ```
   Status: pending  ← No notification
   ```

2. **Update Status:**
   ```
   Status: paid  ← Notification will be sent!
   ```

3. **Wait 30 seconds** (monitoring cycle)

4. **Result:** ✅ WhatsApp notification sent

---

## 💡 Best Practices

### 1. Use Consistent Status Values

**Recommended:**
- ✅ Use **"paid"** for completed payments
- ✅ Use **"processed"** as alternative
- ❌ Avoid variations like "Paid", "PAID", "payed" (though "paid" works case-insensitive)

### 2. Update Status When Payment Received

**Workflow:**
1. Add entry with Status: "pending"
2. When payment received, update Status: "paid"
3. System automatically sends WhatsApp notification

### 3. Check Console for Status

**Console shows:**
- ✅ "Status: paid (✅ Paid - will send notification)" → Notification sent
- ❌ "Status is 'pending' (only 'paid'/'processed' triggers notification)" → No notification

---

## 🛠️ Configuration

The status condition is **hardcoded** in the system. Currently supports:

- `paid` (case-insensitive)
- `process` (case-insensitive)
- `processed` (case-insensitive)

**To change supported statuses**, edit `server/services/sheetMonitor.js`:

```javascript
const isPaid = status === 'paid' || 
               status === 'process' || 
               status === 'processed' ||
               status === 'your-custom-status'; // Add your custom status
```

---

## 🔍 Troubleshooting

### Problem: Notification not sent even though Status is "paid"

**Solutions:**
1. ✅ Check Status spelling: "paid" not "payed" or "pay"
2. ✅ Check for extra spaces: "paid " or " paid" won't work
3. ✅ Check case: "Paid", "PAID", "paid" all work (case-insensitive)
4. ✅ Check console for status check message
5. ✅ Verify entry was added AFTER server started

### Problem: Notification sent when Status is not "paid"

**Solutions:**
1. ✅ Check console for status value
2. ✅ Verify Status column has correct value
3. ✅ Check for typos or hidden characters

### Problem: Want to add more status values

**Solution:**
Edit `server/services/sheetMonitor.js` and add your status:

```javascript
const isPaid = status === 'paid' || 
               status === 'process' || 
               status === 'processed' ||
               status === 'completed' ||  // Add this
               status === 'success';      // Add this
```

---

## 📝 Summary

| Status | WhatsApp Sent? |
|--------|---------------|
| `paid` | ✅ Yes |
| `Paid` | ✅ Yes |
| `PAID` | ✅ Yes |
| `processed` | ✅ Yes |
| `process` | ✅ Yes |
| `pending` | ❌ No |
| `unpaid` | ❌ No |
| `cancelled` | ❌ No |
| `failed` | ❌ No |
| Empty | ❌ No |

---

## ✅ Quick Checklist

- [ ] Status column has value "paid" or "processed"
- [ ] Status is spelled correctly (case doesn't matter)
- [ ] Server is running
- [ ] Entry was added after server started
- [ ] Wait 30 seconds for monitoring cycle
- [ ] Check console for status confirmation

---

**🎯 Remember: Only entries with Status = "paid" or "processed" will trigger WhatsApp notifications!**

