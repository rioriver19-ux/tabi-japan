export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.body;
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
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
