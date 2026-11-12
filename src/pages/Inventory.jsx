import { useInjections } from '../hooks/useInjections';
import { vialDoseEstimate, validateStock } from '../utils/dailyTools';
import { lowStockVials } from '../utils/dailyDashboard';
import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, AlertCircle, ShoppingBag, Droplet, Calendar, Search } from 'lucide-react';
import useInventory from '../hooks/useInventory';
import styles from './Inventory.module.css';

const Inventory = () => {
    const {
        inventory, loading, error,
        addInventory,
        updateInventory,
        deleteInventory,
        getLowStockItems,
        getExpiringItems,
        getTotalStock
    } = useInventory();

    const { injections } = useInjections();
    const [saveError, setSaveError] = useState('');
    const [saving, setSaving] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        peptide_name: '',
        quantity_mg: '',
        source: '',
        purchase_date: new Date().toISOString().split('T')[0],
        expiration_date: '',
        batch_number: ''
    });

    const lowStockItems = getLowStockItems();
    const expiringItems = getExpiringItems(60); // 60 days alert

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving) return;
        setSaving(true); setSaveError('');
        try {
            const itemData = { ...formData, quantity_mg: Number(formData.quantity_mg) };
            if (editingItem) itemData.remaining_mg = validateStock(formData.remaining_mg, formData.quantity_mg);
            else { validateStock(itemData.quantity_mg, itemData.quantity_mg); delete itemData.remaining_mg; }
            const result = editingItem ? await updateInventory(editingItem.id, itemData) : await addInventory(itemData);
            if (!result.success) throw result.error;
            closeModal();
        } catch (e) { setSaveError(e.message || 'Could not save inventory.'); }
        finally { setSaving(false); }
    };

    const openAddModal = () => {
        setEditingItem(null); setSaveError('');
        setFormData({
            peptide_name: '',
            quantity_mg: '',
            source: '',
            purchase_date: new Date().toISOString().split('T')[0],
            expiration_date: '',
            batch_number: ''
        });
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item); setSaveError('');
        setFormData({
            peptide_name: item.peptide_name,
            quantity_mg: item.quantity_mg,
            remaining_mg: item.remaining_mg,
            source: item.source || '',
            purchase_date: item.purchase_date ? item.purchase_date.split('T')[0] : '',
            expiration_date: item.expiration_date ? item.expiration_date.split('T')[0] : '',
            batch_number: item.batch_number || ''
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await deleteInventory(id);
        }
    };

    // Calculate percent remaining for progress bar
    const getPercentRemaining = (item) => {
        if (!item.quantity_mg || item.quantity_mg === 0) return 0;
        return Math.min(100, Math.max(0, (item.remaining_mg / item.quantity_mg) * 100));
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1><Package className={styles.icon} /> Inventory</h1>
                </div>
                <button className={styles.addButton} onClick={openAddModal}>
                    <Plus size={20} /> Add Item
                </button>
            </header>

            {loading && <p role="status">Loading inventory…</p>}
            {error && <p role="alert">Inventory could not be loaded. Reload to try again.</p>}
            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                        <Package />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{inventory.length}</span>
                        <span className={styles.statLabel}>Total Items</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        <Droplet />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{Math.round(getTotalStock())}mg</span>
                        <span className={styles.statLabel}>Total Stock</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                        <AlertCircle />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{lowStockItems.length}</span>
                        <span className={styles.statLabel}>Low Stock</span>
                    </div>
                </div>
            </div>

            {/* Inventory List */}
            {!loading && !error && (inventory.length > 0 ? (
                <div className={styles.inventoryList}>
                    {inventory.map(item => (
                        <div key={item.id} className={styles.inventoryItem}>
                            <div className={styles.itemInfo}>
                                <div className={styles.itemName}>
                                    {item.peptide_name}
                                    {lowStockVials([item]).length > 0 && (
                                        <span className={styles.lowStockBadge}>
                                            <AlertCircle size={12} /> Low Stock
                                        </span>
                                    )}
                                </div>
                                <div className={styles.itemDetails}>
                                    <span>{item.remaining_mg}mg remaining (of {item.quantity_mg}mg)</span>
                                    <span>{(() => { const estimate = vialDoseEstimate(item, injections); return estimate ? `About ${estimate.count} full doses at your last logged dose (${estimate.dose})` : 'Log a dose in mg or mcg to estimate doses left'; })()}</span>
                                    {item.source && <span>• {item.source}</span>}
                                    {item.batch_number && <span>• Batch: {item.batch_number}</span>}
                                </div>
                                <div className={styles.stockBarWrapper}>
                                    <div
                                        className={`${styles.stockBar} ${lowStockVials([item]).length > 0 ? styles.low : ''}`}
                                        style={{ width: `${getPercentRemaining(item)}%` }}
                                    />
                                </div>
                            </div>

                            <div className={styles.itemActions}>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => openEditModal(item)}
                                    title="Edit Item"
                                >
                                    <Edit2 size={16} /> <span>Correct stock / edit</span>
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                    onClick={() => handleDelete(item.id)}
                                    title="Delete Item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <ShoppingBag size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <h3>Your inventory is empty</h3>
                    <p>Track your peptide stock, sources, and expiration dates.</p>
                    <button
                        className={styles.addButton}
                        onClick={openAddModal}
                        style={{ marginTop: '1.5rem', marginInline: 'auto' }}
                    >
                        <Plus size={20} /> Add First Item
                    </button>
                </div>
            ))}

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className={styles.modal} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2>{editingItem ? 'Edit Item' : 'Add to Inventory'}</h2>
                        <form data-preserve-draft onSubmit={handleSubmit}>
                            {saveError && <p role="alert">{saveError}</p>}
                            {editingItem && <div className={styles.formGroup}><label htmlFor="remaining-stock">Remaining stock (mg)</label><input id="remaining-stock" type="number" min="0" max={formData.quantity_mg} step="any" required value={formData.remaining_mg ?? ''} onChange={e => setFormData({ ...formData, remaining_mg: e.target.value })} /><p>Enter the amount currently in this vial. This corrects stock; it does not change dose history. Later edits to logged doses still adjust their original vial allocations.</p></div>}

                            <div className={styles.formGroup}>
                                <label>Peptide Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.peptide_name}
                                    onChange={e => setFormData({ ...formData, peptide_name: e.target.value })}
                                    placeholder="e.g. BPC-157"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Quantity (mg)</label>
                                <input
                                    type="number"
                                    required
                                    min="0.001"
                                    step="any"
                                    value={formData.quantity_mg}
                                    onChange={e => setFormData({ ...formData, quantity_mg: e.target.value })}
                                    placeholder="e.g. 5"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Source / Vendor (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.source}
                                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                                    placeholder="e.g. Biotech Peptides"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Batch Number (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.batch_number}
                                    onChange={e => setFormData({ ...formData, batch_number: e.target.value })}
                                    placeholder="e.g. B492-A"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Purchase Date</label>
                                <input
                                    type="date"
                                    value={formData.purchase_date}
                                    onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Expiration Date (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.expiration_date}
                                    onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className={styles.submitBtn}>
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
