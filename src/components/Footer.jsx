import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, FileText, Mail } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.section}>
                        <h3>Peptide Tracker</h3>
                        <p>Your personal peptide management companion</p>
                        <div className={styles.made}>
                            Made with <Heart size={14} className={styles.heart} /> for the biohacking community
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h4>Legal</h4>
                        <Link to="/terms" className={styles.link}>
                            <FileText size={16} />
                            Terms of Service
                        </Link>
                        <Link to="/privacy" className={styles.link}>
                            <Shield size={16} />
                            Privacy Policy
                        </Link>
                    </div>

                    <div className={styles.section}>
                        <h4>Support</h4>
                        <a href="mailto:support@peptidetracker.com" className={styles.link}>
                            <Mail size={16} />
                            Contact Us
                        </a>
                        <Link to="/settings" className={styles.link}>
                            Settings
                        </Link>
                    </div>

                    <div className={styles.section}>
                        <h4>Disclaimer</h4>
                        <p className={styles.disclaimer}>
                            This app is for informational purposes only and does not provide medical advice.
                            Always consult with a qualified healthcare provider before starting any peptide protocol.
                        </p>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {currentYear} Peptide Tracker. All rights reserved.
                    </p>
                    <p className={styles.version}>
                        Version 1.0.0
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
