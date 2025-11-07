# 💰 Plus Payment Alert System

A full-stack payment monitoring system that automatically sends WhatsApp alerts and logs payment details from Zoho Books into Google Sheets, with a dynamic dashboard UI for real-time monitoring.

## 🚀 Features

- **Zoho Books Integration**: Automatically receives invoice creation webhooks from Zoho Books
- **Multi-Organization Support**: Supports multiple Zoho Books organizations
  - Configure webhooks for each organization to the same `/webhook` URL; invoices from any org will send WhatsApp and be stored with Organization ID/Name
- **Webhook Integration**: Receives payment notifications from Zoho Books or manual entries
- **WhatsApp Alerts**: Instant notifications via Twilio WhatsApp API with invoice details (with mock mode fallback)
- **Google Sheets Logging**: Automatic logging to Google Sheets with invoice data (with CSV fallback)
- **Real-time Dashboard**: React-based dashboard with auto-refresh every 5 seconds
- **Payment History**: View all payments and invoices with filtering and statistics
- **Status-based Notifications**: Only sends WhatsApp when status is "paid" (Zoho `invoice.created` always sends invoice details)
- **Manual Entry Support**: Add entries manually to Google Sheets with automatic notifications
- **Lightweight & Deployable**: Ready for deployment on Vercel, Railway, or similar platforms

## 📁 Project Structure

```
Payment Boardcast/
├── server/                 # Backend (Node.js + Express)
│   ├── server.js          # Main Express server
│   ├── controllers/       # Route controllers
│   │   ├── webhookController.js
│   │   └── logsController.js
│   ├── services/          # External service integrations
│   │   ├── whatsapp.js    # Twilio WhatsApp service
│   │   └── sheets.js      # Google Sheets service
│   ├── utils/             # Utility functions
│   │   └── logger.js      # CSV logger fallback
│   ├── package.json
│   └── .env.example
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   └── PaymentList.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── logs/                  # CSV logs (auto-generated)
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Twilio account (optional - system works in mock mode without it)
- Google Cloud Project with Sheets API enabled (optional - CSV fallback available)

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment template
# Create a .env file with the following variables:
```

Create `server/.env` file:

```env
# Server Configuration
PORT=3001

# Twilio WhatsApp Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+14155238886
TWILIO_TO_NUMBER=+1234567890

# Google Sheets Configuration (optional)
SHEET_ID=your_google_sheet_id
GOOGLE_CREDS_PATH=./credentials/google-credentials.json
```

**Note**: If Twilio or Google Sheets credentials are not provided, the system will automatically use mock/fallback modes:
- WhatsApp: Mock mode (logs to console)
- Google Sheets: CSV file logging (`logs/payments.csv`)

### 2. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm start
```

The React app will start on `http://localhost:3000` and proxy API requests to `http://localhost:3001`.

### 3. Start Backend Server

```bash
# In the server directory
npm start

# Or for development with auto-reload
npm run dev
```

The backend server will start on `http://localhost:3001`.

## 📡 API Endpoints

### POST `/webhook`
Receives payment webhook from Zoho Books.

**Request Body:**
```json
{
  "payment_id": "INV-2304",
  "customer_name": "Riya Mehta",
  "amount": 1200,
  "currency": "INR",
  "status": "paid" // Only 'paid' triggers WhatsApp (except Zoho invoice.created)
}
```

**Response:**
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

### GET `/logs`
Returns all payment logs.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "payments": [
    {
      "payment_id": "INV-2304",
      "customer_name": "Riya Mehta",
      "amount": 1200,
      "currency": "INR",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "status": "Processed"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔧 Configuration

### Twilio WhatsApp Setup (Optional)

1. Sign up for a [Twilio account](https://www.twilio.com/)
2. Get a Twilio phone number with WhatsApp capability
3. Add your credentials to `.env`:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
   - `TWILIO_FROM_NUMBER`: Your Twilio WhatsApp number (format: +1234567890)
   - `TWILIO_TO_NUMBER`: Recipient WhatsApp number

**Note**: Without Twilio credentials, the system runs in mock mode and logs WhatsApp alerts to the console.

### Google Sheets Setup (Optional)

1. Create a [Google Cloud Project](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Create a Service Account and download credentials JSON
4. Create a Google Sheet and share it with the service account email
5. Add credentials to `.env`:
   - `SHEET_ID`: The ID from your Google Sheet URL
   - `GOOGLE_CREDS_PATH`: Path to your credentials JSON file

**Note**: Without Google Sheets credentials, the system automatically logs to `logs/payments.csv`.

## 🧪 Testing the Webhook

You can test the webhook endpoint using curl:

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

Or using a tool like Postman or Insomnia.

## 📊 Dashboard Features

- **Real-time Statistics**: Total payments, amounts, today's payments
- **Auto-refresh**: Automatically updates every 5 seconds
- **Payment History**: Table view with all payment details
- **Responsive Design**: Works on desktop and mobile devices
- **Live Status Indicator**: Shows connection status

## 🚀 Deployment

### Deploy Backend (Railway/Vercel)

1. **Railway**:
   - Connect your GitHub repository
   - Set environment variables in Railway dashboard
   - Deploy the `server` directory

2. **Vercel**:
   - Install Vercel CLI: `npm i -g vercel`
   - In the `server` directory: `vercel`
   - Set environment variables in Vercel dashboard

### Deploy Frontend (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. In the `client` directory: `vercel`
3. Update API URL in `client/src/App.js` if needed

**Note**: Remember to update the API endpoint URL in the frontend if deploying to different domains.

## 📝 Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `TWILIO_ACCOUNT_SID` | No | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | No | Twilio Auth Token |
| `TWILIO_FROM_NUMBER` | No | Twilio WhatsApp number |
| `TWILIO_TO_NUMBER` | No | Recipient WhatsApp number |
| `SHEET_ID` | No | Google Sheet ID |
| `GOOGLE_CREDS_PATH` | No | Path to Google credentials JSON |

## 🐛 Troubleshooting

1. **WhatsApp not sending**: Check Twilio credentials. System will use mock mode if credentials are missing.
2. **Sheets not updating**: Verify Google Sheets API is enabled and service account has access.
3. **Dashboard not loading**: Check that backend is running on port 3001 and CORS is enabled.
4. **CSV logging**: If Google Sheets is unavailable, check `logs/payments.csv` for payment records.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

## 🔔 Status-based Notifications

- Only sends WhatsApp when `status` is `paid` (case-insensitive).
- For Zoho Books `invoice.created` webhooks, the system sends an invoice summary WhatsApp message (invoice number, customer, amount, date) regardless of payment status.
- Manual webhooks may include `status`. If omitted, it defaults to `paid` for backward compatibility.

Example Zoho event payload snippet:

```json
{
  "event": { "type": "invoice.created" },
  "data": { "invoice": { "invoice_number": "INV-2304", "customer_name": "Riya", "total": 1200, "currency_code": "INR" } }
}
```
- Multi-Org: Invoices from any configured Zoho organization are accepted. Sheet stores `Organization ID` and `Organization Name` when present in the webhook payload.
