import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './MedicalDisclaimer.module.css';

const MedicalDisclaimer = ({ compact = false }) => {
    if (compact) {
        return (
            <div className={`${styles.disclaimer} ${styles.compact}`}>
                <AlertTriangle size={16} />
                <p>
                    <strong>Medical Disclaimer:</strong> This tool is for informational purposes only and does not provide medical advice.
                    Always consult with a qualified healthcare provider before starting any peptide protocol.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.disclaimer}>
            <div className={styles.header}>
                <AlertTriangle size={32} />
                <h2>Important Medical Disclaimer</h2>
            </div>

            <div className={styles.content}>
                <div className={styles.warningBox}>
                    <h3>⚠️ This is NOT Medical Advice</h3>
                    <p>
                        PeptideLog is a personal tracking and informational tool only. It does NOT:
                    </p>
                    <ul>
                        <li>Provide medical advice, diagnosis, or treatment</li>
                        <li>Replace consultation with qualified healthcare providers</li>
                        <li>Guarantee the safety or effectiveness of any peptide</li>
                        <li>Verify the accuracy of calculations or information</li>
                    </ul>
                </div>

                <div className={styles.section}>
                    <h3>🏥 Always Consult Healthcare Professionals</h3>
                    <p>
                        Before starting, stopping, or changing any peptide protocol, you MUST:
                    </p>
                    <ul>
                        <li>Consult with a licensed physician or healthcare provider</li>
                        <li>Undergo appropriate medical testing and monitoring</li>
                        <li>Disclose all medications, supplements, and health conditions</li>
                        <li>Follow professional medical guidance</li>
                    </ul>
                </div>

                <div className={styles.section}>
                    <h3>⚕️ Peptide Safety Considerations</h3>
                    <ul>
                        <li><strong>Prescription Required:</strong> Many peptides require a valid prescription</li>
                        <li><strong>Medical Supervision:</strong> Use only under proper medical supervision</li>
                        <li><strong>Individual Variation:</strong> Effects vary significantly between individuals</li>
                        <li><strong>Side Effects:</strong> All peptides carry potential risks and side effects</li>
                        <li><strong>Drug Interactions:</strong> May interact with other medications</li>
                        <li><strong>Contraindications:</strong> Not suitable for everyone</li>
                    </ul>
                </div>

                <div className={styles.section}>
                    <h3>🔬 Verify All Information</h3>
                    <p>
                        You are responsible for:
                    </p>
                    <ul>
                        <li>Verifying all calculations independently</li>
                        <li>Confirming peptide information with reliable sources</li>
                        <li>Ensuring proper reconstitution and dosing</li>
                        <li>Using sterile technique for all injections</li>
                        <li>Proper storage and handling of peptides</li>
                    </ul>
                </div>

                <div className={styles.section}>
                    <h3>🚨 Emergency Situations</h3>
                    <p className={styles.emergency}>
                        <strong>If you experience a medical emergency, call 911 or your local emergency services immediately.</strong>
                    </p>
                    <p>
                        Do not rely on this app for emergency medical situations. Seek immediate professional help for:
                    </p>
                    <ul>
                        <li>Severe allergic reactions</li>
                        <li>Difficulty breathing</li>
                        <li>Chest pain or heart palpitations</li>
                        <li>Severe side effects</li>
                        <li>Any life-threatening symptoms</li>
                    </ul>
                </div>

                <div className={styles.section}>
                    <h3>📋 Legal and Regulatory Compliance</h3>
                    <ul>
                        <li>Ensure peptide use complies with local laws and regulations</li>
                        <li>Obtain peptides only from legitimate, licensed sources</li>
                        <li>Never share prescription peptides with others</li>
                        <li>Follow all applicable regulations in your jurisdiction</li>
                    </ul>
                </div>

                <div className={styles.acknowledgment}>
                    <p>
                        <strong>BY USING THIS SERVICE, YOU ACKNOWLEDGE THAT:</strong>
                    </p>
                    <ul>
                        <li>You have read and understood this medical disclaimer</li>
                        <li>You will consult with qualified healthcare providers</li>
                        <li>You accept full responsibility for your health decisions</li>
                        <li>You will not rely solely on this app for medical guidance</li>
                        <li>You understand the risks associated with peptide use</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MedicalDisclaimer;
