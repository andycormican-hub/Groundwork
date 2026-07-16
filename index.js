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

// Supabase helper
function supabaseRequest(method, path, body, key) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'jfenghwapvzvnowifsut.supabase.co',
      path: `/rest/v1/${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=representation'
      }
    };
    if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);
    const req = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => resolve({ status: apiRes.statusCode, data: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Chris route
app.get('/', (req, res) => {
  res.json({ status: 'Groundwork backend online' });
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

// Save post
app.post('/save-post', async (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbKey) return res.status(500).json({ error: 'No Supabase key' });
  try {
    const result = await supabaseRequest('POST', 'Posts', {
      user_id: req.body.user_id || null,
      content: req.body.content,
      avatar: req.body.avatar || '🏔️',
      username: req.body.username || 'Anonymous'
    }, sbKey);
    console.log('Post saved:', result.status);
    res.json({ success: true });
  } catch(err) {
    console.error('Save post error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get posts
app.get('/get-posts', async (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbKey) return res.status(500).json({ error: 'No Supabase key' });
  try {
    const result = await supabaseRequest('GET', 'Posts?order=created_at.desc&limit=50', null, sbKey);
    res.json(result.data || []);
  } catch(err) {
    console.error('Get posts error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Groundwork backend running on port ${PORT}`));
