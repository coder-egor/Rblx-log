const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  // Allow CORS from your GitHub Pages domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'No userId provided' });
  }

  try {
    const response = await axios.get(`https://www.rolimons.com/player/${userId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // Rolimons selectors (tuned for 2026 layout – adjust if needed after test)
    const rap = $('[data-value="rap"] span, .rap-value, .value-rap').first().text().trim().replace(/[^0-9]/g, '') || '0';
    const limiteds = $('[data-value="limiteds"] span, .limiteds-count, .limited-items').first().text().trim() || '0';
    const pending = $('[data-value="pending-robux"] span, .pending-robux, .pending-value').first().text().trim().replace(/[^0-9]/g, '') || '0';

    res.status(200).json({
      success: true,
      rap,
      limiteds,
      pending
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
