const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const webhookController = require('./controllers/webhookController');
const logsController = require('./controllers/logsController');
const sheetMonitor = require('./services/sheetMonitor');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONITOR_INTERVAL = parseInt(process.env.SHEET_MONITOR_INTERVAL) || 30; // Check every 30 seconds

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/webhook', webhookController.handleWebhook);
app.get('/logs', logsController.getLogs);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📥 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`📋 Logs endpoint: http://localhost:${PORT}/logs`);
  
  // Start monitoring Google Sheets for manual entries (after a delay to ensure sheets are initialized)
  setTimeout(() => {
    if (process.env.ENABLE_SHEET_MONITORING !== 'false') {
      sheetMonitor.startMonitoring(MONITOR_INTERVAL);
      console.log(`📊 Sheet monitoring enabled (checking every ${MONITOR_INTERVAL} seconds)`);
      console.log(`💡 Manual sheet entries will trigger WhatsApp notifications!`);
    } else {
      console.log('⚠️ Sheet monitoring disabled (set ENABLE_SHEET_MONITORING=false to disable)');
    }
  }, 5000); // Wait 5 seconds for sheets to initialize
});

module.exports = app;

