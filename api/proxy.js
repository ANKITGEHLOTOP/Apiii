// pages/api/proxy.js
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  // 🔑 ONLY API — change this line if API ever changes
  const API_URL = `https://playerrr-ad12cb2ab395.herokuapp.com/api/process?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(API_URL);

    // Forward headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Safe CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Upstream error: ${response.status}`,
      });
    }

    // Most likely JSON — but handle safely
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      const text = await response.text();
      return res.status(200).send(text);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Upstream API unreachable' });
  }
}
