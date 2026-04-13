export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.method === 'POST' ? req.body?.query : req.query?.query;
  if (!query) return res.status(400).json({ images: [], error: 'query required' });

  try {
    const pexelsKey = process.env.PEXELS_API_KEY;
    const searchQuery = query.toLowerCase().includes('japan')
      ? query
      : `${query} Japan`;

    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=6&orientation=landscape`,
      { headers: { Authorization: pexelsKey } }
    );
    const pexelsData = await pexelsRes.json();
    const images = (pexelsData.photos || []).map(photo => ({
      url: photo.src.large,
      title: photo.alt || query,
      thumbnail: photo.src.medium,
      contextLink: photo.url,
    }));
    return res.status(200).json({ images });
  } catch (err) {
    return res.status(500).json({ images: [], error: err.message });
  }
}
