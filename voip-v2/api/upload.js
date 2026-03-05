const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-upload-key, x-filename, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = req.headers['x-upload-key'];
  if (key !== process.env.UPLOAD_KEY) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    if (!buffer.length) return res.status(400).json({ error: 'Empty file' });

    const filename = decodeURIComponent(req.headers['x-filename'] || `upload-${Date.now()}.xlsx`)
      .replace(/[^\w.\- ]/g, '_');

    const blob = await put(`excels/${filename}`, buffer, {
      access: 'public',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      addRandomSuffix: false,
    });

    return res.status(200).json({ success: true, url: blob.url, filename });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
