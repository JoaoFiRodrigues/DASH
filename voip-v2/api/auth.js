module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-upload-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const key      = req.headers['x-upload-key'];
  const expected = process.env.UPLOAD_KEY;

  if (!expected) return res.status(500).json({ ok: false, error: 'UPLOAD_KEY not set' });
  if (key === expected) return res.status(200).json({ ok: true });
  return res.status(401).json({ ok: false });
};
