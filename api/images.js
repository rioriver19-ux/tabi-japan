export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET（クエリパラメータ）とPOST（ボディ）の両方に対応
  const query = req.method === 'POST' ? req.body?.query : req.query?.query;

  if (!query) {
    return res.status(400).json({ images: [], error: 'query is required' });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return res.status(500).json({ images: [], error: 'UNSPLASH_ACCESS_KEY not set' });
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
      {
        headers: { 'Authorization': `Client-ID ${accessKey}` }
      }
    );
    const data = await response.json();
    const images = (data.results || []).map(item => ({
      url: item.urls.regular,
      title: item.alt_description || item.description || query,
      thumbnail: item.urls.thumb,
      contextLink: item.links.html,
    }));
    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ images: [], error: err.message });
  }
}
