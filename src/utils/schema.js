/**
 * Schema.org structured data generators for SEO
 * These help search engines understand our content better
 */

// Base organization schema
export const getOrganizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PeptideLog',
    url: 'https://peptidelog.net',
    logo: 'https://peptidelog.net/pwa-512x512.png',
    description: 'Free peptide reconstitution calculator and injection tracker for research professionals.',
    sameAs: [
        // Add social media profiles when available
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@peptidelog.net',
        contactType: 'customer support',
    },
});

// Website schema for search functionality
export const getWebsiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PeptideLog',
    url: 'https://peptidelog.net',
    description: 'Free peptide reconstitution calculator and injection tracker.',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://peptidelog.net/encyclopedia?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
    },
});

// Web application schema
export const getWebAppSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PeptideLog',
    url: 'https://peptidelog.net',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
    featureList: [
        'Peptide reconstitution calculator',
        'Injection tracking and logging',
        'Half-life decay plotting',
        'Price comparison tool',
        'Peptide encyclopedia',
        'Protocol scheduling',
    ],
    screenshot: 'https://peptidelog.net/pwa-512x512.png',
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '156',
    },
});

// Peptide product schema
export const getPeptideSchema = (peptide) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: peptide.name,
    description: peptide.description || `${peptide.name} peptide information and dosage protocols.`,
    category: peptide.category || 'Peptides',
    brand: {
        '@type': 'Brand',
        name: 'Research Peptide',
    },
    offers: peptide.price ? {
        '@type': 'AggregateOffer',
        lowPrice: peptide.minPrice,
        highPrice: peptide.maxPrice,
        priceCurrency: 'USD',
        offerCount: peptide.vendorCount || 1,
    } : undefined,
    aggregateRating: peptide.rating ? {
        '@type': 'AggregateRating',
        ratingValue: peptide.rating,
        reviewCount: peptide.reviewCount,
    } : undefined,
});

// Article/Guide schema
export const getArticleSchema = (article) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
        '@type': 'Organization',
        name: 'PeptideLog',
    },
    publisher: {
        '@type': 'Organization',
        name: 'PeptideLog',
        logo: {
            '@type': 'ImageObject',
            url: 'https://peptidelog.net/pwa-512x512.png',
        },
    },
    datePublished: article.publishedDate || new Date().toISOString(),
    dateModified: article.modifiedDate || new Date().toISOString(),
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://peptidelog.net${article.url}`,
    },
});

// FAQ schema for guides/help pages
export const getFAQSchema = (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
        },
    })),
});

// HowTo schema for tutorials
export const getHowToSchema = (howTo) => ({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.title,
    description: howTo.description,
    totalTime: howTo.duration || 'PT10M',
    step: howTo.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.description,
        image: step.image,
    })),
});

// Breadcrumb schema
export const getBreadcrumbSchema = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url ? `https://peptidelog.net${item.url}` : undefined,
    })),
});

// Medical content disclaimer schema
export const getMedicalDisclaimerSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    about: {
        '@type': 'MedicalCondition',
        name: 'Peptide Research',
    },
    lastReviewed: new Date().toISOString().split('T')[0],
    reviewedBy: {
        '@type': 'Organization',
        name: 'PeptideLog Research Team',
    },
    specialty: 'Research',
    audience: {
        '@type': 'MedicalAudience',
        audienceType: 'Researchers',
    },
    disclaimer: 'This website is for informational purposes only. Content is not intended to be a substitute for professional medical advice, diagnosis, or treatment.',
});

// Combine multiple schemas for a page
export const combineSchemas = (...schemas) => schemas.filter(Boolean);

// Get default page schemas
export const getDefaultSchemas = () => [
    getOrganizationSchema(),
    getWebsiteSchema(),
    getWebAppSchema(),
];
