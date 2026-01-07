import React from 'react';
import ReconstitutionCalculator from '../components/ReconstitutionCalculator';
import SEO from '../components/SEO';
import ShareButton from '../components/ShareButton';
import { getCalculatorSchemas } from '../utils/pageSchemas';

const Calculator = () => {
    return (
        <div className="padding-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <SEO
                title="Peptide Reconstitution Calculator"
                description="Free peptide reconstitution calculator. Enter your vial size, water amount, and desired dose to get precise syringe units. Supports U-100, U-50, and U-40 syringes."
                canonical="/calculator"
                jsonLd={getCalculatorSchemas()}
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
