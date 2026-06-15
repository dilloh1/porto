export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = "lbas_8a0c3ba717e648509eafb07e1ed45ecc";
  const BASE_URL = `https://db.padilolo.my.id/api/v1/${API_KEY}/tables/projects`;

  // 1. AMBIL DATA (GET)
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${BASE_URL}?limit=50`);
      const data = await response.json();
      
      // Pengaman & Pemetaan Otomatis jika struktur datanya berupa array berindeks
      let rawProjects = [];
      
      if (data?.result?.results?.[0]?.values) {
        rawProjects = data.result.results[0].values;
      } else if (data?.results) {
        rawProjects = data.results;
      } else if (Array.isArray(data)) {
        rawProjects = data;
      }

      // Validasi struktur: Jika data berbentuk array di dalam array (berdasarkan kolom)
      const cleanProjects = rawProjects.map(p => {
        // Jika data berbentuk objek standar
        if (p && typeof p === 'object' && !Array.isArray(p)) {
          return {
            title: p.title || p.nama || "Tanpa Judul",
            description: p.description || p.deskripsi || "Tidak ada deskripsi.",
            image_url: p.image_url || p.gambar || "https://placehold.co/600x400?text=No+Image",
            link_project: p.link_project || p.link || "#"
          };
        }
        // Jika data berbentuk array terindeks [id, title, description, image_url, link_project]
        if (Array.isArray(p)) {
          return {
            title: p[1] || "Tanpa Judul",
            description: p[2] || "Tidak ada deskripsi.",
            image_url: p[3] || "https://placehold.co/600x400?text=No+Image",
            link_project: p[4] || "#"
          };
        }
        return null;
      }).filter(Boolean);

      return res.status(200).json({ success: true, data: cleanProjects });

    } catch (error) {
      return res.status(500).json({ error: "Gagal memproses data dari database" });
    }
  }

  // 2. INPUT DATA (POST)
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
      return res.status(500).json({ error: "Gagal mengirim data ke database" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}