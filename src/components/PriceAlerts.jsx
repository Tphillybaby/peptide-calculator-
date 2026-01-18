import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Plus, AlertCircle, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react';
import { priceAlertService } from '../services/priceAlertService';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from './UpgradeModal';
import styles from './PriceAlerts.module.css';

const PriceAlerts = ({ peptideName = '' }) => {
    const { user, isPremium } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [newAlert, setNewAlert] = useState({
        peptide: peptideName,
        price: ''
    });

    useEffect(() => {
        if (user) {
            loadAlerts();
        } else {
            setLoading(false);
        }
    }, [user]);

    // Pre-fill peptide if provided prop changes
    useEffect(() => {
        if (peptideName) {
            setNewAlert(prev => ({ ...prev, peptide: peptideName }));
        }
    }, [peptideName]);

    const loadAlerts = async () => {
        setLoading(true);
        const data = await priceAlertService.getAlerts(user.id);
        setAlerts(data);
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!user || !newAlert.peptide || !newAlert.price) return;

        const result = await priceAlertService.createAlert(
            user.id,
            newAlert.peptide,
            parseFloat(newAlert.price)
        );

        if (result.success) {
            setNewAlert({ peptide: '', price: '' });
            setShowForm(false);
            loadAlerts();
        } else {
            alert('Failed to create alert: ' + result.error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this alert?')) {
            await priceAlertService.deleteAlert(id);
            setAlerts(alerts.filter(a => a.id !== id));
        }
    };

    const handleToggle = async (id, currentStatus) => {
        // Optimistic update
        const updated = alerts.map(a =>
            a.id === id ? { ...a, is_active: !currentStatus } : a
        );
        setAlerts(updated);

        await priceAlertService.toggleAlert(id, !currentStatus);
    };

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.guestState}>
                    <Bell size={32} className={styles.icon} />
                    <h3>Track Prices</h3>
                    <p>Log in to get notified when prices drop.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>
                    <Bell size={20} />
                    Price Alerts
                </h3>
                <button
                    className={styles.addBtn}
                    onClick={() => setShowForm(!showForm)}
                >
                    <Plus size={16} />
                    New Alert
                </button>
            </div>

            {showForm && (
                <form className={styles.form} onSubmit={handleCreate}>
                    <div className={styles.inputGroup}>
                        <label>Peptide</label>
                        <input
                            type="text"
                            placeholder="e.g. BPC-157"
                            value={newAlert.peptide}
                            onChange={e => setNewAlert({ ...newAlert, peptide: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Target Price ($)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            value={newAlert.price}
                            onChange={e => setNewAlert({ ...newAlert, price: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.createBtn}>Set Alert</button>
                </form>
            )}

            <div className={styles.list}>
                {loading ? (
                    <p>Loading alerts...</p>
                ) : alerts.length === 0 ? (
                    <p className={styles.empty}>No active alerts.</p>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.id} className={`${styles.alertItem} ${!alert.is_active ? styles.inactive : ''}`}>
                            <div className={styles.alertInfo}>
                                <span className={styles.alertPeptide}>{alert.peptide_name}</span>
                                <span className={styles.alertPrice}>
                                    Below <DollarSign size={12} />{alert.target_price}
                                </span>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    className={styles.toggleBtn}
                                    onClick={() => handleToggle(alert.id, alert.is_active)}
                                >
                                    {alert.is_active ? <ToggleRight size={24} color="#10b981" /> : <ToggleLeft size={24} color="#6b7280" />}
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(alert.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                feature="price_alerts"
            />
        </div>
    );
};

export default PriceAlerts;
