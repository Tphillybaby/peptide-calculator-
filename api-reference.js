// Example Backend API Structure for Production Price Checker
// This is a reference implementation showing how to structure your backend

// ============================================
// 1. VENDOR SCRAPER INTERFACE
// ============================================

/**
 * Base interface that all vendor scrapers should implement
 */
class VendorScraper {
    constructor(vendorName, vendorUrl) {
        this.vendorName = vendorName;
        this.vendorUrl = vendorUrl;
    }

    /**
     * Scrape price data for a specific peptide
     * @param {string} peptideName - Name of the peptide to search for
     * @returns {Promise<PriceData>} Price information
     */
    async scrapePrice(peptideName) {
        throw new Error('scrapePrice must be implemented by subclass');
    }
}

/**
 * Price data structure returned by scrapers
 */
const PriceDataSchema = {
    vendor: String,           // Vendor name
    vendorUrl: String,        // Vendor website URL
    productUrl: String,       // Direct product URL
    price: Number,            // Current price
    originalPrice: Number,    // Original price (before discount)
    discount: Number,         // Discount percentage
    inStock: Boolean,         // Availability
    shipping: String,         // Shipping cost or "Free"
    rating: Number,           // Product/vendor rating (0-5)
    lastUpdated: Date         // When this data was fetched
};

// ============================================
// 2. EXAMPLE SCRAPER IMPLEMENTATION
// ============================================

const puppeteer = require('puppeteer');

class PeptideSciencesScraper extends VendorScraper {
    constructor() {
        super('PeptideSciences', 'https://www.peptidesciences.com');
    }

    async scrapePrice(peptideName) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();

            // Set user agent to avoid detection
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

            // Navigate to search results
            const searchUrl = `${this.vendorUrl}/search?q=${encodeURIComponent(peptideName)}`;
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            // Extract price data (adjust selectors based on actual website)
            const priceData = await page.evaluate((vendorName, vendorUrl) => {
                // Example selectors - MUST be updated to match actual website structure
                const productCard = document.querySelector('.product-item');
                if (!productCard) return null;

                const priceText = productCard.querySelector('.price')?.textContent || '0';
                const originalPriceText = productCard.querySelector('.original-price')?.textContent;
                const stockText = productCard.querySelector('.stock-status')?.textContent || '';
                const ratingText = productCard.querySelector('.rating')?.textContent || '4.5';
                const productLink = productCard.querySelector('a')?.href || '';

                // Parse price (remove $ and commas)
                const price = parseFloat(priceText.replace(/[$,]/g, ''));
                const originalPrice = originalPriceText
                    ? parseFloat(originalPriceText.replace(/[$,]/g, ''))
                    : price;

                const discount = originalPrice > price
                    ? Math.round(((originalPrice - price) / originalPrice) * 100)
                    : 0;

                return {
                    vendor: vendorName,
                    vendorUrl: vendorUrl,
                    productUrl: productLink,
                    price: price,
                    originalPrice: originalPrice,
                    discount: discount,
                    inStock: stockText.toLowerCase().includes('in stock'),
                    shipping: 'Free', // Update based on actual shipping info
                    rating: parseFloat(ratingText),
                    lastUpdated: new Date()
                };
            }, this.vendorName, this.vendorUrl);

            await browser.close();
            return priceData;

        } catch (error) {
            await browser.close();
            console.error(`Error scraping ${this.vendorName}:`, error);
            return null;
        }
    }
}

// ============================================
// 3. SCRAPER REGISTRY
// ============================================

const scrapers = {
    peptideSciences: new PeptideSciencesScraper(),
    // Add more scrapers here
    // americanResearchLabs: new AmericanResearchLabsScraper(),
    // bioTechPeptides: new BioTechPeptidesScraper(),
    // etc.
};

// ============================================
// 4. PRICE SERVICE (Business Logic)
// ============================================

class PriceService {
    constructor(database, cache) {
        this.db = database;
        this.cache = cache;
        this.CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
    }

    /**
     * Get prices for a peptide from all vendors
     */
    async getPrices(peptideName) {
        // Check cache first
        const cacheKey = `prices:${peptideName.toLowerCase()}`;
        const cached = await this.cache.get(cacheKey);

        if (cached && this.isCacheValid(cached.timestamp)) {
            return cached.data;
        }

        // Fetch from all scrapers in parallel
        const scrapePromises = Object.values(scrapers).map(scraper =>
            scraper.scrapePrice(peptideName)
                .catch(err => {
                    console.error(`Scraper ${scraper.vendorName} failed:`, err);
                    return null;
                })
        );

        const results = await Promise.all(scrapePromises);

        // Filter out null results and sort by price
        const prices = results
            .filter(result => result !== null && result.price > 0)
            .sort((a, b) => a.price - b.price);

        // Save to cache and database
        const data = {
            peptide: peptideName,
            prices: prices,
            lastUpdated: new Date()
        };

        await this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });

        await this.saveToDB(peptideName, prices);

        return data;
    }

    /**
     * Check if cached data is still valid
     */
    isCacheValid(timestamp) {
        return Date.now() - timestamp < this.CACHE_DURATION;
    }

    /**
     * Save prices to database for historical tracking
     */
    async saveToDB(peptideName, prices) {
        // Implementation depends on your database choice
        // Example for PostgreSQL:
        for (const price of prices) {
            await this.db.query(
                `INSERT INTO price_history 
         (peptide_name, vendor, price, original_price, discount, in_stock, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [peptideName, price.vendor, price.price, price.originalPrice,
                    price.discount, price.inStock, new Date()]
            );
        }
    }

    /**
     * Get price history for analytics
     */
    async getPriceHistory(peptideName, days = 30) {
        const result = await this.db.query(
            `SELECT * FROM price_history 
       WHERE peptide_name = $1 
       AND timestamp > NOW() - INTERVAL '${days} days'
       ORDER BY timestamp DESC`,
            [peptideName]
        );
        return result.rows;
    }
}

// ============================================
// 5. EXPRESS API ROUTES
// ============================================

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize services (pseudo-code)
// const db = new Database(process.env.DATABASE_URL);
// const cache = new Cache(); // Redis or in-memory
// const priceService = new PriceService(db, cache);

/**
 * GET /api/prices/:peptide
 * Get current prices for a peptide
 */
app.get('/api/prices/:peptide', async (req, res) => {
    try {
        const peptide = req.params.peptide;
        const data = await priceService.getPrices(peptide);

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error fetching prices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch prices'
        });
    }
});

/**
 * POST /api/prices/refresh
 * Force refresh prices (bypass cache)
 */
app.post('/api/prices/refresh', async (req, res) => {
    try {
        const { peptide } = req.body;

        // Clear cache
        await cache.delete(`prices:${peptide.toLowerCase()}`);

        // Fetch fresh data
        const data = await priceService.getPrices(peptide);

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to refresh prices'
        });
    }
});

/**
 * GET /api/prices/:peptide/history
 * Get price history for analytics
 */
app.get('/api/prices/:peptide/history', async (req, res) => {
    try {
        const peptide = req.params.peptide;
        const days = parseInt(req.query.days) || 30;

        const history = await priceService.getPriceHistory(peptide, days);

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch price history'
        });
    }
});

/**
 * GET /api/vendors
 * Get list of supported vendors
 */
app.get('/api/vendors', (req, res) => {
    const vendors = Object.values(scrapers).map(scraper => ({
        name: scraper.vendorName,
        url: scraper.vendorUrl
    }));

    res.json({
        success: true,
        data: vendors
    });
});

/**
 * GET /api/peptides
 * Get list of supported peptides
 */
app.get('/api/peptides', (req, res) => {
    const peptides = [
        'Semaglutide',
        'Tirzepatide',
        'BPC-157',
        'TB-500',
        'Ipamorelin',
        'CJC-1295',
        'GHK-Cu',
        'Melanotan II'
    ];

    res.json({
        success: true,
        data: peptides
    });
});

// ============================================
// 6. SCHEDULED UPDATES (CRON)
// ============================================

const cron = require('node-cron');

// Update prices every 6 hours
cron.schedule('0 */6 * * *', async () => {
    console.log('Running scheduled price update...');

    const peptides = [
        'Semaglutide',
        'Tirzepatide',
        'BPC-157',
        'TB-500'
    ];

    for (const peptide of peptides) {
        try {
            await priceService.getPrices(peptide);
            console.log(`Updated prices for ${peptide}`);
        } catch (error) {
            console.error(`Failed to update ${peptide}:`, error);
        }

        // Wait 5 seconds between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log('Scheduled price update complete');
});

// ============================================
// 7. ERROR HANDLING & MONITORING
// ============================================

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// ============================================
// 8. START SERVER
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Price API server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ============================================
// 9. FRONTEND INTEGRATION
// ============================================

/*
In your React component (PriceChecker.jsx), replace the fetchPrices function:

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const fetchPrices = async (peptide) => {
  try {
    setLoading(true);
    const response = await fetch(`${API_URL}/api/prices/${peptide}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data.prices;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Fallback to simulated data if API fails
    return generateSimulatedPrices(peptide);
  } finally {
    setLoading(false);
  }
};
*/

// ============================================
// 10. DEPLOYMENT CHECKLIST
// ============================================

/*
Environment Variables (.env):
- PORT=3001
- NODE_ENV=production
- DATABASE_URL=postgresql://user:pass@host:5432/dbname
- REDIS_URL=redis://host:6379
- ALLOWED_ORIGINS=https://your-frontend-domain.com

Dependencies (package.json):
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "puppeteer": "^21.0.0",
    "node-cron": "^3.0.2",
    "pg": "^8.11.0",
    "redis": "^4.6.7",
    "dotenv": "^16.3.1"
  }
}

Deployment Steps:
1. Set up database (PostgreSQL/MongoDB)
2. Set up Redis for caching (optional but recommended)
3. Deploy backend to Heroku/Railway/DigitalOcean
4. Set environment variables
5. Run database migrations
6. Test API endpoints
7. Update frontend API_URL
8. Deploy frontend
9. Monitor logs and errors
10. Set up alerts for scraper failures
*/

module.exports = {
    VendorScraper,
    PriceService,
    app
};
