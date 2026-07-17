const express = require('express');
const https = require('https');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'Chris is online' });
});

app.post('/', (req, res) => {
  const key = process.env.ANTHROPIC_KEY;
  if (!key) return res.status(500).json({ error: 'No API key configured' });

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
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      res.header('Content-Type', 'application/json');
      res.send(data);
    });
  });

  apiReq.on('error', (err) => res.status(500).json({ error: err.message }));
  apiReq.write(payload);
  apiReq.end();
});

app.post('/save-post', (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbKey) return res.status(500).json({ error: 'No Supabase key' });

  const payload = JSON.stringify({
    user_id: req.body.user_id || null,
    content: req.body.content,
    avatar: req.body.avatar || '🏔️',
    username: req.body.username || 'Anonymous'
  });

  const options = {
    hostname: 'jfenghwapvzvnowifsut.supabase.co',
    path: '/rest/v1/Posts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': sbKey,
      'Authorization': 'Bearer ' + sbKey,
      'Prefer': 'return=minimal',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      console.log('Supabase response:', apiRes.statusCode, data);
      res.json({ success: true, status: apiRes.statusCode });
    });
  });

  apiReq.on('error', (err) => {
    console.error('Supabase error:', err.message);
    res.status(500).json({ error: err.message });
  });

  apiReq.write(payload);
  apiReq.end();
});
app.get('/get-posts', (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbKey) return res.status(500).json({ error: 'No Supabase key' });

  const options = {
    hostname: 'jfenghwapvzvnowifsut.supabase.co',
    path: '/rest/v1/Posts?order=created_at.desc&limit=50',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': sbKey,
      'Authorization': 'Bearer ' + sbKey
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      console.log('Get posts status:', apiRes.statusCode);
      res.header('Content-Type', 'application/json');
      res.send(data);
    });
  });

  apiReq.on('error', (err) => {
    console.error('Get posts error:', err.message);
    res.status(500).json({ error: err.message });
  });

  apiReq.end();
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Chris is running on port ' + PORT));
