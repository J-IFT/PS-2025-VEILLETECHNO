// /api/proxy.js
const fetch = require('node-fetch');

export default async function handler(req, res) {
  const { method, body } = req;
  const targetUrl = `https://www.reddit.com${req.url}`;

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
      },
      body: method === 'POST' || method === 'PUT' ? JSON.stringify(body) : null,
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
