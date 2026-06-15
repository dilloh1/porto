export default async function handler(req, res) {
  // Atur Header CORS agar bisa diakses oleh frontend Anda
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Tangani preflight request dari browser
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // === API CONFIGURATION (AMAN DI SISI SERVER VERCEL) ===
  const API_KEY = "lbas_a356c42e13544f4a9e5b30984ac19a69";
  const BASE_URL = `https://db.padilolo.my.id/api/v1/${API_KEY}/tables/projects`;

  // 1. JIKA REQUEST ADALAH GET (Ambil Data untuk index.html)
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${BASE_URL}?limit=50`);
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data dari database" });
    }
  }

  // 2. JIKA REQUEST ADALAH POST (Tambah Data dari admin.html)
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

  // Jika method tidak diizinkan
  return res.status(405).json({ error: "Method Not Allowed" });
}