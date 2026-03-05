module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-upload-key, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const key = req.headers['x-upload-key'];
  if (key !== process.env.UPLOAD_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB token missing' });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
    if (!body.url) return res.status(400).json({ error: 'URL required' });

    const blobRes = await fetch('https://blob.vercel-storage.com/delete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls: [body.url] }),
    });

    if (!blobRes.ok) {
      const errText = await blobRes.text();
      return res.status(500).json({ error: `Blob error ${blobRes.status}: ${errText}` });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
