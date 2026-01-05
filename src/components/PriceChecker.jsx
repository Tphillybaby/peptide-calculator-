import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingDown, RefreshCw, DollarSign, ExternalLink, Award,
    AlertCircle, Star, Check, Package, Truck, Shield, Clock,
    ChevronDown, ChevronUp, Info, Database
} from 'lucide-react';
import styles from './PriceChecker.module.css';
import { supabase } from '../lib/supabase';
import ShareButton from './ShareButton';

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
    const [error, setError] = useState(null);

    // Fetch available peptides on mount
    useEffect(() => {
        fetchAvailablePeptides();
    }, []);

    // Fetch prices when peptide changes
    useEffect(() => {
        if (selectedPeptide) {
            fetchPrices();
        }
    }, [selectedPeptide]);

    const fetchAvailablePeptides = async () => {
        try {
            // Try to get peptides from database
            const { data, error } = await supabase
                .rpc('get_available_peptides');

            if (error) throw error;

            if (data && data.length > 0) {
                setAvailablePeptides(data);
                setSelectedPeptide(data[0].peptide_slug);
                setUseDatabase(true);
            } else {
                // Fall back to static data
                useFallbackData();
            }
        } catch (err) {
            console.error('Error fetching peptides:', err);
            useFallbackData();
        }
    };

    const useFallbackData = () => {
        // Convert static categories to flat list
        const allPeptides = Object.values(PEPTIDE_CATEGORIES).flat().map(name => ({
            peptide_name: name,
            peptide_slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        }));
        setAvailablePeptides(allPeptides);
        setSelectedPeptide('semaglutide');
        setUseDatabase(false);
    };

    const fetchPrices = async () => {
        setLoading(true);
        setError(null);

        if (useDatabase) {
            try {
                const { data, error } = await supabase
                    .rpc('get_peptide_prices', { p_peptide_slug: selectedPeptide });

                if (error) throw error;

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
                    // No prices in database for this peptide, use fallback
                    loadFallbackPrices();
                }
            } catch (err) {
                console.error('Error fetching prices:', err);
                loadFallbackPrices();
            }
        } else {
            loadFallbackPrices();
        }

        setLoading(false);
    };

    const loadFallbackPrices = () => {
        // Find the peptide name from slug
        const peptide = availablePeptides.find(p => p.peptide_slug === selectedPeptide);
        const peptideName = peptide?.peptide_name || selectedPeptide;

        // Use static vendor data
        const vendorPrices = getVendorPrices(peptideName);
        setPrices(vendorPrices);
        setLastUpdate(new Date());
    };

    const bestDeal = prices.length > 0 ? prices[0] : null;
    const avgPrice = useMemo(() => {
        if (prices.length === 0) return 0;
        return (prices.reduce((sum, p) => sum + p.price, 0) / prices.length).toFixed(2);
    }, [prices]);

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

    // Group peptides by category for the selector
    const groupedPeptides = useMemo(() => {
        if (!useDatabase) {
            return PEPTIDE_CATEGORIES;
        }
        // For database mode, just return a flat "All Peptides" group
        return {
            'All Peptides': availablePeptides.map(p => ({
                name: p.peptide_name,
                slug: p.peptide_slug
            }))
        };
    }, [availablePeptides, useDatabase]);

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
                        ? 'Prices from database'
                        : 'Using estimated prices'}
                </span>
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

                <button
                    onClick={fetchPrices}
                    className={`btn-primary ${styles.refreshBtn}`}
                    disabled={loading}
                >
                    <RefreshCw size={18} className={loading ? styles.spinning : ''} />
                    Refresh Prices
                </button>
            </div>

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
                        <span className={styles.statValue}>{prices.length}</span>
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
                <h2 className={styles.sectionTitle}>All Vendors</h2>

                {loading ? (
                    <div className={styles.loadingState}>
                        <RefreshCw size={32} className={styles.spinning} />
                        <p>Comparing prices...</p>
                    </div>
                ) : prices.length === 0 ? (
                    <div className={styles.emptyState}>
                        <AlertCircle size={32} />
                        <p>No prices found for this peptide.</p>
                    </div>
                ) : (
                    <div className={styles.vendorList}>
                        {prices.map((vendor, index) => (
                            <div
                                key={vendor.id}
                                className={`${styles.vendorCard} ${index === 0 ? styles.bestVendor : ''}`}
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
                                                {index === 0 && <span className={styles.bestTag}>Best Price</span>}
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
