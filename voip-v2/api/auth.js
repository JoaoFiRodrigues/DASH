export default async function handler(req, res) {
  // Allow CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-upload-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const key = req.headers['x-upload-key'];
  const expected = process.env.UPLOAD_KEY;

  if (!expected) {
    // Variable not set — return config error, not auth error
    return res.status(500).json({ ok: false, error: 'UPLOAD_KEY not configured' });
  }

  if (key === expected) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false });
}
