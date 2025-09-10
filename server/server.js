import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const API = 'https://api.tomorrow.io/v4/timelines';
const KEY = process.env.TOMORROW_API_KEY;

if (!KEY) {
  console.error('Missing TOMORROW_API_KEY in .env');
  process.exit(1);
}

app.get('/api', async (req, res) => {
  try {
    const upstream = new URL(API);
    upstream.search = new URL(req.url, 'http://localhost').search;

    
    const r = await fetch(upstream, {
      headers: { apikey: KEY, Accept: 'application/json' }
    });

    res.set('Cache-Control', 'public, max-age=120');
    res.status(r.status).send(await r.text());
  } catch (e) {
    res.status(500).json({ message: 'Proxy error', detail: String(e) });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Proxy listening on http://localhost:${PORT}/api`);
});
