const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const webhookController = require('./controllers/webhookController');
const logsController = require('./controllers/logsController');
const dashboardController = require('./controllers/dashboardController');
const sheetMonitor = require('./services/sheetMonitor');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONITOR_INTERVAL = parseInt(process.env.SHEET_MONITOR_INTERVAL, 10) || 30; // Check every 30 seconds
const isServerless = Boolean(process.env.VERCEL || process.env.SERVERLESS);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/webhook', webhookController.handleWebhook);
app.get('/logs', logsController.getLogs);
app.get('/dashboard', dashboardController.getSummary);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

function startSheetMonitor() {
  if (isServerless) {
    console.log('�s���? Sheet monitoring disabled in serverless environments.');
    return;
  }

  // Start monitoring Google Sheets for manual entries (after a delay to ensure sheets are initialized)
  setTimeout(() => {
    if (process.env.ENABLE_SHEET_MONITORING !== 'false') {
      sheetMonitor.startMonitoring(MONITOR_INTERVAL);
      console.log(`�Y"S Sheet monitoring enabled (checking every ${MONITOR_INTERVAL} seconds)`);
      console.log('�Y\'� Manual sheet entries will trigger WhatsApp notifications!');
    } else {
      console.log('�s���? Sheet monitoring disabled (set ENABLE_SHEET_MONITORING=false to disable)');
    }
  }, 5000); // Wait 5 seconds for sheets to initialize
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`�Ys? Server running on port ${PORT}`);
    console.log(`�Y"S Health check: http://localhost:${PORT}/health`);
    console.log(`�Y"� Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log(`�Y"< Logs endpoint: http://localhost:${PORT}/logs`);
  });
  startSheetMonitor();
}

if (require.main === module) {
  startServer();
} else if (!isServerless) {
  startSheetMonitor();
}

module.exports = app;
