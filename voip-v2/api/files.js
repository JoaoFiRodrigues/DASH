const { list, getDownloadUrl } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { blobs } = await list({ prefix: 'excels/' });

    // Gera URL de download temporária para cada blob privado
    const files = await Promise.all(
      blobs
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .map(async b => {
          const downloadUrl = await getDownloadUrl(b.url);
          return {
            url:        downloadUrl,
            filename:   b.pathname.replace('excels/', ''),
            size:       b.size,
            uploadedAt: b.uploadedAt,
          };
        })
    );

    return res.status(200).json({ files });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
