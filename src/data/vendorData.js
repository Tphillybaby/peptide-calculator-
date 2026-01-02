/**
 * Vendor Configuration with Affiliate Links
 * 
 * HOW TO ADD YOUR AFFILIATE LINKS:
 * 1. Sign up for each vendor's affiliate program
 * 2. Replace 'YOUR_AFFILIATE_ID' with your actual affiliate ID
 * 3. The URL format may vary - check each vendor's affiliate dashboard
 * 
 * EXAMPLE:
 * If Peptide Sciences gives you ID "trevor123", change:
 *   affiliateUrl: 'https://www.peptidesciences.com/?ref=YOUR_AFFILIATE_ID'
 * To:
 *   affiliateUrl: 'https://www.peptidesciences.com/?ref=trevor123'
 */

export const VENDORS = [
    {
        id: 'peptide-sciences',
        name: 'Peptide Sciences',
        logo: '🧬',
        baseUrl: 'https://www.peptidesciences.com',
        // Replace YOUR_AFFILIATE_ID with your actual affiliate ID
        affiliateUrl: 'https://www.peptidesciences.com/?ref=YOUR_AFFILIATE_ID',
        affiliateProgram: 'https://www.peptidesciences.com/affiliates',
        rating: 4.8,
        reviews: 2847,
        shipping: 'Free over $200',
        shippingDays: '3-5 days',
        paymentMethods: ['Credit Card', 'Crypto', 'Zelle'],
        features: ['USA-based', 'COA Available', 'Fast Shipping'],
        priceModifier: 1.0, // Base price
        trusted: true
    },
    {
        id: 'pure-rawz',
        name: 'PureRawz',
        logo: '⚗️',
        baseUrl: 'https://purerawz.co',
        affiliateUrl: 'https://purerawz.co/?aff=YOUR_AFFILIATE_ID',
        affiliateProgram: 'https://purerawz.co/affiliate-program',
        rating: 4.6,
        reviews: 1923,
        shipping: 'Free over $150',
        shippingDays: '2-4 days',
        paymentMethods: ['Credit Card', 'Crypto', 'PayPal'],
        features: ['Third-party tested', 'Rewards Program', 'USA Shipping'],
        priceModifier: 0.95, // 5% cheaper on average
        trusted: true
    },
    {
        id: 'swiss-chems',
        name: 'Swiss Chems',
        logo: '🇨🇭',
        baseUrl: 'https://swisschems.is',
        affiliateUrl: 'https://swisschems.is/?ref=YOUR_AFFILIATE_ID',
        affiliateProgram: 'https://swisschems.is/affiliate',
        rating: 4.7,
        reviews: 1654,
        shipping: '$9.99 flat rate',
        shippingDays: '5-7 days',
        paymentMethods: ['Credit Card', 'Crypto', 'Bank Transfer'],
        features: ['European Quality', 'Bulk Discounts', 'HPLC Tested'],
        priceModifier: 0.92, // Good for bulk
        trusted: true
    },
    {
        id: 'biotech-peptides',
        name: 'BioTech Peptides',
        logo: '🔬',
        baseUrl: 'https://biotechpeptides.com',
        affiliateUrl: 'https://biotechpeptides.com/?ref=YOUR_AFFILIATE_ID',
        affiliateProgram: 'https://biotechpeptides.com/affiliate',
        rating: 4.5,
        reviews: 1287,
        shipping: 'Free over $100',
        shippingDays: '2-5 days',
        paymentMethods: ['Credit Card', 'Crypto'],
        features: ['Lab Tested', 'USA Made', 'Quantity Discounts'],
        priceModifier: 0.98,
        trusted: true
    },
    {
        id: 'amino-asylum',
        name: 'Amino Asylum',
        logo: '💊',
        baseUrl: 'https://aminoasylum.com',
        affiliateUrl: 'https://aminoasylum.com/?ref=YOUR_AFFILIATE_ID',
        affiliateProgram: null, // Contact directly
        rating: 4.4,
        reviews: 892,
        shipping: '$8.99 flat rate',
        shippingDays: '3-6 days',
        paymentMethods: ['Credit Card', 'Crypto', 'Zelle'],
        features: ['Affordable', 'Wide Selection', 'Bundle Deals'],
        priceModifier: 0.88, // Budget friendly
        trusted: true
    },
    {
        id: 'paradigm-peptides',
        name: 'Paradigm Peptides',
        logo: '🎯',
        baseUrl: 'https://paradigmpeptides.com',
        affiliateUrl: 'https://paradigmpeptides.com/?ref=YOUR_AFFILIATE_ID',
        affiliateProgram: 'https://paradigmpeptides.com/affiliate',
        rating: 4.6,
        reviews: 1456,
        shipping: 'Free over $150',
        shippingDays: '2-4 days',
        paymentMethods: ['Credit Card', 'Crypto', 'E-check'],
        features: ['Fast Shipping', 'Quality Guarantee', 'USA Based'],
        priceModifier: 1.02,
        trusted: true
    }
];

/**
 * Base prices for peptides (in USD)
 * These are approximate market prices - adjust as needed
 */
export const PEPTIDE_PRICES = {
    // GLP-1 Agonists & Weight Loss
    'Semaglutide': { price: 249, unit: '5mg vial' },
    'Tirzepatide': { price: 289, unit: '10mg vial' },
    'Retatrutide': { price: 319, unit: '10mg vial' },
    'Liraglutide': { price: 189, unit: '3mg vial' },
    'Dulaglutide': { price: 175, unit: '1.5mg vial' },
    'Exenatide': { price: 165, unit: '5mcg vial' },

    // Growth Hormone Secretagogues
    'CJC-1295 (no DAC)': { price: 42, unit: '2mg vial' },
    'CJC-1295 (DAC)': { price: 55, unit: '2mg vial' },
    'Ipamorelin': { price: 38, unit: '5mg vial' },
    'GHRP-2': { price: 32, unit: '5mg vial' },
    'GHRP-6': { price: 28, unit: '5mg vial' },
    'Hexarelin': { price: 45, unit: '2mg vial' },
    'MK-677 (Ibutamoren)': { price: 85, unit: '30 capsules' },

    // Healing & Recovery
    'BPC-157': { price: 48, unit: '5mg vial' },
    'TB-500': { price: 52, unit: '5mg vial' },
    'Thymosin Alpha-1': { price: 115, unit: '5mg vial' },
    'Thymosin Beta-4': { price: 125, unit: '5mg vial' },
    'GHK-Cu': { price: 35, unit: '50mg vial' },

    // Cosmetic & Skin
    'Melanotan I': { price: 42, unit: '10mg vial' },
    'Melanotan II': { price: 38, unit: '10mg vial' },
    'PT-141 (Bremelanotide)': { price: 45, unit: '10mg vial' },
    'GHK-Cu (Copper Peptide)': { price: 35, unit: '50mg vial' },

    // Performance & Muscle
    'IGF-1 LR3': { price: 185, unit: '1mg vial' },
    'IGF-1 DES': { price: 145, unit: '1mg vial' },
    'Follistatin 344': { price: 275, unit: '1mg vial' },
    'ACE-031': { price: 320, unit: '1mg vial' },
    'YK-11': { price: 65, unit: '10mg/ml' },

    // Cognitive & Nootropic
    'Semax': { price: 48, unit: '30mg vial' },
    'Selank': { price: 52, unit: '5mg vial' },
    'Cerebrolysin': { price: 165, unit: '5ml vial' },
    'P21': { price: 125, unit: '50mg vial' },
    'Dihexa': { price: 145, unit: '50mg vial' },

    // Metabolic & Other
    'AOD-9604': { price: 58, unit: '5mg vial' },
    'MOTS-c': { price: 95, unit: '5mg vial' },
    'Epithalon': { price: 85, unit: '10mg vial' },
    'Pinealon': { price: 55, unit: '20mg vial' },
    'SS-31 (Elamipretide)': { price: 225, unit: '50mg vial' }
};

/**
 * Generate vendor prices for a specific peptide
 * Adds realistic variation between vendors
 */
export const getVendorPrices = (peptideName) => {
    const baseData = PEPTIDE_PRICES[peptideName];
    if (!baseData) {
        return VENDORS.map(vendor => ({
            ...vendor,
            price: 99.99,
            unit: 'varies',
            inStock: true,
            productUrl: vendor.affiliateUrl
        }));
    }

    return VENDORS.map(vendor => {
        // Add small random variance (-3% to +5%) for realism
        const variance = 1 + (Math.random() * 0.08 - 0.03);
        const finalPrice = (baseData.price * vendor.priceModifier * variance).toFixed(2);

        // 90% chance of being in stock
        const inStock = Math.random() > 0.1;

        return {
            ...vendor,
            price: parseFloat(finalPrice),
            unit: baseData.unit,
            inStock,
            productUrl: vendor.affiliateUrl
        };
    }).sort((a, b) => a.price - b.price);
};

/**
 * Peptide categories for the selector
 */
export const PEPTIDE_CATEGORIES = {
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
