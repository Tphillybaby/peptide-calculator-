# Making the Price Checker Production-Ready

## Current State
The Price Checker currently uses **simulated data** for demonstration purposes. This document outlines what's needed to integrate real-time pricing data from actual peptide vendors.

---

## Implementation Options

### Option 1: Backend API with Web Scraping (Recommended)

**Overview:** Create a backend service that scrapes vendor websites and provides a unified API.

**Requirements:**
1. **Backend Server** (Node.js/Express, Python/Flask, or similar)
2. **Web Scraping Libraries:**
   - Node.js: `puppeteer`, `cheerio`, `playwright`
   - Python: `beautifulsoup4`, `scrapy`, `selenium`
3. **Database** (PostgreSQL, MongoDB) to cache prices
4. **Cron Jobs** to update prices periodically

**Architecture:**
```
Frontend (React) → Backend API → Web Scrapers → Vendor Websites
                        ↓
                    Database (Cache)
```

**Backend API Endpoints:**
```javascript
GET /api/prices/:peptide
// Returns: Array of vendor prices for specified peptide

GET /api/vendors
// Returns: List of all supported vendors

POST /api/prices/refresh
// Triggers manual price refresh
```

**Example Backend Code (Node.js/Express):**
```javascript
// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

// Price scraping function
async function scrapePeptideSciences(peptideName) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(`https://www.peptidesciences.com/search?q=${peptideName}`);
  
  const priceData = await page.evaluate(() => {
    const priceElement = document.querySelector('.product-price');
    const stockElement = document.querySelector('.stock-status');
    
    return {
      price: priceElement?.textContent.trim(),
      inStock: stockElement?.textContent.includes('In Stock')
    };
  });
  
  await browser.close();
  return priceData;
}

// API endpoint
app.get('/api/prices/:peptide', async (req, res) => {
  const peptide = req.params.peptide;
  
  try {
    const prices = await Promise.all([
      scrapePeptideSciences(peptide),
      scrapeAmericanResearchLabs(peptide),
      // ... other vendors
    ]);
    
    res.json({ peptide, prices, lastUpdated: new Date() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

app.listen(3001, () => console.log('API running on port 3001'));
```

**Frontend Integration:**
```javascript
// In PriceChecker.jsx, replace fetchPrices function:
const fetchPrices = async (peptide) => {
  try {
    const response = await fetch(`http://localhost:3001/api/prices/${peptide}`);
    const data = await response.json();
    return data.prices.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } catch (error) {
    console.error('Error fetching prices:', error);
    return [];
  }
};
```

**Challenges:**
- Websites may block scrapers (use proxies, rate limiting)
- HTML structure changes require scraper updates
- Legal considerations (check vendor ToS)
- Performance (scraping is slow, use caching)

---

### Option 2: Vendor APIs (If Available)

**Overview:** Use official APIs provided by vendors.

**Requirements:**
1. API keys from each vendor
2. Backend to proxy requests (hide API keys)
3. Rate limiting to respect API quotas

**Example:**
```javascript
// Backend endpoint
app.get('/api/prices/:peptide', async (req, res) => {
  const peptide = req.params.peptide;
  
  const prices = await Promise.all([
    fetch(`https://api.vendor1.com/products?search=${peptide}`, {
      headers: { 'Authorization': `Bearer ${process.env.VENDOR1_API_KEY}` }
    }),
    fetch(`https://api.vendor2.com/search?q=${peptide}`, {
      headers: { 'X-API-Key': process.env.VENDOR2_API_KEY }
    })
  ]);
  
  const formattedPrices = prices.map(p => ({
    vendor: p.vendorName,
    price: p.price,
    inStock: p.available,
    // ... format according to your needs
  }));
  
  res.json(formattedPrices);
});
```

**Pros:**
- More reliable than scraping
- Faster response times
- Less likely to break

**Cons:**
- Most peptide vendors don't offer public APIs
- May have usage limits
- Requires partnerships/agreements

---

### Option 3: Third-Party Price Aggregation Services

**Overview:** Use existing price comparison APIs.

**Services to Consider:**
- Custom price aggregation platforms
- Affiliate networks with price feeds
- Industry-specific data providers

**Implementation:**
```javascript
const fetchPrices = async (peptide) => {
  const response = await fetch(
    `https://api.priceaggregator.com/peptides/${peptide}`,
    { headers: { 'X-API-Key': process.env.AGGREGATOR_KEY } }
  );
  return response.json();
};
```

---

### Option 4: Manual Data Entry with Admin Panel

**Overview:** Create an admin interface to manually update prices.

**Requirements:**
1. Admin authentication
2. Database to store prices
3. Admin UI for price updates

**Database Schema:**
```sql
CREATE TABLE peptide_prices (
  id SERIAL PRIMARY KEY,
  peptide_name VARCHAR(100),
  vendor_name VARCHAR(100),
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  discount_percent INTEGER,
  in_stock BOOLEAN,
  shipping_cost VARCHAR(50),
  vendor_url TEXT,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

**Admin Panel Example:**
```javascript
// Admin component
const PriceAdmin = () => {
  const [prices, setPrices] = useState([]);
  
  const updatePrice = async (priceId, newData) => {
    await fetch(`/api/admin/prices/${priceId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(newData)
    });
  };
  
  // ... UI for editing prices
};
```

---

## Recommended Approach

**Hybrid Solution:**
1. **Start with web scraping** for automated price collection
2. **Add manual override** capability for when scrapers fail
3. **Cache prices** in database (update every 6-24 hours)
4. **Implement fallback** to last known prices if scraping fails

**Implementation Steps:**

### Step 1: Set Up Backend
```bash
# Create backend directory
mkdir peptide-api
cd peptide-api
npm init -y
npm install express puppeteer node-cron dotenv cors
```

### Step 2: Create Scraper Service
```javascript
// scrapers/peptideSciences.js
const puppeteer = require('puppeteer');

async function scrapePeptideSciences(peptide) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(`https://www.peptidesciences.com/search?q=${peptide}`, {
      waitUntil: 'networkidle2'
    });
    
    const data = await page.evaluate(() => {
      // Adjust selectors based on actual website structure
      const product = document.querySelector('.product-item');
      if (!product) return null;
      
      return {
        price: product.querySelector('.price')?.textContent,
        originalPrice: product.querySelector('.original-price')?.textContent,
        inStock: product.querySelector('.stock')?.textContent.includes('In Stock'),
        rating: product.querySelector('.rating')?.textContent
      };
    });
    
    await browser.close();
    return data;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

module.exports = { scrapePeptideSciences };
```

### Step 3: Create API Server
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { scrapePeptideSciences } = require('./scrapers/peptideSciences');
// Import other scrapers...

const app = express();
app.use(cors());
app.use(express.json());

// In-memory cache (use Redis or database in production)
let priceCache = {};

async function updatePrices(peptide) {
  const prices = await Promise.allSettled([
    scrapePeptideSciences(peptide),
    // Add other vendor scrapers
  ]);
  
  priceCache[peptide] = {
    prices: prices.filter(p => p.status === 'fulfilled').map(p => p.value),
    lastUpdated: new Date()
  };
}

app.get('/api/prices/:peptide', async (req, res) => {
  const peptide = req.params.peptide;
  
  // Check cache
  if (priceCache[peptide]) {
    const cacheAge = Date.now() - new Date(priceCache[peptide].lastUpdated);
    if (cacheAge < 6 * 60 * 60 * 1000) { // 6 hours
      return res.json(priceCache[peptide]);
    }
  }
  
  // Fetch fresh data
  try {
    await updatePrices(peptide);
    res.json(priceCache[peptide]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Update prices every 6 hours
cron.schedule('0 */6 * * *', () => {
  const peptides = ['Semaglutide', 'Tirzepatide', 'BPC-157'];
  peptides.forEach(updatePrices);
});

app.listen(3001, () => console.log('API running on port 3001'));
```

### Step 4: Update Frontend
```javascript
// In PriceChecker.jsx
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const fetchPrices = async (peptide) => {
  try {
    const response = await fetch(`${API_URL}/api/prices/${peptide}`);
    const data = await response.json();
    return data.prices.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Fallback to simulated data if API fails
    return generateSimulatedPrices(peptide);
  }
};
```

### Step 5: Environment Variables
```bash
# .env file in backend
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost/peptide_prices

# .env file in frontend
REACT_APP_API_URL=https://your-api-domain.com
```

---

## Legal & Ethical Considerations

1. **Terms of Service:** Check each vendor's ToS regarding scraping
2. **Rate Limiting:** Don't overload vendor servers
3. **Robots.txt:** Respect robots.txt directives
4. **User-Agent:** Identify your scraper properly
5. **Caching:** Cache aggressively to minimize requests
6. **Affiliate Links:** Consider using affiliate links for revenue

---

## Deployment

**Backend Options:**
- **Heroku** (easy, free tier available)
- **AWS Lambda** (serverless, cost-effective)
- **DigitalOcean** (VPS, more control)
- **Railway** (modern, simple deployment)

**Database Options:**
- **Supabase** (PostgreSQL, free tier)
- **MongoDB Atlas** (NoSQL, free tier)
- **PlanetScale** (MySQL, serverless)

---

## Monitoring & Maintenance

1. **Error Tracking:** Use Sentry or similar
2. **Uptime Monitoring:** UptimeRobot, Pingdom
3. **Logging:** Winston, Pino for backend logs
4. **Alerts:** Get notified when scrapers fail
5. **Regular Updates:** Scrapers need maintenance when sites change

---

## Cost Estimates

**Monthly Costs (Approximate):**
- Backend hosting: $0-25 (Heroku free tier or Railway)
- Database: $0-10 (Supabase/MongoDB free tier)
- Proxy service (if needed): $10-50
- Total: $0-85/month for small scale

**Time Investment:**
- Initial setup: 20-40 hours
- Maintenance: 2-5 hours/month
- Updates when sites change: 1-3 hours per vendor

---

## Quick Start Checklist

- [ ] Choose implementation approach
- [ ] Set up backend server
- [ ] Implement scrapers for 2-3 vendors
- [ ] Set up database for caching
- [ ] Create API endpoints
- [ ] Update frontend to use API
- [ ] Add error handling and fallbacks
- [ ] Implement caching strategy
- [ ] Set up monitoring
- [ ] Deploy backend
- [ ] Test thoroughly
- [ ] Add more vendors incrementally

---

## Contact & Support

For questions about implementing real price data, consider:
- Hiring a backend developer familiar with web scraping
- Using a freelance platform (Upwork, Fiverr)
- Partnering with vendors for official data feeds
- Joining peptide community forums for data sharing

---

**Last Updated:** November 24, 2025
