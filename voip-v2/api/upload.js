module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-upload-key, x-filename, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = req.headers['x-upload-key'];
  if (key !== process.env.UPLOAD_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB token missing' });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    if (!buffer.length) return res.status(400).json({ error: 'Empty file' });

    const filename = decodeURIComponent(req.headers['x-filename'] || `upload-${Date.now()}.xlsx`)
      .replace(/[^\w.\- ]/g, '_');

    // Use Vercel Blob REST API directly
    const blobRes = await fetch(`https://blob.vercel-storage.com/excels/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'x-content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'x-add-random-suffix': '0',
        'x-cache-control-max-age': '31536000',
      },
      body: buffer,
    });

    if (!blobRes.ok) {
      const errText = await blobRes.text();
      return res.status(500).json({ error: `Blob error ${blobRes.status}: ${errText}` });
    }

    const blobData = await blobRes.json();
    return res.status(200).json({ success: true, url: blobData.url, filename });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
