import React, { useState, useEffect } from 'react';
import { TrendingDown, RefreshCw, DollarSign, ExternalLink, Award, AlertCircle } from 'lucide-react';
import styles from './PriceChecker.module.css';
import { BASE_PEPTIDE_PRICES, VENDORS, SHIPPING_OPTIONS } from '../data/mockPriceData';

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

const priceCache = new Map(); // cache per peptide for 5 minutes

const mockFetchPrices = (peptide) => {
    const base = BASE_PEPTIDE_PRICES[peptide] || 120;

    const response = VENDORS.map(vendor => {
        const variance = (Math.random() * 0.08) - 0.04; // +/-4% variance
        const priceValue = base * vendor.modifier * (1 + variance);
        const discount = Math.max(0, Math.round((1 - priceValue / (base * 1.15)) * 100));
        const originalPrice = priceValue / (1 - discount / 100 || 1);

        return {
            vendor: vendor.name,
            vendorUrl: vendor.url,
            price: priceValue.toFixed(2),
            originalPrice: originalPrice.toFixed(2),
            discount: discount.toFixed(0),
            inStock: Math.random() > 0.12,
            shipping: SHIPPING_OPTIONS[Math.floor(Math.random() * SHIPPING_OPTIONS.length)],
            rating: (Math.random() * 0.6 + 4.1).toFixed(1),
            lastUpdated: new Date()
        };
    }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.03) {
                reject(new Error('Simulated fetch failure'));
                return;
            }
            resolve(response);
        }, 600 + Math.random() * 400);
    });
};

const PriceChecker = () => {
    const [selectedPeptide, setSelectedPeptide] = useState('Semaglutide');
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Loading prices...');

    const loadPrices = () => {
        const cacheHit = priceCache.get(selectedPeptide);
        const now = Date.now();
        if (cacheHit && now - cacheHit.timestamp < 5 * 60 * 1000) {
            setPrices(cacheHit.data);
            setLastUpdate(new Date(cacheHit.timestamp));
            setStatusMessage('Loaded from cache.');
            return;
        }

        setLoading(true);
        setError(null);
        setStatusMessage('Fetching prices...');
        mockFetchPrices(selectedPeptide)
            .then((newPrices) => {
                setPrices(newPrices);
                const ts = Date.now();
                setLastUpdate(new Date(ts));
                priceCache.set(selectedPeptide, { data: newPrices, timestamp: ts });
                setStatusMessage('Updated just now.');
            })
            .catch((err) => {
                console.error(err);
                setPrices([]);
                setError('Unable to load prices right now. Please retry.');
                setStatusMessage('Failed to update.');
            })
            .finally(() => {
                setLoading(false);
            });
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
                <div className={styles.simNote}>
                    <AlertCircle size={16} />
                    <span>Simulation only — randomized demo data, not live prices.</span>
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

            <div className={styles.updateInfo} aria-live="polite">
                {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Fetching prices...'}
            </div>
            {error && (
                <div className={styles.errorBanner} aria-live="assertive">
                    <AlertCircle size={18} />
                    <span>{error}</span>
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
                <div className={styles.vendorGridWrapper} aria-busy={loading}>
                    {loading ? (
                        <div className={styles.loadingState} aria-live="polite">
                            <RefreshCw size={48} className={styles.spinning} />
                            <p>{statusMessage}</p>
                        </div>
                    ) : prices.length === 0 ? (
                        <div className={styles.emptyState} aria-live="polite">
                            <AlertCircle size={32} />
                            <p>{error || 'No prices available. Try refreshing.'}</p>
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
