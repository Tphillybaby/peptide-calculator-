import React, { useState, useEffect } from 'react';
import { TrendingDown, RefreshCw, DollarSign, ExternalLink, Award, AlertCircle } from 'lucide-react';
import styles from './PriceChecker.module.css';

// Mock vendor data - In production, this would come from an API
const VENDORS = [
    { id: 'vendor1', name: 'PeptideSciences', url: 'https://www.peptidesciences.com' },
    { id: 'vendor2', name: 'AmericanResearchLabs', url: 'https://americanresearchlabs.com' },
    { id: 'vendor3', name: 'BioTechPeptides', url: 'https://biotechpeptides.com' },
    { id: 'vendor4', name: 'PureRawz', url: 'https://purerawz.co' },
    { id: 'vendor5', name: 'SwissChems', url: 'https://swisschems.is' }
];

const PEPTIDE_CATEGORIES = {
    'GLP-1 Agonists & Weight Loss': [
        'Semaglutide',
        'Tirzepatide',
        'Retatrutide',
        'Liraglutide',
        'Dulaglutide',
        'Exenatide'
    ],
    'Growth Hormone Secretagogues': [
        'CJC-1295 (no DAC)',
        'CJC-1295 (DAC)',
        'Ipamorelin',
        'GHRP-2',
        'GHRP-6',
        'Hexarelin',
        'MK-677 (Ibutamoren)'
    ],
    'Healing & Recovery': [
        'BPC-157',
        'TB-500',
        'Thymosin Alpha-1',
        'Thymosin Beta-4',
        'GHK-Cu'
    ],
    'Cosmetic & Skin': [
        'Melanotan I',
        'Melanotan II',
        'PT-141 (Bremelanotide)',
        'GHK-Cu (Copper Peptide)'
    ],
    'Performance & Muscle': [
        'IGF-1 LR3',
        'IGF-1 DES',
        'Follistatin 344',
        'ACE-031',
        'YK-11'
    ],
    'Cognitive & Nootropic': [
        'Semax',
        'Selank',
        'Cerebrolysin',
        'P21',
        'Dihexa'
    ],
    'Metabolic & Other': [
        'AOD-9604',
        'MOTS-c',
        'Epithalon',
        'Pinealon',
        'SS-31 (Elamipretide)'
    ]
};

// Simulated price fetching function
const fetchPrices = (peptide) => {
    return VENDORS.map(vendor => {
        const basePrice = Math.random() * 100 + 50; // Random base price between $50-$150
        const discount = Math.random() * 30; // Random discount up to 30%
        const originalPrice = basePrice + (basePrice * discount / 100);

        return {
            vendor: vendor.name,
            vendorUrl: vendor.url,
            price: basePrice.toFixed(2),
            originalPrice: originalPrice.toFixed(2),
            discount: discount.toFixed(0),
            inStock: Math.random() > 0.1, // 90% chance in stock
            shipping: Math.random() > 0.5 ? 'Free' : `$${(Math.random() * 10 + 5).toFixed(2)}`,
            rating: (Math.random() * 1 + 4).toFixed(1), // Rating between 4.0-5.0
            lastUpdated: new Date()
        };
    }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
};

const PriceChecker = () => {
    const [selectedPeptide, setSelectedPeptide] = useState('Semaglutide');
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    const loadPrices = () => {
        setLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            const newPrices = fetchPrices(selectedPeptide);
            setPrices(newPrices);
            setLastUpdate(new Date());
            setLoading(false);
        }, 800);
    };

    useEffect(() => {
        loadPrices();
    }, [selectedPeptide]);

    const bestDeal = prices.length > 0 ? prices[0] : null;
    const avgPrice = prices.length > 0
        ? (prices.reduce((sum, p) => sum + parseFloat(p.price), 0) / prices.length).toFixed(2)
        : 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.iconWrapper}>
                        <TrendingDown size={32} />
                    </div>
                    <div>
                        <h1 className={styles.title}>Live Price Checker</h1>
                        <p className={styles.subtitle}>Find the best deals on peptides from trusted vendors</p>
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.selectWrapper}>
                    <label htmlFor="peptide-select" className={styles.label}>
                        Select Peptide
                    </label>
                    <select
                        id="peptide-select"
                        value={selectedPeptide}
                        onChange={(e) => setSelectedPeptide(e.target.value)}
                        className={styles.select}
                    >
                        {Object.entries(PEPTIDE_CATEGORIES).map(([category, peptides]) => (
                            <optgroup key={category} label={category}>
                                {peptides.map(peptide => (
                                    <option key={peptide} value={peptide}>{peptide}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <button
                    onClick={loadPrices}
                    className={`btn-primary ${styles.refreshBtn}`}
                    disabled={loading}
                >
                    <RefreshCw size={18} className={loading ? styles.spinning : ''} />
                    Refresh Prices
                </button>
            </div>

            {lastUpdate && (
                <div className={styles.updateInfo}>
                    Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
            )}

            {bestDeal && (
                <div className={`glass-panel ${styles.bestDeal}`}>
                    <div className={styles.bestDealBadge}>
                        <Award size={20} />
                        <span>Best Deal</span>
                    </div>
                    <div className={styles.bestDealContent}>
                        <div className={styles.vendorInfo}>
                            <h3>{bestDeal.vendor}</h3>
                            <div className={styles.rating}>
                                ⭐ {bestDeal.rating}
                            </div>
                        </div>
                        <div className={styles.priceInfo}>
                            <div className={styles.currentPrice}>
                                <DollarSign size={24} />
                                <span className={styles.priceValue}>{bestDeal.price}</span>
                            </div>
                            {bestDeal.discount > 0 && (
                                <div className={styles.savings}>
                                    <span className={styles.originalPrice}>${bestDeal.originalPrice}</span>
                                    <span className={styles.discountBadge}>-{bestDeal.discount}%</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.dealDetails}>
                            <span className={styles.shipping}>
                                {bestDeal.shipping === 'Free' ? '🚚 Free Shipping' : `🚚 Shipping: ${bestDeal.shipping}`}
                            </span>
                            <a
                                href={bestDeal.vendorUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.visitBtn}
                            >
                                Visit Store
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.statsGrid}>
                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Average Price</span>
                    <span className={styles.statValue}>${avgPrice}</span>
                </div>
                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Vendors Compared</span>
                    <span className={styles.statValue}>{prices.length}</span>
                </div>
                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Potential Savings</span>
                    <span className={styles.statValue}>
                        {bestDeal ? `$${(avgPrice - parseFloat(bestDeal.price)).toFixed(2)}` : '$0.00'}
                    </span>
                </div>
            </div>

            <div className={styles.priceList}>
                <h2 className={styles.sectionTitle}>All Vendors</h2>
                {loading ? (
                    <div className={styles.loadingState}>
                        <RefreshCw size={48} className={styles.spinning} />
                        <p>Loading prices...</p>
                    </div>
                ) : (
                    <div className={styles.vendorGrid}>
                        {prices.map((item, index) => (
                            <div key={index} className={`card ${styles.vendorCard}`}>
                                <div className={styles.vendorHeader}>
                                    <div>
                                        <h3 className={styles.vendorName}>{item.vendor}</h3>
                                        <div className={styles.vendorRating}>⭐ {item.rating}</div>
                                    </div>
                                    {index === 0 && (
                                        <div className={styles.bestBadge}>
                                            <Award size={16} />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.vendorPricing}>
                                    <div className={styles.mainPrice}>
                                        <DollarSign size={20} />
                                        <span>{item.price}</span>
                                    </div>
                                    {item.discount > 0 && (
                                        <div className={styles.discountInfo}>
                                            <span className={styles.wasPrice}>${item.originalPrice}</span>
                                            <span className={styles.savePercent}>Save {item.discount}%</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.vendorDetails}>
                                    <div className={styles.stockStatus}>
                                        {item.inStock ? (
                                            <span className={styles.inStock}>✓ In Stock</span>
                                        ) : (
                                            <span className={styles.outOfStock}>✗ Out of Stock</span>
                                        )}
                                    </div>
                                    <div className={styles.shippingInfo}>
                                        {item.shipping === 'Free' ? (
                                            <span className={styles.freeShipping}>Free Shipping</span>
                                        ) : (
                                            <span>Shipping: {item.shipping}</span>
                                        )}
                                    </div>
                                </div>

                                <a
                                    href={item.vendorUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.vendorLink}
                                    disabled={!item.inStock}
                                >
                                    View Product
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={`glass-panel ${styles.disclaimer}`}>
                <AlertCircle size={20} />
                <div>
                    <strong>Disclaimer:</strong> Prices are simulated for demonstration purposes.
                    In a production environment, this would fetch real-time data from vendor APIs or web scraping services.
                    Always verify prices on the vendor's website before purchasing.
                </div>
            </div>
        </div>
    );
};

export default PriceChecker;
