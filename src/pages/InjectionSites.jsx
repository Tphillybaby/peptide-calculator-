import React from 'react';
import SEO from '../components/SEO';
import InjectionSiteMap from '../components/InjectionSiteMap';
import { getInjectionSitesSchemas } from '../utils/pageSchemas';

const InjectionSites = () => {
    return (
        <>
            <SEO
                title="Injection Site Guide | Where to Inject Peptides"
                description="Interactive guide to safe injection sites for peptide administration. Learn proper subcutaneous and intramuscular injection techniques with visual diagrams."
                canonical="/injection-sites"
                jsonLd={getInjectionSitesSchemas()}
            />
            <InjectionSiteMap />
        </>
    );
};

export default InjectionSites;
