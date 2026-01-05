import React from 'react';
import ReconstitutionCalculator from '../components/ReconstitutionCalculator';
import SEO from '../components/SEO';
import ShareButton from '../components/ShareButton';

const Calculator = () => {
    return (
        <div className="padding-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <SEO
                title="Peptide Reconstitution Calculator"
                description="Easily calculate peptide reconstitution dosages. Enter your vial size and water amount to get precise injection units."
                canonical="/calculator"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <ShareButton
                    title="Peptide Reconstitution Calculator"
                    text="Use this free tool to calculate your peptide doses accurately."
                />
            </div>
            <ReconstitutionCalculator />
        </div>
    );
};

export default Calculator;
