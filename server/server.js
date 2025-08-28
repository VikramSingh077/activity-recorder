import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars from .env if present
dotenv.config();

const app = express();

// Config from env
const PORT = process.env.PORT || 4000;
const LOG_PATH = process.env.LOG_PATH || '/var/log/browser-recorder/events.log';
const MAX_PAYLOAD_BYTES = parseInt(process.env.MAX_PAYLOAD_BYTES || '1048576', 10);

// Ensure log directory exists
fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });

// Middleware
app.use(helmet());
app.use(express.json({ limit: MAX_PAYLOAD_BYTES + 'b' }));
app.use(morgan('combined'));

// Simple CORS (extension → ingestor)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Ingest endpoint
app.post('/events', (req, res) => {
  const { source, ts, events } = req.body || {};
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'events array required' });
  }

  const line = JSON.stringify({
    receivedAt: Date.now(),
    source: source || 'unknown',
    ts: ts || null,
    count: events.length,
    events
  }) + '\n';

  try {
    fs.appendFileSync(LOG_PATH, line, { encoding: 'utf8' });
  } catch (err) {
    console.error('append failed', err);
    return res.status(500).json({ error: 'write_failed' });
  }

  res.json({ ok: true });
});

app.get('/', (req, res) => {
  res.type('text').send(
    [
      'Activity Recorder Ingestor',
      '',
      'Endpoints:',
      '  • GET  /health   -> {"ok": true}',
      '  • POST /events   -> append newline-delimited JSON to log',
      '',
      `LOG_PATH: ${LOG_PATH}`,
      ''
    ].join('\n')
  );
});


// Start server
app.listen(PORT, () => {
  console.log(`Ingestor listening on :${PORT}, logging to ${LOG_PATH}`);
});