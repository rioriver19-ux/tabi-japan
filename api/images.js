export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.method === 'POST' ? req.body?.query : req.query?.query;
  if (!query) return res.status(400).json({ images: [], error: 'query required' });

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return res.status(500).json({ images: [], error: 'PEXELS_API_KEY not set' });

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );
    const data = await response.json();
    const images = (data.photos || []).map(photo => ({
      url: photo.src.large,
      title: photo.alt || query,
      thumbnail: photo.src.medium,
      contextLink: photo.url,
    }));
    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ images: [], error: err.message });
  }
}
