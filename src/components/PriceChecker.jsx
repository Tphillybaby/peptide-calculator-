import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingDown, RefreshCw, DollarSign, ExternalLink, Award,
    AlertCircle, Star, Check, Package, Truck, Shield, Clock,
    ChevronDown, ChevronUp, Info, Database, Search, Filter,
    ArrowUpDown, Percent, Copy, CheckCircle, History, Zap
} from 'lucide-react';
import styles from './PriceChecker.module.css';
import { supabase } from '../lib/supabase';
import ShareButton from './ShareButton';
import PriceAlerts from './PriceAlerts';

// Fallback data in case database is not populated
import { VENDORS, PEPTIDE_PRICES, PEPTIDE_CATEGORIES, getVendorPrices } from '../data/vendorData';

const PriceChecker = () => {
    const [availablePeptides, setAvailablePeptides] = useState([]);
    const [selectedPeptide, setSelectedPeptide] = useState('');
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [expandedVendor, setExpandedVendor] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [useDatabase, setUseDatabase] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // New filter states
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('price'); // price, rating, shipping
    const [sortOrder, setSortOrder] = useState('asc');
    const [minRating, setMinRating] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState('all'); // all, crypto, credit, paypal
    const [copiedCode, setCopiedCode] = useState(null);
    const [showPriceHistory, setShowPriceHistory] = useState(false);
    const [showPriceAlerts, setShowPriceAlerts] = useState(false);

    // Coupon codes (you can move this to database later)
    const couponCodes = {
        'apollo-peptides': { code: 'PEPTIDELOG10', discount: '10% off' },
        'peptide-sciences': { code: 'SAVE15', discount: '15% off $200+' },
        'pure-rawz': { code: 'RAWZ10', discount: '10% off first order' },
        'swiss-chems': { code: 'SWISS5', discount: '5% off' },
    };

    // Price history mock data (replace with real data from database)
    const priceHistory = useMemo(() => {
        if (!selectedPeptide) return [];
        // Generate mock price history for demo
        const today = new Date();
        return Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (29 - i));
            const basePrice = prices[0]?.price || 50;
            const variance = (Math.random() - 0.5) * 10;
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                price: Math.max(10, basePrice + variance).toFixed(2)
            };
        });
    }, [selectedPeptide, prices]);

    const filteredPrices = useMemo(() => {
        let result = [...prices];

        // Search filter
        if (searchQuery) {
            result = result.filter(price =>
                price.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Rating filter
        if (minRating > 0) {
            result = result.filter(price => price.rating >= minRating);
        }

        // In stock filter
        if (inStockOnly) {
            result = result.filter(price => price.inStock);
        }

        // Payment filter
        if (paymentFilter !== 'all') {
            result = result.filter(price => {
                const methods = price.paymentMethods?.map(m => m.toLowerCase()) || [];
                if (paymentFilter === 'crypto') return methods.some(m => m.includes('crypto'));
                if (paymentFilter === 'credit') return methods.some(m => m.includes('credit'));
                if (paymentFilter === 'paypal') return methods.some(m => m.includes('paypal'));
                return true;
            });
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'price':
                    comparison = a.price - b.price;
                    break;
                case 'rating':
                    comparison = b.rating - a.rating;
                    break;
                case 'shipping': {
                    // Extract days from shipping string
                    const getDays = (s) => parseInt(s?.match(/\d+/)?.[0] || '99');
                    comparison = getDays(a.shippingDays) - getDays(b.shippingDays);
                    break;
                }
                case 'reviews':
                    comparison = (b.reviews || 0) - (a.reviews || 0);
                    break;
                default:
                    comparison = a.price - b.price;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [prices, searchQuery, minRating, inStockOnly, paymentFilter, sortBy, sortOrder]);

    // Load fallback peptide data
    const loadFallbackPeptides = () => {
        // Convert static categories to flat list
        const allPeptides = Object.values(PEPTIDE_CATEGORIES).flat().map(name => ({
            peptide_name: name,
            peptide_slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        }));
        setAvailablePeptides(allPeptides);
        setSelectedPeptide('semaglutide');
        setUseDatabase(false);
    };

    // Fetch available peptides on mount
    useEffect(() => {
        const fetchPeptides = async () => {
            try {
                // Try to get peptides from database
                const { data, error: fetchError } = await supabase
                    .rpc('get_available_peptides');

                if (fetchError) throw fetchError;

                if (data && data.length > 0) {
                    setAvailablePeptides(data);
                    setSelectedPeptide(data[0].peptide_slug);
                    setUseDatabase(true);
                } else {
                    // Fall back to static data
                    loadFallbackPeptides();
                }
            } catch (err) {
                console.error('Error fetching peptides:', err);
                loadFallbackPeptides();
            }
        };
        fetchPeptides();
    }, []);

    // Fetch prices when peptide changes
    useEffect(() => {
        if (!selectedPeptide) return;

        const loadPrices = async () => {
            setLoading(true);

            if (useDatabase) {
                try {
                    const { data, error: priceError } = await supabase
                        .rpc('get_peptide_prices', { p_peptide_slug: selectedPeptide });

                    if (priceError) throw priceError;

                    if (data && data.length > 0) {
                        // Transform database data to match expected format
                        const formattedPrices = data.map(item => ({
                            id: item.vendor_slug,
                            name: item.vendor_name,
                            logo: item.vendor_logo,
                            rating: item.vendor_rating,
                            reviews: item.vendor_reviews,
                            shipping: item.vendor_shipping,
                            shippingDays: '2-5 days',
                            price: parseFloat(item.price),
                            unit: item.unit || 'vial',
                            quantity: item.quantity,
                            inStock: item.in_stock,
                            productUrl: item.affiliate_url || item.vendor_url,
                            lastVerified: item.last_verified,
                            paymentMethods: ['Credit Card', 'Crypto'],
                            features: ['Lab Tested', 'USA Based'],
                        }));
                        setPrices(formattedPrices);
                        setLastUpdate(new Date());
                    } else {
                        // No prices in database, use fallback
                        loadFallbackPricesLocal();
                    }
                } catch (err) {
                    console.error('Error fetching prices:', err);
                    loadFallbackPricesLocal();
                }
            } else {
                loadFallbackPricesLocal();
            }

            setLoading(false);
        };

        const loadFallbackPricesLocal = () => {
            // Find the peptide name from slug
            const peptide = availablePeptides.find(p => p.peptide_slug === selectedPeptide);
            const peptideName = peptide?.peptide_name || selectedPeptide;

            // Use static vendor data
            const vendorPrices = getVendorPrices(peptideName);
            setPrices(vendorPrices);
            setLastUpdate(new Date());
        };

        loadPrices();
    }, [selectedPeptide, useDatabase, availablePeptides]);

    // Manual refresh function
    const refreshPrices = () => {
        // Trigger a refetch by setting the peptide to itself
        // This works because useEffect will detect the change in availablePeptides reference
        setLoading(true);
        const current = selectedPeptide;
        setSelectedPeptide('');
        setTimeout(() => setSelectedPeptide(current), 10);
    };

    const copyCode = async (vendorId, code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(vendorId);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const bestDeal = filteredPrices.length > 0 ? filteredPrices[0] : null;
    const avgPrice = useMemo(() => {
        if (prices.length === 0) return 0;
        return (prices.reduce((sum, p) => sum + p.price, 0) / prices.length).toFixed(2);
    }, [prices]);

    const lowestEver = useMemo(() => {
        // Mock lowest ever price (10% below current best)
        return bestDeal ? (bestDeal.price * 0.9).toFixed(2) : null;
    }, [bestDeal]);

    const selectedPeptideInfo = availablePeptides.find(p => p.peptide_slug === selectedPeptide);

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        return (
            <div className={styles.starRating}>
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        fill={i < fullStars ? '#f59e0b' : (i === fullStars && hasHalf ? '#f59e0b' : 'transparent')}
                        color={i < fullStars || (i === fullStars && hasHalf) ? '#f59e0b' : '#6b7280'}
                    />
                ))}
                <span>{rating}</span>
            </div>
        );
    };

    // Simple price history chart
    const PriceHistoryChart = () => (
        <div className={styles.priceHistoryChart}>
            <div className={styles.chartHeader}>
                <History size={18} />
                <span>30-Day Price History</span>
            </div>
            <div className={styles.chartContainer}>
                <div className={styles.chartBars}>
                    {priceHistory.map((point, i) => {
                        const maxPrice = Math.max(...priceHistory.map(p => parseFloat(p.price)));
                        const minPrice = Math.min(...priceHistory.map(p => parseFloat(p.price)));
                        const range = maxPrice - minPrice || 1;
                        const height = ((parseFloat(point.price) - minPrice) / range * 80) + 20;
                        const isLowest = parseFloat(point.price) === minPrice;

                        return (
                            <div key={i} className={styles.chartBar} title={`${point.date}: $${point.price}`}>
                                <div
                                    className={`${styles.bar} ${isLowest ? styles.lowestBar : ''}`}
                                    style={{ height: `${height}%` }}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className={styles.chartLabels}>
                    <span>{priceHistory[0]?.date}</span>
                    <span>Today</span>
                </div>
            </div>
            <div className={styles.chartStats}>
                <div>
                    <span className={styles.chartStatLabel}>Lowest</span>
                    <span className={styles.chartStatValue} style={{ color: '#10b981' }}>
                        ${Math.min(...priceHistory.map(p => parseFloat(p.price))).toFixed(2)}
                    </span>
                </div>
                <div>
                    <span className={styles.chartStatLabel}>Highest</span>
                    <span className={styles.chartStatValue} style={{ color: '#ef4444' }}>
                        ${Math.max(...priceHistory.map(p => parseFloat(p.price))).toFixed(2)}
                    </span>
                </div>
                <div>
                    <span className={styles.chartStatLabel}>Average</span>
                    <span className={styles.chartStatValue}>
                        ${(priceHistory.reduce((s, p) => s + parseFloat(p.price), 0) / priceHistory.length).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.iconWrapper}>
                        <TrendingDown size={32} />
                    </div>
                    <div>
                        <h1 className={styles.title}>Peptide Price Comparison</h1>
                        <p className={styles.subtitle}>Compare prices from trusted vendors and find the best deals</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ShareButton
                        title="Best Peptide Prices"
                        text="Find the best deals on peptides with this price checker."
                        style={{ padding: '0.5rem', borderRadius: '50%', aspectRatio: '1/1', justifyContent: 'center' }}
                    />
                    <button
                        className={styles.infoBtn}
                        onClick={() => setShowInfo(!showInfo)}
                        title="How this works"
                    >
                        <Info size={20} />
                    </button>
                </div>
            </div>

            {/* Data Source Indicator */}
            <div className={styles.dataSource}>
                <Database size={14} />
                <span>
                    {useDatabase
                        ? 'Real-time prices from database'
                        : 'Using estimated market prices'}
                </span>
                {!useDatabase && (
                    <span className={styles.estimatedBadge}>Estimated</span>
                )}
            </div>

            {/* Info Panel */}
            {showInfo && (
                <div className={styles.infoPanel}>
                    <h4>💡 How Price Comparison Works</h4>
                    <p>
                        We compile pricing data from trusted peptide vendors to help you find the best deals.
                        Prices are updated periodically and may vary. Always verify on the vendor's website before purchasing.
                    </p>
                    <p>
                        <strong>Affiliate Disclosure:</strong> We may earn a commission when you purchase through our links,
                        at no extra cost to you. This helps support our free tools and resources.
                    </p>
                </div>
            )}

            {/* Peptide Selector */}
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
                        {useDatabase ? (
                            availablePeptides.map(peptide => (
                                <option key={peptide.peptide_slug} value={peptide.peptide_slug}>
                                    {peptide.peptide_name}
                                    {peptide.min_price && ` ($${peptide.min_price.toFixed(0)} - $${peptide.max_price.toFixed(0)})`}
                                </option>
                            ))
                        ) : (
                            Object.entries(PEPTIDE_CATEGORIES).map(([category, peptides]) => (
                                <optgroup key={category} label={category}>
                                    {peptides.map(peptide => (
                                        <option key={peptide} value={peptide.toLowerCase().replace(/[^a-z0-9]/g, '-')}>
                                            {peptide}
                                        </option>
                                    ))}
                                </optgroup>
                            ))
                        )}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`${styles.filterBtn} ${showFilters ? styles.active : ''}`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                    <button
                        onClick={() => setShowPriceHistory(!showPriceHistory)}
                        className={`${styles.filterBtn} ${showPriceHistory ? styles.active : ''}`}
                    >
                        <History size={18} />
                        History
                    </button>
                    <button
                        onClick={() => setShowPriceAlerts(!showPriceAlerts)}
                        className={`${styles.filterBtn} ${showPriceAlerts ? styles.active : ''}`}
                    >
                        <AlertCircle size={18} />
                        Alerts
                    </button>
                    <button
                        onClick={refreshPrices}
                        className={`btn-primary ${styles.refreshBtn}`}
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? styles.spinning : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className={styles.filterPanel}>
                    <div className={styles.filterGroup}>
                        <label>Sort By</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="price">Price</option>
                            <option value="rating">Rating</option>
                            <option value="shipping">Shipping Speed</option>
                            <option value="reviews">Most Reviews</option>
                        </select>
                        <button
                            className={styles.sortOrderBtn}
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            <ArrowUpDown size={16} />
                            {sortOrder === 'asc' ? 'Low→High' : 'High→Low'}
                        </button>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Min Rating</label>
                        <div className={styles.ratingFilter}>
                            {[0, 4, 4.5, 4.8].map(rating => (
                                <button
                                    key={rating}
                                    className={`${styles.ratingBtn} ${minRating === rating ? styles.active : ''}`}
                                    onClick={() => setMinRating(rating)}
                                >
                                    {rating === 0 ? 'All' : `${rating}+`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Payment Method</label>
                        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                            <option value="all">All Methods</option>
                            <option value="crypto">Crypto Accepted</option>
                            <option value="credit">Credit Card</option>
                            <option value="paypal">PayPal</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={inStockOnly}
                                onChange={(e) => setInStockOnly(e.target.checked)}
                            />
                            In Stock Only
                        </label>
                    </div>
                </div>
            )}

            {/* Price History Chart */}
            {showPriceHistory && <PriceHistoryChart />}

            {/* Price Alerts */}
            {showPriceAlerts && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <PriceAlerts peptideName={selectedPeptideInfo?.peptide_name || ''} />
                </div>
            )}

            {/* Selected Peptide Info */}
            {selectedPeptideInfo && (
                <div className={styles.peptideInfo}>
                    <h2>{selectedPeptideInfo.peptide_name}</h2>
                    {selectedPeptideInfo.vendor_count && (
                        <span className={styles.unitBadge}>
                            {selectedPeptideInfo.vendor_count} vendors
                        </span>
                    )}
                </div>
            )}

            {/* Stats Row */}
            <div className={styles.statsGrid}>
                <div className={`card ${styles.statCard}`}>
                    <Award size={20} className={styles.statIcon} />
                    <div>
                        <span className={styles.statLabel}>Best Price</span>
                        <span className={styles.statValue}>
                            {bestDeal ? `$${bestDeal.price.toFixed(2)}` : '--'}
                        </span>
                    </div>
                </div>
                <div className={`card ${styles.statCard}`}>
                    <DollarSign size={20} className={styles.statIcon} />
                    <div>
                        <span className={styles.statLabel}>Average</span>
                        <span className={styles.statValue}>${avgPrice}</span>
                    </div>
                </div>
                <div className={`card ${styles.statCard}`}>
                    <Package size={20} className={styles.statIcon} />
                    <div>
                        <span className={styles.statLabel}>Vendors</span>
                        <span className={styles.statValue}>{filteredPrices.length}</span>
                    </div>
                </div>
                <div className={`card ${styles.statCard}`}>
                    <TrendingDown size={20} className={styles.statIcon} />
                    <div>
                        <span className={styles.statLabel}>You Save</span>
                        <span className={styles.statValue} style={{ color: '#10b981' }}>
                            ${bestDeal ? (avgPrice - bestDeal.price).toFixed(2) : '0.00'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Best Deal Highlight */}
            {bestDeal && (
                <div className={styles.bestDeal}>
                    <div className={styles.bestDealBadge}>
                        <Award size={18} />
                        <span>Best Deal</span>
                        {lowestEver && parseFloat(lowestEver) >= bestDeal.price && (
                            <span className={styles.lowestEverBadge}>
                                <Zap size={12} /> Near Lowest Ever!
                            </span>
                        )}
                    </div>
                    <div className={styles.bestDealContent}>
                        <div className={styles.bestDealVendor}>
                            <span className={styles.vendorLogo}>{bestDeal.logo}</span>
                            <div>
                                <h3>{bestDeal.name}</h3>
                                {renderStars(bestDeal.rating)}
                            </div>
                        </div>
                        <div className={styles.bestDealPrice}>
                            <span className={styles.priceMain}>${bestDeal.price.toFixed(2)}</span>
                            <span className={styles.priceUnit}>per {bestDeal.quantity ? `${bestDeal.quantity} ` : ''}{bestDeal.unit}</span>
                        </div>
                        <div className={styles.bestDealMeta}>
                            <span><Truck size={14} /> {bestDeal.shipping}</span>
                            <span><Clock size={14} /> {bestDeal.shippingDays}</span>
                        </div>

                        {/* Coupon Code */}
                        {couponCodes[bestDeal.id] && (
                            <div className={styles.couponBox}>
                                <Percent size={14} />
                                <span className={styles.couponDiscount}>{couponCodes[bestDeal.id].discount}</span>
                                <code className={styles.couponCode}>{couponCodes[bestDeal.id].code}</code>
                                <button
                                    className={styles.copyBtn}
                                    onClick={() => copyCode(bestDeal.id, couponCodes[bestDeal.id].code)}
                                >
                                    {copiedCode === bestDeal.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        )}

                        <a
                            href={bestDeal.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.buyBtn}
                        >
                            View Deal
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            )}

            {/* All Vendors List */}
            <div className={styles.vendorSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                        All Vendors
                        <span className={styles.vendorCount}>({filteredPrices.length})</span>
                    </h2>

                    <div className={styles.searchWrapper} style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '8px 12px 8px 36px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                width: '200px'
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingState}>
                        <RefreshCw size={32} className={styles.spinning} />
                        <p>Comparing prices...</p>
                    </div>
                ) : filteredPrices.length === 0 ? (
                    <div className={styles.emptyState}>
                        <AlertCircle size={32} />
                        <p>{searchQuery ? 'No vendors found matching your search.' : 'No prices found for this peptide.'}</p>
                    </div>
                ) : (
                    <div className={styles.vendorList}>
                        {filteredPrices.map((vendor, index) => (
                            <div
                                key={vendor.id}
                                className={`${styles.vendorCard} ${index === 0 && !searchQuery ? styles.bestVendor : ''}`}
                            >
                                <div
                                    className={styles.vendorMain}
                                    onClick={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                                >
                                    <div className={styles.vendorInfo}>
                                        <span className={styles.vendorLogo}>{vendor.logo}</span>
                                        <div>
                                            <h3 className={styles.vendorName}>
                                                {vendor.name}
                                                {index === 0 && !searchQuery && <span className={styles.bestTag}>Best Price</span>}
                                            </h3>
                                            <div className={styles.vendorMeta}>
                                                {renderStars(vendor.rating)}
                                                {vendor.reviews && (
                                                    <span className={styles.reviewCount}>
                                                        ({vendor.reviews.toLocaleString()} reviews)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.vendorPrice}>
                                        <span className={styles.price}>${vendor.price.toFixed(2)}</span>
                                        <span className={styles.priceUnit}>
                                            /{vendor.quantity ? `${vendor.quantity} ` : ''}{vendor.unit}
                                        </span>
                                        {index > 0 && bestDeal && (
                                            <span className={styles.priceDiff}>
                                                +${(vendor.price - bestDeal.price).toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    <div className={styles.vendorStatus}>
                                        {vendor.inStock ? (
                                            <span className={styles.inStock}>
                                                <Check size={14} /> In Stock
                                            </span>
                                        ) : (
                                            <span className={styles.outOfStock}>
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>

                                    <div className={styles.vendorActions}>
                                        <a
                                            href={vendor.productUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.viewBtn}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View <ExternalLink size={14} />
                                        </a>
                                        <button className={styles.expandBtn}>
                                            {expandedVendor === vendor.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedVendor === vendor.id && (
                                    <div className={styles.vendorDetails}>
                                        <div className={styles.detailsGrid}>
                                            <div className={styles.detailItem}>
                                                <Truck size={16} />
                                                <div>
                                                    <span className={styles.detailLabel}>Shipping</span>
                                                    <span className={styles.detailValue}>{vendor.shipping}</span>
                                                </div>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <Clock size={16} />
                                                <div>
                                                    <span className={styles.detailLabel}>Delivery</span>
                                                    <span className={styles.detailValue}>{vendor.shippingDays}</span>
                                                </div>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <Shield size={16} />
                                                <div>
                                                    <span className={styles.detailLabel}>Payment</span>
                                                    <span className={styles.detailValue}>
                                                        {vendor.paymentMethods?.join(', ') || 'Credit Card, Crypto'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coupon code if available */}
                                        {couponCodes[vendor.id] && (
                                            <div className={styles.couponBox} style={{ marginTop: '1rem' }}>
                                                <Percent size={14} />
                                                <span className={styles.couponDiscount}>{couponCodes[vendor.id].discount}</span>
                                                <code className={styles.couponCode}>{couponCodes[vendor.id].code}</code>
                                                <button
                                                    className={styles.copyBtn}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyCode(vendor.id, couponCodes[vendor.id].code);
                                                    }}
                                                >
                                                    {copiedCode === vendor.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        )}

                                        {vendor.features && (
                                            <div className={styles.features}>
                                                {vendor.features.map((feature, i) => (
                                                    <span key={i} className={styles.featureTag}>
                                                        <Check size={12} /> {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <a
                                            href={vendor.productUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.visitStoreBtn}
                                        >
                                            Visit {vendor.name}
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Update Time & Disclaimer */}
            <div className={styles.footer}>
                {lastUpdate && (
                    <p className={styles.updateTime}>
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                )}
                <div className={styles.disclaimer}>
                    <AlertCircle size={16} />
                    <p>
                        <strong>Disclaimer:</strong> Prices shown are estimates and may vary.
                        Always verify current pricing on the vendor's website before purchasing.
                        We earn affiliate commissions on qualifying purchases.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PriceChecker;
