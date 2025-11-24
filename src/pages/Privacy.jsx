import React from 'react';
import { Shield } from 'lucide-react';
import styles from './Legal.module.css';

const Privacy = () => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Shield size={32} />
                <h1>Privacy Policy</h1>
                <p className={styles.lastUpdated}>Last Updated: November 24, 2025</p>
            </div>

            <div className={`card ${styles.content}`}>
                <section>
                    <h2>1. Introduction</h2>
                    <p>
                        Peptide Tracker ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect,
                        use, disclose, and safeguard your information when you use our Service.
                    </p>
                    <p>
                        <strong>Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy,
                            please do not access the Service.</strong>
                    </p>
                </section>

                <section>
                    <h2>2. Information We Collect</h2>

                    <h3>2.1 Personal Information</h3>
                    <p>We may collect personal information that you voluntarily provide, including:</p>
                    <ul>
                        <li>Name and email address</li>
                        <li>Account credentials (username, password)</li>
                        <li>Profile information (age, gender, optional)</li>
                        <li>Payment information (processed by third-party payment processors)</li>
                    </ul>

                    <h3>2.2 Health Information</h3>
                    <p>As a health tracking application, we collect sensitive health data, including:</p>
                    <ul>
                        <li>Peptide injection records (type, dosage, date, time)</li>
                        <li>Body measurements and weight</li>
                        <li>Side effects and notes</li>
                        <li>Photos (if you choose to upload them)</li>
                        <li>Lab results (if you choose to upload them)</li>
                        <li>Health goals and preferences</li>
                    </ul>
                    <p className={styles.warning}>
                        <strong>Important:</strong> This is Protected Health Information (PHI) under HIPAA. We take extensive measures to protect this data.
                    </p>

                    <h3>2.3 Usage Data</h3>
                    <p>We automatically collect certain information when you use the Service:</p>
                    <ul>
                        <li>Device information (type, operating system, browser)</li>
                        <li>IP address and location data</li>
                        <li>Usage patterns and feature interactions</li>
                        <li>Log data and error reports</li>
                        <li>Cookies and similar tracking technologies</li>
                    </ul>
                </section>

                <section>
                    <h2>3. How We Use Your Information</h2>
                    <p>We use the collected information to:</p>
                    <ul>
                        <li><strong>Provide the Service:</strong> Track injections, calculate dosages, generate reports</li>
                        <li><strong>Improve the Service:</strong> Analyze usage patterns, fix bugs, develop new features</li>
                        <li><strong>Personalize Experience:</strong> Customize recommendations and content</li>
                        <li><strong>Communicate:</strong> Send notifications, updates, and support messages</li>
                        <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
                        <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our Terms</li>
                        <li><strong>Analytics:</strong> Understand user behavior and improve our Service (anonymized data)</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Data Sharing and Disclosure</h2>

                    <h3>4.1 We DO NOT Sell Your Data</h3>
                    <p className={styles.highlight}>
                        <strong>We will never sell your personal or health information to third parties.</strong>
                    </p>

                    <h3>4.2 When We May Share Data</h3>
                    <p>We may share your information only in the following circumstances:</p>
                    <ul>
                        <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your data</li>
                        <li><strong>Service Providers:</strong> Third-party vendors who help us operate the Service (hosting, analytics, payment processing)</li>
                        <li><strong>Healthcare Providers:</strong> If you use our telehealth features and authorize sharing</li>
                        <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                        <li><strong>Safety and Security:</strong> To protect the rights, property, or safety of us, our users, or others</li>
                    </ul>

                    <h3>4.3 Anonymized Data</h3>
                    <p>
                        We may use and share aggregated, anonymized data that cannot identify you personally for research,
                        analytics, and improving the Service.
                    </p>
                </section>

                <section>
                    <h2>5. Data Security</h2>
                    <p>We implement industry-standard security measures to protect your data:</p>
                    <ul>
                        <li><strong>Encryption:</strong> All data is encrypted in transit (SSL/TLS) and at rest (AES-256)</li>
                        <li><strong>Access Controls:</strong> Strict authentication and authorization mechanisms</li>
                        <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
                        <li><strong>Employee Training:</strong> Staff trained on data protection and privacy</li>
                        <li><strong>Secure Infrastructure:</strong> Hosted on secure, compliant cloud platforms</li>
                        <li><strong>Backup and Recovery:</strong> Regular backups with disaster recovery procedures</li>
                    </ul>
                    <p className={styles.warning}>
                        <strong>Note:</strong> While we use reasonable security measures, no method of transmission over the Internet
                        or electronic storage is 100% secure. We cannot guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2>6. Your Privacy Rights</h2>
                    <p>Depending on your location, you may have the following rights:</p>

                    <h3>6.1 Access and Portability</h3>
                    <ul>
                        <li>Request a copy of your personal data</li>
                        <li>Export your data in a machine-readable format</li>
                    </ul>

                    <h3>6.2 Correction and Update</h3>
                    <ul>
                        <li>Update or correct inaccurate information</li>
                        <li>Complete incomplete data</li>
                    </ul>

                    <h3>6.3 Deletion</h3>
                    <ul>
                        <li>Request deletion of your account and data</li>
                        <li>Right to be forgotten (subject to legal requirements)</li>
                    </ul>

                    <h3>6.4 Restriction and Objection</h3>
                    <ul>
                        <li>Restrict processing of your data</li>
                        <li>Object to certain uses of your data</li>
                    </ul>

                    <h3>6.5 Withdraw Consent</h3>
                    <ul>
                        <li>Withdraw consent for data processing at any time</li>
                        <li>Opt-out of marketing communications</li>
                    </ul>

                    <p>To exercise these rights, contact us at privacy@peptidetracker.com</p>
                </section>

                <section>
                    <h2>7. Data Retention</h2>
                    <p>We retain your data for as long as:</p>
                    <ul>
                        <li>Your account is active</li>
                        <li>Needed to provide the Service</li>
                        <li>Required by law or regulation</li>
                        <li>Necessary for legitimate business purposes</li>
                    </ul>
                    <p>
                        When you delete your account, we will delete or anonymize your personal data within 30 days,
                        except where we are legally required to retain it.
                    </p>
                </section>

                <section>
                    <h2>8. Cookies and Tracking Technologies</h2>
                    <p>We use cookies and similar technologies to:</p>
                    <ul>
                        <li>Remember your preferences and settings</li>
                        <li>Authenticate your account</li>
                        <li>Analyze usage and improve the Service</li>
                        <li>Provide personalized content</li>
                    </ul>
                    <p>
                        You can control cookies through your browser settings. Note that disabling cookies may limit
                        functionality of the Service.
                    </p>
                </section>

                <section>
                    <h2>9. Third-Party Services</h2>
                    <p>Our Service may integrate with third-party services:</p>
                    <ul>
                        <li><strong>Payment Processors:</strong> Stripe, PayPal (we do not store credit card information)</li>
                        <li><strong>Analytics:</strong> Google Analytics (anonymized)</li>
                        <li><strong>Cloud Hosting:</strong> AWS, Google Cloud, or similar</li>
                        <li><strong>Email Services:</strong> SendGrid, Mailgun, or similar</li>
                    </ul>
                    <p>
                        These third parties have their own privacy policies. We encourage you to review them.
                    </p>
                </section>

                <section>
                    <h2>10. Children's Privacy</h2>
                    <p>
                        The Service is not intended for individuals under 18 years of age. We do not knowingly collect
                        personal information from children. If you believe we have collected information from a child,
                        please contact us immediately.
                    </p>
                </section>

                <section>
                    <h2>11. International Data Transfers</h2>
                    <p>
                        Your information may be transferred to and processed in countries other than your own.
                        We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                    </p>
                </section>

                <section>
                    <h2>12. California Privacy Rights (CCPA)</h2>
                    <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act:</p>
                    <ul>
                        <li>Right to know what personal information is collected</li>
                        <li>Right to know if personal information is sold or disclosed</li>
                        <li>Right to say no to the sale of personal information</li>
                        <li>Right to access your personal information</li>
                        <li>Right to equal service and price</li>
                    </ul>
                </section>

                <section>
                    <h2>13. GDPR Compliance (European Users)</h2>
                    <p>If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation:</p>
                    <ul>
                        <li>Legal basis for processing (consent, contract, legitimate interest)</li>
                        <li>Right to lodge a complaint with supervisory authority</li>
                        <li>Right to data portability</li>
                        <li>Automated decision-making protections</li>
                    </ul>
                </section>

                <section>
                    <h2>14. Changes to This Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of significant changes by:
                    </p>
                    <ul>
                        <li>Posting the new Privacy Policy on this page</li>
                        <li>Updating the "Last Updated" date</li>
                        <li>Sending an email notification (for material changes)</li>
                        <li>In-app notification</li>
                    </ul>
                </section>

                <section>
                    <h2>15. Contact Us</h2>
                    <p>For questions or concerns about this Privacy Policy or our data practices:</p>
                    <p>
                        <strong>Email:</strong> privacy@peptidetracker.com<br />
                        <strong>Data Protection Officer:</strong> dpo@peptidetracker.com<br />
                        <strong>Address:</strong> [Your Business Address]
                    </p>
                </section>

                <div className={styles.acknowledgment}>
                    <p><strong>BY USING THIS SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THIS PRIVACY POLICY.</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
