const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow GitHub Pages to call it
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'No userId provided' });
  }

  try {
    const response = await axios.get(`https://www.rolimons.com/player/${userId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000 // avoid hangs
    });

    const $ = cheerio.load(response.data);

    // Selectors based on current Rolimons structure (inspect a player page to confirm/adjust)
    // These are common classes/attributes as of early 2026
    const rap = $('.value-rap, [data-stat="rap"], .rap-value').first().text().trim().replace(/[^0-9]/g, '') || '0';
    const limitedsCount = $('.limiteds-count, [data-stat="limiteds"], .limited-items').first().text().trim() || '0';
    const pending = $('.pending-robux, [data-stat="pending"], .pending-value').first().text().trim().replace(/[^0-9]/g, '') || '0';
    const totalValue = $('.value-total, [data-stat="value"]').first().text().trim().replace(/[^0-9]/g, '') || 'Unknown';

    res.status(200).json({
      success: true,
      rap,
      limiteds: limitedsCount,
      pending,
      totalValue
      // add more if you spot better selectors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
