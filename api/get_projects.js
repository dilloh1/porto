export default async function handler(req, res) {
  // Set global CORS headers agar aman diakses dari localhost maupun domain Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = "lbas_138fb295c49a4d58b14b86f31d3a2e92";
  const BASE_URL = `https://db.padilolo.my.id/api/v1/${API_KEY}/tables/projects`;

  // === JALUR AMBIL DATA (GET) ===
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${BASE_URL}?limit=50`);
      if (!response.ok) {
        return res.status(response.status).json({ success: false, message: "Database menolak koneksi" });
      }
      
      const rawData = await response.json();
      const projectRows = rawData?.result?.results?.[0]?.values || [];

      // Mapping data array SQLite [id, title, desc, img, link] menjadi format Objek JSON bersih
      const cleanProjects = projectRows.map(p => {
        if (Array.isArray(p)) {
          return {
            id: p[0],
            title: p[1] || "Proyek Tanpa Judul",
            description: p[2] || "Tidak ada deskripsi.",
            image_url: p[3] || "https://placehold.co/600x400?text=No+Image",
            link_project: p[4] || "#"
          };
        }
        return null;
      }).filter(Boolean);

      return res.status(200).json({ success: true, data: cleanProjects });

    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // === JALUR SIMPAN DATA (POST) ===
  if (req.method === 'POST') {
    try {
      const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Gagal memproses pengiriman ke database" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}