export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = "lbas_8a0c3ba717e648509eafb07e1ed45ecc";
  const BASE_URL = `https://db.padilolo.my.id/api/v1/${API_KEY}/tables/projects`;

  // === 1. AMBIL DATA (GET) ===
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${BASE_URL}?limit=50`);
      if (!response.ok) {
        return res.status(response.status).json({ success: false, message: "Database menolak request" });
      }
      
      const rawData = await response.json();
      
      // Pencarian letak array data secara agresif di dalam response JSON
      let records = [];
      if (rawData && typeof rawData === 'object') {
        if (rawData.result?.results?.[0]?.values) {
          records = rawData.result.results[0].values;
        } else if (rawData.results) {
          records = rawData.results;
        } else if (rawData.data) {
          records = rawData.data;
        } else if (Array.isArray(rawData)) {
          records = rawData;
        } else {
          // Cari properti array pertama yang ditemukan di dalam objek
          for (const key in rawData) {
            if (Array.isArray(rawData[key])) {
              records = rawData[key];
              break;
            }
          }
        }
      }

      // Bersihkan dan petakan data secara dinamis
      const cleanProjects = records.map(p => {
        if (!p) return null;

        // JIKA DATA BERBENTUK ARRAY: [id, title, description, image_url, link_project]
        if (Array.isArray(p)) {
          // Kita cari elemen string yang mirip URL untuk gambar dan link proyek
          const urls = p.filter(val => typeof val === 'string' && val.startsWith('http'));
          const imgUrl = urls.find(u => u.match(/\.(jpeg|jpg|gif|png|webp)/i)) || urls[0] || "";
          const projUrl = urls.find(u => u !== imgUrl) || urls[1] || "#";
          
          // Sisanya ambil teks non-URL untuk judul dan deskripsi
          const texts = p.filter(val => typeof val === 'string' && !val.startsWith('http') && isNaN(val));

          return {
            title: texts[0] || "Proyek Tanpa Judul",
            description: texts[1] || "Tidak ada deskripsi tersedia.",
            image_url: imgUrl || "https://placehold.co/600x400?text=No+Image",
            link_project: projUrl
          };
        }

        // JIKA DATA BERBENTUK OBJEK STANDAR
        if (typeof p === 'object') {
          return {
            title: p.title || p.nama || p.name || Object.values(p)[1] || "Proyek Tanpa Judul",
            description: p.description || p.deskripsi || p.desc || Object.values(p)[2] || "Tidak ada deskripsi.",
            image_url: p.image_url || p.gambar || p.image || p.img || Object.values(p)[3] || "https://placehold.co/600x400?text=No+Image",
            link_project: p.link_project || p.link || p.url || Object.values(p)[4] || "#"
          };
        }

        return null;
      }).filter(Boolean);

      return res.status(200).json({ success: true, data: cleanProjects });

    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // === 2. SIMPAN DATA (POST) ===
  if (req.method === 'POST') {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengirim data" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}