import React from 'react';
import { FileText } from 'lucide-react';
import styles from './Legal.module.css';
import SEO from '../components/SEO';

const Terms = () => {
    return (
        <>
            <SEO
                title="Terms of Service | User Agreement & Disclaimer"
                description="Read PeptideLog's Terms of Service, including medical disclaimers, user responsibilities, and usage guidelines."
                canonical="/terms"
            />
            <div className={styles.container}>
                <div className={styles.header}>
                    <FileText size={32} />
                    <h1>Terms of Service</h1>
                    <p className={styles.lastUpdated}>Last Updated: November 24, 2025</p>
                </div>

                <div className={`card ${styles.content}`}>
                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using PeptideLog ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                            If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2>2. Description of Service</h2>
                        <p>
                            PeptideLog is a personal tracking and informational tool designed to help users:
                        </p>
                        <ul>
                            <li>Track peptide injections and dosages</li>
                            <li>Calculate reconstitution measurements</li>
                            <li>Monitor peptide half-life decay</li>
                            <li>Compare vendor pricing</li>
                            <li>Schedule and plan peptide protocols</li>
                        </ul>
                        <p>
                            <strong>The Service is NOT a medical device, healthcare provider, or medical advice platform.</strong>
                        </p>
                    </section>

                    <section>
                        <h2>3. Medical Disclaimer</h2>
                        <div className={styles.warning}>
                            <p><strong>IMPORTANT: READ CAREFULLY</strong></p>
                            <ul>
                                <li>This Service is for informational and tracking purposes only</li>
                                <li>It does NOT provide medical advice, diagnosis, or treatment</li>
                                <li>Always consult with a qualified healthcare provider before starting any peptide protocol</li>
                                <li>Never disregard professional medical advice or delay seeking it because of information from this Service</li>
                                <li>The Service is not a substitute for professional medical care</li>
                                <li>In case of medical emergency, call 911 or your local emergency services immediately</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2>4. User Responsibilities</h2>
                        <p>You agree to:</p>
                        <ul>
                            <li>Provide accurate information when using the Service</li>
                            <li>Use the Service only for lawful purposes</li>
                            <li>Not share your account credentials with others</li>
                            <li>Maintain the security of your account</li>
                            <li>Comply with all applicable laws and regulations</li>
                            <li>Use peptides only under proper medical supervision</li>
                            <li>Verify all calculations and information independently</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Prohibited Uses</h2>
                        <p>You may NOT use the Service to:</p>
                        <ul>
                            <li>Violate any laws or regulations</li>
                            <li>Distribute controlled substances illegally</li>
                            <li>Provide medical advice to others</li>
                            <li>Impersonate any person or entity</li>
                            <li>Transmit viruses or malicious code</li>
                            <li>Attempt to gain unauthorized access to the Service</li>
                            <li>Scrape or harvest data from the Service</li>
                            <li>Use the Service for commercial purposes without authorization</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Accuracy of Information</h2>
                        <p>
                            While we strive to provide accurate information, we make no warranties or guarantees about:
                        </p>
                        <ul>
                            <li>The accuracy of calculations</li>
                            <li>The completeness of peptide information</li>
                            <li>The reliability of vendor pricing data</li>
                            <li>The effectiveness of suggested protocols</li>
                        </ul>
                        <p>
                            <strong>Always verify all information with qualified healthcare professionals and trusted sources.</strong>
                        </p>
                    </section>

                    <section>
                        <h2>7. Limitation of Liability</h2>
                        <p>
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PEPTIDELOG AND ITS OPERATORS SHALL NOT BE LIABLE FOR:
                        </p>
                        <ul>
                            <li>Any health issues or adverse reactions from peptide use</li>
                            <li>Errors or inaccuracies in calculations or information</li>
                            <li>Loss of data or service interruptions</li>
                            <li>Any indirect, incidental, or consequential damages</li>
                            <li>Decisions made based on information from the Service</li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. Data and Privacy</h2>
                        <p>
                            Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to:
                        </p>
                        <ul>
                            <li>Collection and storage of your health tracking data</li>
                            <li>Use of cookies and similar technologies</li>
                            <li>Data processing as described in our Privacy Policy</li>
                        </ul>
                    </section>

                    <section>
                        <h2>9. Intellectual Property</h2>
                        <p>
                            All content, features, and functionality of the Service are owned by PeptideLog and are protected by copyright,
                            trademark, and other intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h2>10. Third-Party Links and Services</h2>
                        <p>
                            The Service may contain links to third-party websites or services (such as peptide vendors). We are not responsible for:
                        </p>
                        <ul>
                            <li>The content or practices of third-party sites</li>
                            <li>Product quality from vendors</li>
                            <li>Transactions with third parties</li>
                            <li>Accuracy of third-party pricing information</li>
                        </ul>
                    </section>

                    <section>
                        <h2>11. Account Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account at any time for:
                        </p>
                        <ul>
                            <li>Violation of these Terms</li>
                            <li>Fraudulent or illegal activity</li>
                            <li>Abuse of the Service</li>
                            <li>Any reason at our sole discretion</li>
                        </ul>
                    </section>

                    <section>
                        <h2>12. Changes to Terms</h2>
                        <p>
                            We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
                            We will notify users of significant changes via email or in-app notification.
                        </p>
                    </section>

                    <section>
                        <h2>13. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                            without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section>
                        <h2>14. Contact Information</h2>
                        <p>
                            For questions about these Terms, please contact us at:
                        </p>
                        <p>
                            Email: legal@peptidelog.net<br />
                            Address: [Your Business Address]
                        </p>
                    </section>

                    <section>
                        <h2>15. Severability</h2>
                        <p>
                            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated
                            to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
                        </p>
                    </section>

                    <div className={styles.acknowledgment}>
                        <p><strong>BY USING THIS SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS.</strong></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Terms;
