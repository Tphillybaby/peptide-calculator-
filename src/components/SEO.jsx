import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getDefaultSchemas } from '../utils/schema';

const SEO = ({
    title,
    description,
    canonical,
    type = 'website',
    image,
    jsonLd,
    includeDefaultSchemas = true,
}) => {
    const siteName = 'PeptideLog';
    const defaultDescription = 'Free peptide reconstitution calculator and injection tracker. Log your doses, track half-lives, and manage your peptide protocols safely.';
    const defaultImage = 'https://peptidelog.net/pwa-512x512.png';
    const domain = 'https://peptidelog.net';

    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Peptide Calculator & Tracker`;
    const fullDescription = description || defaultDescription;
    const fullImage = image ? (image.startsWith('http') ? image : `${domain}${image}`) : defaultImage;
    const url = canonical ? (canonical.startsWith('http') ? canonical : `${domain}${canonical}`) : (typeof window !== 'undefined' ? window.location.href : domain);

    // Combine default schemas with any page-specific schemas
    const allSchemas = [];

    if (includeDefaultSchemas) {
        allSchemas.push(...getDefaultSchemas());
    }

    if (jsonLd) {
        if (Array.isArray(jsonLd)) {
            allSchemas.push(...jsonLd);
        } else {
            allSchemas.push(jsonLd);
        }
    }

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            <meta name="twitter:image" content={fullImage} />

            {/* JSON-LD Schema - render each schema separately for better parsing */}
            {allSchemas.map((schema, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEO;

