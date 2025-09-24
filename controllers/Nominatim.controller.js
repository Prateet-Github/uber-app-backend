import axios from 'axios';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export const geocode = async (req, res) => {
try {
  const {query} = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=3`
  const { data } = await axios.get(url,{
    headers: {
        'User-Agent': 'UberByPrateet1.0 (prateettiwari29@gmail.com)'
      }
  });

  res.json(data);
} catch (error) {
  console.error(error.message);
  res.status(500).json({ error: 'Geocoding failed' });
}
};

export const reverse = async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({ error: "lat and lon query parameters are required" });
    }

    const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "UberByPrateet/1.0 (myemail@gmail.com)" 
      }
    });

    res.json(data);
  } catch (error) {
    console.error("Reverse geocode failed:", error.message);
    res.status(500).json({ error: "Reverse geocoding failed" });
  }
};

