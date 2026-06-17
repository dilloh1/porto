const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static site from project root
app.use(express.static(path.join(__dirname)));
// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Initialize local SQLite database and pre-populate defaults if empty
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to local SQLite database.');
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          link_project TEXT
        )
      `);

      // Seed default projects if database is empty
      db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
        if (!err && row && row.count === 0) {
          const stmt = db.prepare("INSERT INTO projects (title, description, image_url, link_project) VALUES (?, ?, ?, ?)");
          stmt.run(
            "Mini Private Server STB Bekas",
            "Eksperimen merakit server mini mandiri menggunakan STB bekas untuk kebutuhan penyimpanan data lokal, blocking iklan (DNS sinkhole), dan hosting lokal.",
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop",
            "https://github.com/dilloh1"
          );
          stmt.run(
            "Neo-Brutalist Portfolio",
            "Website portofolio pribadi modern dengan estetika neo-brutalisme, ditenagai backend Express.js dan database SQLite untuk manajemen konten proyek secara dinamis.",
            "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop",
            "https://github.com/dilloh1"
          );
          stmt.finalize();
          console.log("Pre-populated SQLite database with default projects.");
        }
      });
    });
  }
});

// Configure Multer for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// API Route: Upload Image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Generate local relative URL path for the frontend
  const imageUrl = `/uploads/${req.file.filename}`;
  return res.status(200).json({
    success: true,
    file: {
      url: imageUrl
    }
  });
});

// API Route: Get Projects
app.get('/api/get_projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve projects', error: err.message });
    }
    return res.status(200).json({ success: true, data: rows });
  });
});

// API Route: Add Project
app.post('/api/get_projects', (req, res) => {
  const { title, description, image_url, link_project } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Project title is required' });
  }

  const query = `INSERT INTO projects (title, description, image_url, link_project) VALUES (?, ?, ?, ?)`;
  db.run(query, [title, description || '', image_url || '', link_project || ''], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to save project', error: err.message });
    }
    return res.status(200).json({
      success: true,
      data: {
        id: this.lastID,
        title,
        description,
        image_url,
        link_project
      }
    });
  });
});

// API Route: Delete Project
app.delete('/api/get_projects/:id', (req, res) => {
  const id = req.params.id;
  
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to find project', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const imageUrl = row.image_url;

    db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to delete project record', error: err.message });
      }

      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, imageUrl);
        fs.unlink(localPath, (err) => {
          if (err) console.error('Failed to delete project image file:', err.message);
        });
      }

      return res.status(200).json({ success: true, message: 'Project deleted successfully' });
    });
  });
});

// API Route: Update Project
app.put('/api/get_projects/:id', (req, res) => {
  const id = req.params.id;
  const { title, description, image_url, link_project } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Project title is required' });
  }

  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to find project', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const oldImageUrl = row.image_url;
    const deleteOldFile = image_url && oldImageUrl && image_url !== oldImageUrl && oldImageUrl.startsWith('/uploads/');

    const query = `UPDATE projects SET title = ?, description = ?, image_url = ?, link_project = ? WHERE id = ?`;
    db.run(query, [title, description || '', image_url || row.image_url, link_project || '', id], function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to update project', error: err.message });
      }

      if (deleteOldFile) {
        const localPath = path.join(__dirname, oldImageUrl);
        fs.unlink(localPath, (err) => {
          if (err) console.error('Failed to delete old project image file:', err.message);
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: { id, title, description, image_url: image_url || row.image_url, link_project }
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Local dev server with SQLite running at http://localhost:${PORT}`));
