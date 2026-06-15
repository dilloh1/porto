const formidable = require('formidable');
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const API_KEY = process.env.LITEBAS_API_KEY;
  if (!API_KEY) return res.status(500).json({ success: false, message: 'Missing LITEBAS_API_KEY' });
  const CDN_BASE = `https://db.padilolo.my.id/api/v1/${API_KEY}`;

  const form = new formidable.IncomingForm({ multiples: false, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ success: false, message: 'Form parse error', error: err.message });
    const file = files?.image;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    try {
      const tempPath = file.filepath || file.path;
      const filename = file.originalFilename || file.newFilename || file.name || 'upload-image';
      const fd = new FormData();
      fd.append('image', fs.createReadStream(tempPath), filename);

      const resp = await fetch(`${CDN_BASE}/upload`, {
        method: 'POST',
        headers: fd.getHeaders(),
        body: fd
      });

      const json = await resp.json();
      if (tempPath) fs.unlink(tempPath, () => {});

      if (!resp.ok) {
        return res.status(resp.status).json(json);
      }

      return res.status(200).json(json);
    } catch (e) {
      const tempPath = file.filepath || file.path;
      if (tempPath) fs.unlink(tempPath, () => {});
      return res.status(500).json({ success: false, message: 'Proxy error', error: e.message });
    }
  });
};
