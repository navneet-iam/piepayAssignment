// server.js - Wow Deal API Backend
const express = require('express');
const cors = require('cors');
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for simplicity (use a database in production)
const priceData = new Map();

// Utility function to clean product title for API
function cleanProductTitle(title) {
  return title
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase();
}

// Utility function to extract Wow Deal price from Flipkart page
async function scrapeFlipkartProduct(url) {
  try {
    console.log('[1] Scraping started for:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('[2] Flipkart response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract product title
    let productTitle = '';
    const titleSelectors = [
      'h1 span',
      '.B_NuCI',
      '[data-testid="product-title"]',
      '.yhB1nd'
    ];

    for (const selector of titleSelectors) {
      const titleElement = document.querySelector(selector);
      if (titleElement && titleElement.textContent.trim()) {
        productTitle = titleElement.textContent.trim().slice(0, 20);
        break;
      }
    }

    console.log('[3] Scraped product title:', productTitle);

    // Try to extract embedded JSON and find nepPrice
    let wowDealPrice = null;
    const scripts = [...document.querySelectorAll('script')];
    for (let script of scripts) {
      const content = script.textContent;
      if (content.includes('nepPrice')) {
        const match = content.match(/"nepPrice":(\d+)/);
        if (match) {
          wowDealPrice = match[1];
          console.log('[4] Extracted wowDealPrice (nepPrice):', wowDealPrice);
          break;
        }
      }
    }

    return { productTitle, wowDealPrice };

  } catch (error) {
    console.error('[!] Scraping error:', error);
    return { productTitle: '', wowDealPrice: null };
  }
}


// POST /api/prices - Store scraped price data
app.post('/api/prices', async (req, res) => {
  try {
    console.log('\n--- [POST /api/prices] Request received ---');
    console.log('[0] Incoming body:', req.body);

    const { productTitle, wowDealPrice, flipkartUrl } = req.body;

    let scrapedTitle = productTitle;
    let scrapedWowPrice = wowDealPrice;

    if (flipkartUrl) {
      console.log('[1] flipkartUrl provided. Starting scrape...');
      const scrapedData = await scrapeFlipkartProduct(flipkartUrl);
      scrapedTitle = scrapedData.productTitle || productTitle;
      scrapedWowPrice = scrapedData.wowDealPrice || wowDealPrice;
    }

    if (!scrapedTitle) {
      console.log('[!] No title found. Returning 400.');
      return res.status(400).json({ error: 'Product title is required' });
    }

    const cleanTitle = cleanProductTitle(scrapedTitle);
    console.log('[2] Cleaned title:', cleanTitle);

    priceData.set(cleanTitle, {
      originalTitle: scrapedTitle,
      wowDealPrice: scrapedWowPrice,
      timestamp: Date.now()
    });

    console.log('[3] Stored in-memory:', priceData.get(cleanTitle));
    console.log('[✔] POST /api/prices completed.');

    res.json({
      success: true,
      productTitle: cleanTitle,
      originalTitle: scrapedTitle,
      wowDealPrice: scrapedWowPrice
    });

  } catch (error) {
    console.error('[X] Error in POST /api/prices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET /api/prices/:productTitle - Get price data
app.get('/api/prices/:productTitle', (req, res) => {
  try {
    const { productTitle } = req.params;
    const cleanTitle = productTitle.toLowerCase();

    const data = priceData.get(cleanTitle);

    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Mock Flipkart price
    const flipkartPrice = 79999;

    let wowPrice = flipkartPrice;
    let savingsPercentage = 0;
    console.log("CHECKING GET");
    if (data.wowDealPrice) {
      const priceMatch = data.wowDealPrice.match(/\d+/);
      if (priceMatch) {
        wowPrice = parseInt(priceMatch[0]);
        savingsPercentage = Math.round(((flipkartPrice - wowPrice) / flipkartPrice) * 100);
        savingsPercentage = savingsPercentage > 0 ? savingsPercentage : 0;
      }
    }

    const sampleImages = [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300'
    ];

    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];

    res.json({
      flipkartPrice,
      wowDealPrice: data.wowDealPrice || flipkartPrice.toString(),
      productImgUri: randomImage,
      savingsPercentage,
      productTitle: data.originalTitle
    });

  } catch (error) {
    console.error('Error fetching price data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Wow Deal API server running on port ${PORT}`);
});

module.exports = app;