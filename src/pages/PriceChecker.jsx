import React from 'react';
import PriceCheckerComponent from '../components/PriceChecker';
import SEO from '../components/SEO';

const PriceChecker = () => {
    return (
        <div style={{ padding: 0 }}>
            <SEO
                title="Peptide Price Checker & Comparison"
                description="Compare peptide prices from top vendors. Find the best deals on BPC-157, Tirzepatide, and more. Updated daily."
                canonical="/price-checker"
            />
            <PriceCheckerComponent />
        </div>
    );
};

export default PriceChecker;
