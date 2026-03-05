import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { blobs } = await list({ prefix: 'excels/' });

    const files = blobs.map(b => ({
      url:       b.url,
      filename:  b.pathname.replace('excels/', ''),
      size:      b.size,
      uploadedAt: b.uploadedAt,
    }));

    // Sort newest first
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return res.status(200).json({ files });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
