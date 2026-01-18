import React, { useState } from 'react';
import {
    Download, FileJson, FileText, Upload, Trash2,
    Shield, CheckCircle, AlertTriangle, Loader
} from 'lucide-react';
import { backupService } from '../services/backupService';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import UpgradeModal from './UpgradeModal';
import styles from './DataManagement.module.css';

const DataManagement = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const handleExportJSON = async () => {
        if (!user) return;

        const canExport = await paymentService.canAccessFeature(user.id, 'data_export');
        if (!canExport) {
            setShowUpgradeModal(true);
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const result = await backupService.exportUserData(user.id);
            if (result.success) {
                backupService.downloadJSON(result.data, result.filename);
                setMessage({ type: 'success', text: 'Data exported successfully!' });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Export failed: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        if (!user) return;

        const canExport = await paymentService.canAccessFeature(user.id, 'data_export');
        if (!canExport) {
            setShowUpgradeModal(true);
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const result = await backupService.exportAsCSV(user.id);
            if (result.success) {
                // Download each CSV file
                Object.entries(result.files).forEach(([name, content]) => {
                    if (content) {
                        backupService.downloadCSV(content, `peptide-tracker-${name}.csv`);
                    }
                });
                setMessage({ type: 'success', text: 'CSV files exported successfully!' });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Export failed: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setLoading(true);
        setMessage(null);

        try {
            const text = await file.text();
            const result = await backupService.importUserData(user.id, text);

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Import failed: ' + error.message });
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    };

    const handleDeleteAllData = async () => {
        if (!user || deleteInput !== 'DELETE') return;

        setLoading(true);
        setMessage(null);

        try {
            const result = await backupService.deleteAllUserData(user.id);
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setShowDeleteConfirm(false);
                setDeleteInput('');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Delete failed: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const backupInfo = backupService.getBackupInfo();

    return (
        <div className={styles.container}>
            {/* Backup Info */}
            <div className={styles.infoCard}>
                <div className={styles.infoHeader}>
                    <Shield size={24} />
                    <div>
                        <h3>Your Data is Secure</h3>
                        <p>Backed by {backupInfo.provider}'s enterprise-grade infrastructure</p>
                    </div>
                </div>
                <ul className={styles.featureList}>
                    {backupInfo.features.map((feature, i) => (
                        <li key={i}>
                            <CheckCircle size={16} />
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    {message.text}
                </div>
            )}

            {/* Export Section */}
            <div className={styles.section}>
                <h3><Download size={20} /> Export Your Data</h3>
                <p>Download a complete copy of all your data.</p>

                <div className={styles.exportButtons}>
                    <button
                        onClick={handleExportJSON}
                        disabled={loading}
                        className={styles.exportBtn}
                    >
                        {loading ? <Loader size={18} className={styles.spin} /> : <FileJson size={18} />}
                        Export as JSON
                    </button>

                    <button
                        onClick={handleExportCSV}
                        disabled={loading}
                        className={styles.exportBtn}
                    >
                        {loading ? <Loader size={18} className={styles.spin} /> : <FileText size={18} />}
                        Export as CSV
                    </button>

                    <button
                        onClick={async () => {
                            if (!user) return;
                            const canExport = await paymentService.canAccessFeature(user.id, 'data_export');
                            if (!canExport) {
                                setShowUpgradeModal(true);
                                return;
                            }
                            setLoading(true);
                            try {
                                // 1. Fetch injections first (since exportService relies on data being passed)
                                // We can use backupService to fetch data, or just fetch injections via Supabase directly.
                                // But since backupService.exportAsCSV already fetches data, let's reuse that fetch logic if possible
                                // OR simplified: just call fetchInjections from a hook? No, hooks rules.

                                // Let's use the backupService.exportUserData to get the raw JSON, then pass injections to exportService
                                const result = await backupService.exportUserData(user.id);
                                if (result.success && result.data.injections) {
                                    const { exportService } = await import('../services/exportService');
                                    exportService.toPDF(result.data.injections, {
                                        title: `Peptide Log Report - ${user.user_metadata?.full_name || 'User'}`
                                    });
                                    setMessage({ type: 'success', text: 'PDF Report downloaded!' });
                                } else {
                                    throw new Error('No data available for PDF');
                                }
                            } catch (error) {
                                setMessage({ type: 'error', text: 'PDF Export failed: ' + error.message });
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className={styles.exportBtn}
                    >
                        {loading ? <Loader size={18} className={styles.spin} /> : <FileText size={18} />}
                        Doctor's Report (PDF)
                    </button>
                </div>
            </div>

            {/* Import Section */}
            <div className={styles.section}>
                <h3><Upload size={20} /> Import Data</h3>
                <p>Restore from a previous JSON backup file.</p>

                <label className={styles.importLabel}>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        disabled={loading}
                    />
                    <Upload size={18} />
                    Choose JSON File
                </label>
            </div>

            {/* Danger Zone */}
            <div className={styles.dangerZone}>
                <h3><Trash2 size={20} /> Danger Zone</h3>
                <p>Permanently delete all your tracking data. This cannot be undone.</p>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className={styles.deleteBtn}
                    >
                        Delete All My Data
                    </button>
                ) : (
                    <div className={styles.deleteConfirm}>
                        <p>Type <strong>DELETE</strong> to confirm:</p>
                        <input
                            type="text"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            placeholder="Type DELETE"
                        />
                        <div className={styles.confirmButtons}>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteInput('');
                                }}
                                className={styles.cancelBtn}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAllData}
                                disabled={deleteInput !== 'DELETE' || loading}
                                className={styles.confirmDeleteBtn}
                            >
                                {loading ? <Loader size={18} className={styles.spin} /> : 'Permanently Delete'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </div>
    );
};

export default DataManagement;
