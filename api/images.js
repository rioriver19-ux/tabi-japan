export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.body;
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_KEY;
  const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX;

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query + ' Japan')}&searchType=image&num=6&imgSize=large&safe=active&siteSearch=tripadvisor.com&siteSearchFilter=e`
    );
    const data = await response.json();
    const images = (data.items || []).map(item => ({
      url: item.link,
      title: item.title,
      thumbnail: item.image?.thumbnailLink,
      contextLink: item.image?.contextLink,
    }));
    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ images: [], error: err.message });
  }
}
