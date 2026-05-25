const express = require('express');
const https = require('https');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'Chris is online', key: process.env.ANTHROPIC_KEY ? 'API key found' : 'NO API KEY FOUND' });
});

app.post('/', (req, res) => {
  const key = process.env.ANTHROPIC_KEY;

  if (!key) {
    console.error('ERROR: No ANTHROPIC_KEY found in environment');
    return res.status(500).json({ error: 'No API key configured' });
  }

  console.log('Received request, calling Anthropic...');
  console.log('Messages count:', req.body.messages ? req.body.messages.length : 0);

  const payload = JSON.stringify({
    model: 'claude-opus-4-5',
    max_tokens: 800,
    system: req.body.system,
    messages: req.body.messages
  });

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    console.log('Anthropic response status:', apiRes.statusCode);
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      console.log('Anthropic response received, length:', data.length);
      res.header('Content-Type', 'application/json');
      res.send(data);
    });
  });

  apiReq.on('error', (err) => {
    console.error('Anthropic API error:', err.message);
    res.status(500).json({ error: err.message });
  });

  apiReq.write(payload);
  apiReq.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Chris is running on port ${PORT}`));

