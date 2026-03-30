export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.method === 'POST' ? req.body?.query : req.query?.query;
  if (!query) return res.status(400).json({ images: [], error: 'query required' });

  // まずGoogleを試す
  try {
    const googleKey = process.env.GOOGLE_CUSTOM_SEARCH_KEY;
    const googleCx = process.env.GOOGLE_CUSTOM_SEARCH_CX;
    if (googleKey && googleCx) {
      const googleRes = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleCx}&q=${encodeURIComponent(query)}&searchType=image&num=6&imgSize=large`
      );
      const googleData = await googleRes.json();
      const images = (googleData.items || []).map(item => ({
        url: item.link,
        title: item.title,
        thumbnail: item.image?.thumbnailLink || item.link,
        contextLink: item.image?.contextLink || item.link,
      }));
      if (images.length >= 3) return res.status(200).json({ images });
    }
  } catch (err) {
    console.error('Google error:', err);
  }

  // GoogleがダメならPexelsにフォールバック
  try {
    const pexelsKey = process.env.PEXELS_API_KEY;
    if (pexelsKey) {
      const pexelsRes = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
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
    }
  } catch (err) {
    console.error('Pexels error:', err);
  }

  return res.status(200).json({ images: [] });
}
