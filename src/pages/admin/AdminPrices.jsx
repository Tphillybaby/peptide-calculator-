import React, { useState, useEffect } from 'react';
import {
    DollarSign, RefreshCw, Play, CheckCircle, XCircle,
    Clock, TrendingDown, TrendingUp, Edit2, Save, X,
    ExternalLink, AlertTriangle, Database, BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import styles from './AdminPrices.module.css';

const AdminPrices = () => {
    const [vendors, setVendors] = useState([]);
    const [prices, setPrices] = useState([]);
    const [scrapeLogs, setScrapeLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scraping, setScraping] = useState(false);
    const [scrapingVendor, setScrapingVendor] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, prices, logs
    const [editingPrice, setEditingPrice] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch vendors
            const { data: vendorData } = await supabase
                .from('vendors')
                .select('*')
                .order('name');
            setVendors(vendorData || []);

            // Fetch all prices with vendor info
            const { data: priceData } = await supabase
                .from('peptide_prices')
                .select(`
                    *,
                    vendors:vendor_id (name, slug, logo_emoji)
                `)
                .order('peptide_name');
            setPrices(priceData || []);

            // Fetch recent scrape logs
            const { data: logData } = await supabase
                .from('scrape_logs')
                .select(`
                    *,
                    vendors:vendor_id (name)
                `)
                .order('created_at', { ascending: false })
                .limit(50);
            setScrapeLogs(logData || []);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
        }
        setLoading(false);
    };

    const triggerScrape = async (vendorSlug = null) => {
        setScraping(true);
        setError('');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Not authenticated');
            }

            // Determine which vendors to scrape
            const vendorsToScrape = vendorSlug
                ? vendors.filter(v => v.slug === vendorSlug)
                : vendors.filter(v => v.is_active);

            if (vendorsToScrape.length === 0) {
                throw new Error('No active vendors found to scrape');
            }

            let successCount = 0;
            let errorMessages = [];

            for (const vendor of vendorsToScrape) {
                setScrapingVendor(vendor.slug); // Update UI

                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-prices`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${session.access_token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ vendor_slug: vendor.slug }),
                        }
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error || 'Scrape failed');
                    }
                    successCount++;
                } catch (err) {
                    console.error(`Error scraping ${vendor.name}:`, err);
                    errorMessages.push(`${vendor.name}: ${err.message}`);
                }
            }

            if (errorMessages.length > 0) {
                if (successCount > 0) {
                    setError(`Partial success. Errors: ${errorMessages.join('; ')}`);
                    showSuccess(`Scraped ${successCount} vendors successfully.`);
                } else {
                    setError(`Scrape failed: ${errorMessages.join('; ')}`);
                }
            } else {
                showSuccess(`Scrape completed: ${successCount} vendor(s) processed`);
            }

            fetchData(); // Refresh data

        } catch (err) {
            console.error('Scrape error:', err);
            setError(`Scrape failed: ${err.message}`);
        }

        setScraping(false);
        setScrapingVendor(null);
    };

    const updatePrice = async (priceId, newPrice) => {
        try {
            const { error } = await supabase
                .from('peptide_prices')
                .update({
                    price: parseFloat(newPrice),
                    updated_at: new Date().toISOString(),
                    last_verified_at: new Date().toISOString()
                })
                .eq('id', priceId);

            if (error) throw error;

            showSuccess('Price updated');
            setEditingPrice(null);
            fetchData();
        } catch (err) {
            setError('Failed to update price');
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPeptidePriceStats = () => {
        const peptides = {};
        prices.forEach(p => {
            if (!peptides[p.peptide_slug]) {
                peptides[p.peptide_slug] = {
                    name: p.peptide_name,
                    prices: [],
                };
            }
            peptides[p.peptide_slug].prices.push(p.price);
        });

        return Object.entries(peptides).map(([slug, data]) => ({
            slug,
            name: data.name,
            minPrice: Math.min(...data.prices),
            maxPrice: Math.max(...data.prices),
            avgPrice: (data.prices.reduce((a, b) => a + b, 0) / data.prices.length).toFixed(2),
            vendorCount: data.prices.length,
        })).sort((a, b) => a.name.localeCompare(b.name));
    };

    const stats = {
        totalVendors: vendors.length,
        activeVendors: vendors.filter(v => v.is_active).length,
        totalPrices: prices.length,
        lastScrape: scrapeLogs[0]?.created_at || null,
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1><DollarSign size={28} /> Price Management</h1>
                    <p>Monitor and manage peptide prices across vendors</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.refreshBtn}
                        onClick={fetchData}
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? styles.spin : ''} />
                        Refresh
                    </button>
                    <button
                        className={styles.scrapeBtn}
                        onClick={() => triggerScrape()}
                        disabled={scraping}
                    >
                        <Play size={18} className={scraping ? styles.spin : ''} />
                        {scraping ? 'Scraping...' : 'Scrape All'}
                    </button>
                </div>
            </div>

            {/* Messages */}
            {successMessage && (
                <div className={styles.successBanner}>
                    <CheckCircle size={18} /> {successMessage}
                </div>
            )}
            {error && (
                <div className={styles.errorBanner}>
                    <XCircle size={18} /> {error}
                </div>
            )}

            {/* Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <Database size={24} />
                    <div>
                        <span className={styles.statValue}>{stats.totalVendors}</span>
                        <span className={styles.statLabel}>Vendors</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <DollarSign size={24} />
                    <div>
                        <span className={styles.statValue}>{stats.totalPrices}</span>
                        <span className={styles.statLabel}>Price Records</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <BarChart3 size={24} />
                    <div>
                        <span className={styles.statValue}>{getPeptidePriceStats().length}</span>
                        <span className={styles.statLabel}>Peptides Tracked</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <Clock size={24} />
                    <div>
                        <span className={styles.statValue}>{formatDate(stats.lastScrape)}</span>
                        <span className={styles.statLabel}>Last Scrape</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'vendors' ? styles.active : ''}`}
                    onClick={() => setActiveTab('vendors')}
                >
                    Vendors
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'prices' ? styles.active : ''}`}
                    onClick={() => setActiveTab('prices')}
                >
                    All Prices
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'logs' ? styles.active : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Scrape Logs
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <RefreshCw size={32} className={styles.spin} />
                    Loading...
                </div>
            ) : (
                <>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className={styles.overview}>
                            <h2>Price Summary by Peptide</h2>
                            <div className={styles.priceTable}>
                                <div className={styles.tableHeader}>
                                    <span>Peptide</span>
                                    <span>Min Price</span>
                                    <span>Max Price</span>
                                    <span>Avg Price</span>
                                    <span>Vendors</span>
                                </div>
                                {getPeptidePriceStats().map(peptide => (
                                    <div key={peptide.slug} className={styles.tableRow}>
                                        <span className={styles.peptideName}>{peptide.name}</span>
                                        <span className={styles.minPrice}>${peptide.minPrice.toFixed(2)}</span>
                                        <span className={styles.maxPrice}>${peptide.maxPrice.toFixed(2)}</span>
                                        <span>${peptide.avgPrice}</span>
                                        <span>{peptide.vendorCount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vendors Tab */}
                    {activeTab === 'vendors' && (
                        <div className={styles.vendorList}>
                            {vendors.map(vendor => (
                                <div key={vendor.id} className={styles.vendorCard}>
                                    <div className={styles.vendorInfo}>
                                        <span className={styles.vendorLogo}>{vendor.logo_emoji}</span>
                                        <div>
                                            <h3>{vendor.name}</h3>
                                            <p>
                                                <a href={vendor.website_url} target="_blank" rel="noopener noreferrer">
                                                    {vendor.website_url} <ExternalLink size={12} />
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                    <div className={styles.vendorMeta}>
                                        <span>
                                            <Clock size={14} />
                                            Last scraped: {formatDate(vendor.last_scraped_at)}
                                        </span>
                                        <span className={vendor.is_active ? styles.active : styles.inactive}>
                                            {vendor.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <button
                                        className={styles.scrapeVendorBtn}
                                        onClick={() => triggerScrape(vendor.slug)}
                                        disabled={scraping}
                                    >
                                        {scrapingVendor === vendor.slug ? (
                                            <><RefreshCw size={16} className={styles.spin} /> Scraping...</>
                                        ) : (
                                            <><Play size={16} /> Scrape Now</>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* All Prices Tab */}
                    {activeTab === 'prices' && (
                        <div className={styles.allPrices}>
                            <div className={styles.priceGrid}>
                                {prices.map(price => (
                                    <div key={price.id} className={styles.priceCard}>
                                        <div className={styles.priceHeader}>
                                            <span className={styles.pricePeptide}>{price.peptide_name}</span>
                                            <span className={styles.priceVendor}>
                                                {price.vendors?.logo_emoji} {price.vendors?.name}
                                            </span>
                                        </div>
                                        <div className={styles.priceBody}>
                                            {editingPrice === price.id ? (
                                                <div className={styles.editPrice}>
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                    <button onClick={() => updatePrice(price.id, editValue)}>
                                                        <Save size={16} />
                                                    </button>
                                                    <button onClick={() => setEditingPrice(null)}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.priceDisplay}>
                                                    <span className={styles.priceAmount}>${price.price.toFixed(2)}</span>
                                                    <button
                                                        onClick={() => {
                                                            setEditingPrice(price.id);
                                                            setEditValue(price.price);
                                                        }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                            <span className={styles.priceUnit}>per {price.unit}</span>
                                        </div>
                                        <div className={styles.priceMeta}>
                                            <span className={price.in_stock ? styles.inStock : styles.outOfStock}>
                                                {price.in_stock ? '✓ In Stock' : '✗ Out of Stock'}
                                            </span>
                                            <span className={styles.lastVerified}>
                                                {formatDate(price.last_verified_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Scrape Logs Tab */}
                    {activeTab === 'logs' && (
                        <div className={styles.logsSection}>
                            <div className={styles.logsList}>
                                {scrapeLogs.length === 0 ? (
                                    <div className={styles.emptyLogs}>
                                        <AlertTriangle size={32} />
                                        <p>No scrape logs yet. Run a scrape to see results.</p>
                                    </div>
                                ) : (
                                    scrapeLogs.map(log => (
                                        <div key={log.id} className={`${styles.logItem} ${styles[log.status]}`}>
                                            <div className={styles.logHeader}>
                                                <span className={styles.logVendor}>{log.vendors?.name || 'Unknown'}</span>
                                                <span className={`${styles.logStatus} ${styles[log.status]}`}>
                                                    {log.status}
                                                </span>
                                            </div>
                                            <div className={styles.logDetails}>
                                                <span>Products found: {log.products_found}</span>
                                                <span>Products updated: {log.products_updated}</span>
                                                <span>Duration: {log.duration_ms}ms</span>
                                            </div>
                                            {log.error_message && (
                                                <div className={styles.logError}>
                                                    {log.error_message}
                                                </div>
                                            )}
                                            <div className={styles.logTime}>
                                                {formatDate(log.created_at)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPrices;
