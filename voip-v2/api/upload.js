import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple upload key protection
  const uploadKey = req.headers['x-upload-key'];
  if (uploadKey !== process.env.UPLOAD_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const filename = req.headers['x-filename'] || `upload-${Date.now()}.xlsx`;
    const safeFilename = filename.replace(/[^a-zA-Z0-9._\-\u00C0-\u017E ]/g, '_');

    const blob = await put(`excels/${safeFilename}`, buffer, {
      access: 'public',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      addRandomSuffix: false,
    });

    return res.status(200).json({ 
      success: true,
      url: blob.url,
      filename: safeFilename
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
