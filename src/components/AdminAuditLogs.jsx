import React, { useState, useEffect } from 'react';
import { Activity, Filter, Calendar, User, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { auditService } from '../services/auditService';
import styles from './AdminAuditLogs.module.css';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [stats, setStats] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        startDate: '',
        endDate: ''
    });

    // Pagination
    const [page, setPage] = useState(0);
    const pageSize = 50;

    // Filter options
    const [actionTypes, setActionTypes] = useState([]);
    const [entityTypes, setEntityTypes] = useState([]);

    useEffect(() => {
        loadFilterOptions();
        loadStats();
    }, []);

    useEffect(() => {
        loadLogs();
    }, [page, filters]);

    const loadFilterOptions = async () => {
        try {
            const [actions, entities] = await Promise.all([
                auditService.getActionTypes(),
                auditService.getEntityTypes()
            ]);
            setActionTypes(actions);
            setEntityTypes(entities);
        } catch (err) {
            console.error('Failed to load filter options:', err);
        }
    };

    const loadStats = async () => {
        try {
            const data = await auditService.getStats(7);
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const loadLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, count } = await auditService.getAllLogs({
                limit: pageSize,
                offset: page * pageSize,
                action: filters.action || null,
                entityType: filters.entityType || null,
                startDate: filters.startDate || null,
                endDate: filters.endDate || null
            });
            setLogs(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            setError('Failed to load audit logs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(0);
    };

    const clearFilters = () => {
        setFilters({ action: '', entityType: '', startDate: '', endDate: '' });
        setPage(0);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>
                    <Activity size={28} />
                    Audit Logs
                </h1>
                <button className={styles.refreshBtn} onClick={() => { loadLogs(); loadStats(); }}>
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Events (7 days)</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{Object.keys(stats.byAction).length}</span>
                        <span className={styles.statLabel}>Action Types</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{Object.keys(stats.byDay).length}</span>
                        <span className={styles.statLabel}>Active Days</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>
                            {Math.round(stats.total / Math.max(Object.keys(stats.byDay).length, 1))}
                        </span>
                        <span className={styles.statLabel}>Avg/Day</span>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.filterIcon}>
                    <Filter size={18} />
                    Filters:
                </div>

                <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                    <option value="">All Actions</option>
                    {actionTypes.map(action => (
                        <option key={action} value={action}>
                            {auditService.formatAction(action)}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.entityType}
                    onChange={(e) => handleFilterChange('entityType', e.target.value)}
                >
                    <option value="">All Entities</option>
                    {entityTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <div className={styles.dateFilter}>
                    <Calendar size={16} />
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        placeholder="Start date"
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        placeholder="End date"
                    />
                </div>

                {(filters.action || filters.entityType || filters.startDate || filters.endDate) && (
                    <button className={styles.clearBtn} onClick={clearFilters}>
                        Clear
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {/* Logs Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Entity</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className={styles.loading}>Loading...</td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className={styles.empty}>No logs found</td>
                            </tr>
                        ) : (
                            logs.map(log => {
                                const actionStyle = auditService.getActionStyle(log.action);
                                return (
                                    <tr key={log.id}>
                                        <td className={styles.timestamp}>{formatDate(log.created_at)}</td>
                                        <td className={styles.user}>
                                            <User size={14} />
                                            {log.profiles?.email || log.user_id?.substring(0, 8) || 'System'}
                                        </td>
                                        <td>
                                            <span
                                                className={styles.actionBadge}
                                                style={{ background: `${actionStyle.color}20`, color: actionStyle.color }}
                                            >
                                                {auditService.formatAction(log.action)}
                                            </span>
                                        </td>
                                        <td className={styles.entity}>
                                            {log.entity_type}
                                            {log.entity_id && <span className={styles.entityId}>#{log.entity_id.substring(0, 8)}</span>}
                                        </td>
                                        <td className={styles.details}>
                                            {log.new_values && (
                                                <details>
                                                    <summary>View changes</summary>
                                                    <pre>{JSON.stringify(log.new_values, null, 2)}</pre>
                                                </details>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalCount > pageSize && (
                <div className={styles.pagination}>
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                    >
                        <ChevronLeft size={18} />
                        Previous
                    </button>
                    <span>
                        Page {page + 1} of {totalPages} ({totalCount} total)
                    </span>
                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogs;
