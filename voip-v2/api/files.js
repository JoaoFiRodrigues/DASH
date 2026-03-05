module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB token missing' });

  try {
    const blobRes = await fetch('https://blob.vercel-storage.com?prefix=excels/&limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!blobRes.ok) {
      const errText = await blobRes.text();
      return res.status(500).json({ error: `Blob error ${blobRes.status}: ${errText}` });
    }

    const data = await blobRes.json();
    const files = (data.blobs || [])
      .map(b => ({
        url:        b.url,
        filename:   b.pathname.replace('excels/', ''),
        size:       b.size,
        uploadedAt: b.uploadedAt,
      }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return res.status(200).json({ files });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
