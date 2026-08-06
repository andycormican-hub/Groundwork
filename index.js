const express = require('express');
const https = require('https');
const app = express();
app.use('/stripe-webhook', express.raw({type: 'application/json'}));
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

app.post('/save-user', (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbKey) return res.status(500).json({ error: 'No Supabase key' });

  const payload = JSON.stringify({
    email: req.body.email,
    name: req.body.name,
    avatar: req.body.avatar || '🏔️',
    building: req.body.building || 'Building something real',
    streak: 0,
    tier: 'free'
  });

  const options = {
    hostname: 'jfenghwapvzvnowifsut.supabase.co',
    path: '/rest/v1/Users',
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
      console.log('User saved:', apiRes.statusCode, data);
      res.json({ success: true });
    });
  });

  apiReq.on('error', (err) => {
    console.error('Save user error:', err.message);
    res.status(500).json({ error: err.message });
  });

  apiReq.write(payload);
  apiReq.end();
});

app.post('/save-conversation', (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbKey) return res.status(500).json({ error: 'No Supabase key' });

  const payload = JSON.stringify({
    user_id: req.body.user_id || null,
    role: req.body.role,
    content: req.body.content
  });

  const options = {
    hostname: 'jfenghwapvzvnowifsut.supabase.co',
    path: '/rest/v1/conversations',
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
      console.log('Conversation saved:', apiRes.statusCode);
      res.json({ success: true });
    });
  });

  apiReq.on('error', (err) => {
    console.error('Save conversation error:', err.message);
    res.status(500).json({ error: err.message });
  });

  apiReq.write(payload);
  apiReq.end();
});

app.post('/save-message', (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbKey) return res.status(500).json({ error: 'No Supabase key' });

  const payload = JSON.stringify({
    user_id: req.body.user_id || null,
    username: req.body.username || 'Anonymous',
    avatar: req.body.avatar || '🏔️',
    content: req.body.content,
    room: req.body.room || 'general'
  });

  const options = {
    hostname: 'jfenghwapvzvnowifsut.supabase.co',
    path: '/rest/v1/messages',
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
      console.log('Message saved:', apiRes.statusCode);
      res.json({ success: true });
    });
  });

  apiReq.on('error', (err) => {
    console.error('Save message error:', err.message);
    res.status(500).json({ error: err.message });
  });

  apiReq.write(payload);
  apiReq.end();
});

app.get('/get-messages', (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbKey) return res.status(500).json({ error: 'No Supabase key' });

  const room = req.query.room || 'general';

  const options = {
    hostname: 'jfenghwapvzvnowifsut.supabase.co',
    path: `/rest/v1/messages?select=*&room=eq.${encodeURIComponent(room)}&order=created_at.asc&limit=100`,
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
      console.log('Get messages status:', apiRes.statusCode);
      res.header('Content-Type', 'application/json');
      res.send(data);
    });
  });

  apiReq.on('error', (err) => {
    console.error('Get messages error:', err.message);
    res.status(500).json({ error: err.message });
  });

  apiReq.end();
});

// ══ CONNECT & DM ROUTES ══

function sbRequest(method, path, body, sbKey) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'jfenghwapvzvnowifsut.supabase.co',
      path: `/rest/v1/${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': sbKey,
        'Authorization': 'Bearer ' + sbKey,
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

// Helper to get user profile by auth user id
async function getUserProfile(userId, sbKey) {
  try {
    const result = await sbRequest('GET', `Users?select=name,avatar,email&email=eq.${encodeURIComponent(userId)}`, null, sbKey);
    if (result.data && result.data.length > 0) return result.data[0];
    return { name: 'A builder', avatar: '🏔️' };
  } catch(err) {
    return { name: 'A builder', avatar: '🏔️' };
  }
}

// Get a suggested connection based on shared pillar
app.get('/get-suggestion', async (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  const { user_id, pillar } = req.query;
  if (!sbKey || !user_id) return res.status(400).json({ error: 'Missing params' });
  try {
    const result = await sbRequest('GET',
      `Users?select=*&limit=20`,
      null, sbKey);
    const conns = await sbRequest('GET',
      `connections?select=*&or=(requester_id.eq.${user_id},recipient_id.eq.${user_id})`,
      null, sbKey);
    const connectedIds = (conns.data || []).flatMap(c => [c.requester_id, c.recipient_id]);
    const suggestions = (result.data || []).filter(u =>
      u.id !== user_id &&
      u.email !== user_id &&
      !connectedIds.includes(u.id) &&
      !connectedIds.includes(u.email)
    );
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)] || null;
    res.json(suggestion);
  } catch(err) {
    console.error('Get suggestion error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Send a connection request
app.post('/send-connection-request', async (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  const { requester_id, recipient_id, opener, pillar, requester_name, requester_avatar } = req.body;
  if (!sbKey || !requester_id || !recipient_id) return res.status(400).json({ error: 'Missing params' });
  try {
    const result = await sbRequest('POST', 'connections', {
      requester_id,
      recipient_id,
      opener,
      pillar,
      status: 'pending',
      requester_name: requester_name || 'A builder',
      requester_avatar: requester_avatar || '🏔️'
    }, sbKey);
    console.log('Connection request sent:', result.status);
    res.json({ success: true });
  } catch(err) {
    console.error('Send connection error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get pending incoming requests
app.get('/get-pending-requests', async (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  const { user_id } = req.query;
  if (!sbKey || !user_id) return res.status(400).json({ error: 'Missing params' });
  try {
    const result = await sbRequest('GET',
      `connections?select=*&recipient_id=eq.${encodeURIComponent(user_id)}&status=eq.pending`,
      null, sbKey);
    res.json(result.data || []);
  } catch(err) {
    console.error('Get pending error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Respond to a connection request
app.post('/respond-connection', async (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  const { connection_id, status } = req.body;
  if (!sbKey || !connection_id) return res.status(400).json({ error: 'Missing params' });
  try {
    const payload = JSON.stringify({ status });
    const options = {
      hostname: 'jfenghwapvzvnowifsut.supabase.co',
      path: `/rest/v1/connections?id=eq.${connection_id}`,
      method: 'PATCH',
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
        console.log('Connection response:', apiRes.statusCode);
        res.json({ success: true });
      });
    });
    apiReq.on('error', (err) => res.status(500).json({ error: err.message }));
    apiReq.write(payload);
    apiReq.end();
  } catch(err) {
    console.error('Respond connection error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get accepted connections with partner names
app.get('/get-connections', async (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  const { user_id } = req.query;
  if (!sbKey || !user_id) return res.status(400).json({ error: 'Missing params' });
  try {
    const result = await sbRequest('GET',
      `connections?select=*&or=(requester_id.eq.${user_id},recipient_id.eq.${user_id})&status=eq.accepted`,
      null, sbKey);
    const connections = result.data || [];

    // Enrich with partner names
    const enriched = await Promise.all(connections.map(async (c) => {
      const partnerId = c.requester_id === user_id ? c.recipient_id : c.requester_id;
      const partnerProfile = await getUserProfile(partnerId, sbKey);
      return {
        ...c,
        partner_id: partnerId,
        partner_name: partnerProfile.name || 'A builder',
        partner_avatar: partnerProfile.avatar || '🏔️'
      };
    }));

    res.json(enriched);
  } catch(err) {
    console.error('Get connections error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Send a direct message
app.post('/send-dm', async (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  const { connection_id, sender_id, content, sender_name, sender_avatar } = req.body;
  if (!sbKey || !connection_id || !sender_id || !content) return res.status(400).json({ error: 'Missing params' });
  try {
    const result = await sbRequest('POST', 'direct-messages', {
      connection_id,
      sender_id,
      content,
      sender_name: sender_name || 'A builder',
      sender_avatar: sender_avatar || '🏔️',
      read: false
    }, sbKey);
    console.log('DM sent:', result.status);
    res.json({ success: true });
  } catch(err) {
    console.error('Send DM error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get DMs for a connection
app.get('/get-dms', async (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  const { connection_id } = req.query;
  if (!sbKey || !connection_id) return res.status(400).json({ error: 'Missing params' });
  try {
    const result = await sbRequest('GET',
      `direct-messages?select=*&connection_id=eq.${encodeURIComponent(connection_id)}&order=created_at.asc&limit=100`,
      null, sbKey);
    res.json(result.data || []);
  } catch(err) {
    console.error('Get DMs error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
// ══ STRIPE WEBHOOK ══
app.post('/stripe-webhook', async (req, res) => {
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(500).json({ error: 'No webhook secret' });

  const signature = req.headers['stripe-signature'];
  let event;
  try {
    const crypto = require('crypto');
    const elements = signature.split(',');
    const timestamp = elements.find(e => e.startsWith('t=')).split('=')[1];
    const sigV1 = elements.find(e => e.startsWith('v1=')).split('=')[1];
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(`${timestamp}.${req.body}`);
    if (hmac.digest('hex') !== sigV1) return res.status(400).json({ error: 'Invalid signature' });
    event = JSON.parse(req.body);
  } catch(err) {
    return res.status(400).json({ error: err.message });
  }

  console.log('Stripe event:', event.type);

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const sub = event.data.object;
    const email = sub.customer_email || '';
    const priceId = sub.items?.data?.[0]?.price?.id || '';
    const tier = priceId.includes('plus') ? 'premium_plus' : 'premium';

    if (sub.status === 'active' && email) {
      const payload = JSON.stringify({ tier });
      const options = {
        hostname: 'jfenghwapvzvnowifsut.supabase.co',
        path: `/rest/v1/Users?email=eq.${encodeURIComponent(email)}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sbKey,
          'Authorization': 'Bearer ' + sbKey,
          'Prefer': 'return=minimal',
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const apiReq = https.request(options, (apiRes) => {
        apiRes.on('data', () => {});
        apiRes.on('end', () => console.log(`${email} updated to ${tier}:`, apiRes.statusCode));
      });
      apiReq.on('error', err => console.error('Tier update error:', err.message));
      apiReq.write(payload);
      apiReq.end();
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const email = event.data.object.customer_email || '';
    if (email) {
      const payload = JSON.stringify({ tier: 'free' });
      const options = {
        hostname: 'jfenghwapvzvnowifsut.supabase.co',
        path: `/rest/v1/Users?email=eq.${encodeURIComponent(email)}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sbKey,
          'Authorization': 'Bearer ' + sbKey,
          'Prefer': 'return=minimal',
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const apiReq = https.request(options, (apiRes) => {
        apiRes.on('data', () => {});
        apiRes.on('end', () => console.log(`${email} downgraded to free:`, apiRes.statusCode));
      });
      apiReq.on('error', err => console.error('Downgrade error:', err.message));
      apiReq.write(payload);
      apiReq.end();
    }
  }

  res.json({ received: true });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Chris is running on port ' + PORT));
