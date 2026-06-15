const express = require('express');
const path = require('path');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: path.join(__dirname, 'tmp_uploads') });
app.use(cors());

// Serve static site from project root
app.use(express.static(path.join(__dirname)));

// Load API_KEY from env or fallback (keep secret in real deployment)
const API_KEY = process.env.LITEBAS_API_KEY || 'lbas_a356c42e13544f4a9e5b30984ac19a69';
const CDN_BASE = `https://db.padilolo.my.id/api/v1/${API_KEY}`;

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path), req.file.originalname);

    const resp = await fetch(`${CDN_BASE}/upload`, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    });

    const json = await resp.json();

    // Cleanup temp file
    fs.unlink(req.file.path, () => {});

    if (!resp.ok) {
      return res.status(resp.status).json({ success: false, message: 'CDN upload failed', details: json });
    }

    // Proxy back the CDN response
    return res.status(200).json(json);
  } catch (err) {
    fs.unlink(req.file.path, () => {});
    return res.status(500).json({ success: false, message: 'Proxy error', error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Local dev server with upload proxy running at http://localhost:${PORT}`));
