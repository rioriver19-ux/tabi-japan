export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.body;
  const apiKey = process.env.GOOGLE_PLACES_KEY;

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.currentOpeningHours,places.priceLevel,places.googleMapsUri',
    },
    body: JSON.stringify({
      textQuery: query + ' Japan',
      languageCode: 'en',
      maxResultCount: 5,
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
