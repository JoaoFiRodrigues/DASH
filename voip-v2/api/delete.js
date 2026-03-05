import { del } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadKey = req.headers['x-upload-key'];
  if (uploadKey !== process.env.UPLOAD_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { url } = req.body ? JSON.parse(await readBody(req)) : {};
    if (!url) return res.status(400).json({ error: 'URL required' });

    await del(url);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}
