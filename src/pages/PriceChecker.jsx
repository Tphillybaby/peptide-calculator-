import React from 'react';
import PriceCheckerComponent from '../components/PriceChecker';
import SEO from '../components/SEO';

const PriceChecker = () => {
    return (
        <div style={{ padding: 0 }}>
            <SEO
                title="Peptide Price Checker & Comparison"
                description="Compare recorded peptide vendor quotes, vial amounts, cost per mg, and verification dates. Check current availability directly with vendors."
                canonical="/price-checker"
            />
            <PriceCheckerComponent />
        </div>
    );
};

export default PriceChecker;
