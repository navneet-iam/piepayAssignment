const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const priceData = new Map();

function cleanProductTitle(title) {
  return title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

// POST /api/prices - Store scraped price data
app.post('/api/prices', (req, res) => {
  try {
    const { productTitle, wowDealPrice } = req.body;

    if (!productTitle) {
      return res.status(400).json({ error: 'Product title is required' });
    }

    const cleanTitle = cleanProductTitle(productTitle);
    
    // Trim the product title to 20 characters as per task
    const trimmedTitle = productTitle.slice(0, 20);

    priceData.set(cleanTitle, {
      originalTitle: trimmedTitle,
      wowDealPrice: wowDealPrice,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      productTitle: cleanTitle,
      originalTitle: trimmedTitle,
      wowDealPrice: wowDealPrice,
    });
  } catch (error) {
    console.error('Error in POST /api/prices:', error);
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

    // Mock Flipkart price (static, as per task)
    const flipkartPrice = 79999;
    let wowPrice = data.wowDealPrice ? parseFloat(data.wowDealPrice.replace(/,/g, '')) : flipkartPrice;
    
    let savingsPercentage = 0;
    if (wowPrice && wowPrice < flipkartPrice) {
      savingsPercentage = Math.round(((flipkartPrice - wowPrice) / flipkartPrice) * 100);
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
      productTitle: data.originalTitle,
    });
  } catch (error) {
    console.error('Error fetching price data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Wow Deal API server running on port ${PORT}`);
});

module.exports = app;