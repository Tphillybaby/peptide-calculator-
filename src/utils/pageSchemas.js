/**
 * Pre-built structured data for key pages
 * Import these in page components to improve SEO
 */

import { getFAQSchema, getHowToSchema, getBreadcrumbSchema } from './schema';

// FAQ data for the Calculator page
export const calculatorFAQs = [
    {
        question: 'How do I calculate peptide reconstitution?',
        answer: 'Enter the peptide amount in milligrams, the desired dosage, and the amount of bacteriostatic water you want to use. The calculator will show you exactly how many units to draw for each dose.'
    },
    {
        question: 'What is bacteriostatic water?',
        answer: 'Bacteriostatic water (BAC water) is sterile water that contains 0.9% benzyl alcohol as a preservative. It prevents bacterial growth, allowing reconstituted peptides to be stored for multiple uses.'
    },
    {
        question: 'How long do reconstituted peptides last?',
        answer: 'Most reconstituted peptides remain stable for 3-4 weeks when stored properly in a refrigerator at 2-8°C (36-46°F). Some peptides may last longer while others are more fragile.'
    },
    {
        question: 'How many units are in a syringe?',
        answer: 'Insulin syringes typically come in 100 units per 1ml (U-100). A 0.5ml syringe has 50 units marked, and a 0.3ml syringe has 30 units marked.'
    },
    {
        question: 'What needle size should I use for peptide injections?',
        answer: 'For subcutaneous peptide injections, a 29-31 gauge needle with 1/2 inch (12.7mm) length is commonly used. This size is thin enough to minimize discomfort while being effective for subcutaneous delivery.'
    }
];

// FAQ data for the Encyclopedia page
export const encyclopediaFAQs = [
    {
        question: 'What are peptides?',
        answer: 'Peptides are short chains of amino acids linked by peptide bonds. Unlike proteins, peptides contain fewer amino acids (typically 2-50). They serve as signaling molecules in the body and are being researched for various applications.'
    },
    {
        question: 'How are peptides categorized?',
        answer: 'Peptides are commonly categorized by their function: growth hormone secretagogues (GHRPs, GHRHs), healing peptides (BPC-157, TB-500), metabolic peptides (tirzepatide, semaglutide), and others.'
    },
    {
        question: 'Are peptides legal?',
        answer: 'Peptide legality varies by country and intended use. Many peptides are legal to purchase for research purposes. However, regulations differ significantly between jurisdictions, so always check local laws.'
    },
    {
        question: 'What is the difference between research peptides and pharmaceutical peptides?',
        answer: 'Pharmaceutical peptides have undergone clinical trials and received regulatory approval for specific medical uses. Research peptides are intended for scientific study and are not approved for human use.'
    }
];

// HowTo data for reconstitution guide
export const reconstitutionHowTo = {
    title: 'How to Reconstitute Peptides',
    description: 'Step-by-step guide for safely reconstituting lyophilized peptides with bacteriostatic water.',
    duration: 'PT15M',
    steps: [
        {
            title: 'Gather Supplies',
            description: 'Collect your peptide vial, bacteriostatic water, alcohol swabs, insulin syringes, and a clean workspace.'
        },
        {
            title: 'Clean the Vial Tops',
            description: 'Use alcohol swabs to thoroughly clean the rubber stoppers on both the peptide vial and bacteriostatic water vial.'
        },
        {
            title: 'Calculate Water Amount',
            description: 'Use the PeptideLog calculator to determine how much bacteriostatic water to add based on your desired dosage.'
        },
        {
            title: 'Draw Bacteriostatic Water',
            description: 'Insert the needle into the BAC water vial and draw the calculated amount of water into the syringe.'
        },
        {
            title: 'Add Water to Peptide Vial',
            description: 'Insert the needle into the peptide vial at an angle. Slowly dispense the water down the side of the vial - never directly onto the peptide powder.'
        },
        {
            title: 'Allow to Dissolve',
            description: 'Let the peptide dissolve naturally. Do not shake the vial. Gentle swirling is acceptable if needed.'
        },
        {
            title: 'Store Properly',
            description: 'Store the reconstituted peptide in a refrigerator at 2-8°C. Use within 3-4 weeks for best results.'
        }
    ]
};

// HowTo data for injection guide
export const injectionHowTo = {
    title: 'How to Inject Peptides Subcutaneously',
    description: 'Guide for performing subcutaneous peptide injections safely and effectively.',
    duration: 'PT10M',
    steps: [
        {
            title: 'Prepare Your Workspace',
            description: 'Ensure you have a clean, well-lit area. Gather your reconstituted peptide, new syringe, and alcohol swabs.'
        },
        {
            title: 'Calculate Your Dose',
            description: 'Using the PeptideLog calculator, determine how many units to draw based on your reconstitution ratio.'
        },
        {
            title: 'Draw the Peptide',
            description: 'Clean the vial top with an alcohol swab. Draw air equal to your dose, inject into vial, then draw the peptide solution.'
        },
        {
            title: 'Choose Injection Site',
            description: 'Common subcutaneous sites include the abdomen (2 inches from navel), thigh, or upper arm. Rotate sites to prevent lipodystrophy.'
        },
        {
            title: 'Clean the Injection Site',
            description: 'Wipe the chosen injection site with an alcohol swab and let it dry completely.'
        },
        {
            title: 'Perform the Injection',
            description: 'Pinch the skin, insert the needle at a 45-90 degree angle, slowly inject the peptide, wait 5 seconds, then withdraw.'
        },
        {
            title: 'Dispose Safely',
            description: 'Place the used syringe in a sharps container. Never reuse needles or syringes.'
        }
    ]
};

// Get calculator page schema
export const getCalculatorSchemas = () => [
    getFAQSchema(calculatorFAQs),
    getHowToSchema(reconstitutionHowTo),
    getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Calculator', url: '/calculator' }
    ])
];

// Get encyclopedia page schema  
export const getEncyclopediaSchemas = () => [
    getFAQSchema(encyclopediaFAQs),
    getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Encyclopedia', url: '/encyclopedia' }
    ])
];

// Get guides page schema
export const getGuidesSchemas = () => [
    getHowToSchema(reconstitutionHowTo),
    getHowToSchema(injectionHowTo),
    getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Guides', url: '/guides' }
    ])
];

// Get injection sites page schema
export const getInjectionSitesSchemas = () => [
    getHowToSchema(injectionHowTo),
    getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Injection Sites', url: '/injection-sites' }
    ])
];
