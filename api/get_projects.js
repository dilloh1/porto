export default async function handler(req, res) {
  // Set global CORS headers agar aman diakses dari localhost maupun domain produksi
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = "lbas_138fb295c49a4d58b14b86f31d3a2e92";
  const BASE_URL = `https://db.padilolo.my.id/api/v1/${API_KEY}`;

  // === 1. AMBIL DATA PROYEK (GET) ===
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${BASE_URL}/tables/projects?limit=50`);
      if (!response.ok) {
        return res.status(response.status).json({ success: false, message: "Gagal menyambung ke database utama." });
      }
      
      const rawData = await response.json();
      // Mengambil baris data SQLite dari struktur respons database
      const projectRows = rawData?.result?.results?.[0]?.values || [];

      // Konversi data dari bentuk Array [id, title, desc, img, link] menjadi Objek JSON agar anti-undefined
      const cleanProjects = projectRows.map(p => {
        if (Array.isArray(p)) {
          return {
            id: p[0],
            title: p[1] || "Proyek Tanpa Judul",
            description: p[2] || "Tidak ada deskripsi tersedia.",
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

  // === 2. SIMPAN DATA PROYEK (POST) ===
  if (req.method === 'POST') {
    try {
      const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      // Kirim data JSON proyek ke tabel projects di database kamu
      const response = await fetch(`${BASE_URL}/tables/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Gagal memproses pengiriman ke database." });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}