import React, { useEffect, useState } from 'react';
import {
    Users, Syringe, Database, Activity, TrendingUp, Clock,
    MessageCircle, Calendar, RefreshCw, ArrowUpRight, ArrowDownRight,
    CheckCircle, AlertCircle, Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { auditService } from '../../services/auditService';
import { supportService } from '../../services/supportService';
import { Link } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        injections: 0,
        peptides: 0,
        reviews: 0,
        schedules: 0,
        openTickets: 0
    });
    const [dataError, setDataError] = useState('');
    const [recentActivity, setRecentActivity] = useState([]);
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [injectionTrend, setInjectionTrend] = useState({ count: 0, direction: 'up' });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true); setDataError('');
        await Promise.all([
            fetchStats(),
            fetchRecentActivity(),
            fetchRecentTickets()
        ]);
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const { data, error } = await supabase.rpc('get_admin_overview', { p_days: 7 });
            if (error) throw error;
            setStats(data);
            const diff = data.periodInjections - data.previousInjections;
            setInjectionTrend({ count: data.periodInjections, direction: diff >= 0 ? 'up' : 'down', percentage: data.previousInjections ? Math.abs(Math.round(diff / data.previousInjections * 100)) : 0 });
        } catch (error) {
            setStats({}); setDataError('Dashboard counts could not be loaded. Refresh to try again.');
        }
    };

    const fetchRecentActivity = async () => {
        try {
            const { data } = await auditService.getAllLogs({ limit: 10 });
            setRecentActivity(data || []);
        } catch (error) {
            setDataError(prev => `${prev} Recent activity could not be loaded.`.trim());
        }
    };

    const fetchRecentTickets = async () => {
        try {
            const data = await supportService.getAllTickets();
            setRecentTickets((data || []).slice(0, 5));
        } catch (error) {
            setDataError(prev => `${prev} Recent tickets could not be loaded.`.trim());
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getStatusColor = (status) => {
        const colors = {
            open: '#3b82f6',
            in_progress: '#f59e0b',
            resolved: '#10b981',
            closed: '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Welcome back, here's what's happening today</p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchAllData} disabled={loading}>
                    <RefreshCw size={18} className={loading ? styles.spin : ''} />
                    Refresh
                </button>
            </div>

            {dataError && <p role="alert">{dataError}</p>}
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#3b82f620', color: '#3b82f6' }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Users</span>
                        <span className={styles.statValue}>{loading ? '...' : (stats.users ?? 'Unavailable')}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#10b98120', color: '#10b981' }}>
                        <Syringe size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Injections</span>
                        <span className={styles.statValue}>{loading ? '...' : (stats.injections ?? 'Unavailable')}</span>
                        {!loading && injectionTrend.percentage > 0 && (
                            <span className={`${styles.trend} ${injectionTrend.direction === 'up' ? styles.trendUp : styles.trendDown}`}>
                                {injectionTrend.direction === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {injectionTrend.percentage}% this week
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                        <Database size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Peptides in DB</span>
                        <span className={styles.statValue}>{loading ? '...' : (stats.peptides ?? 'Unavailable')}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                        <MessageCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Open Tickets</span>
                        <span className={styles.statValue}>{loading ? '...' : (stats.openTickets ?? 'Unavailable')}</span>
                        {!loading && stats.openTickets > 0 && (
                            <span className={styles.trendWarning}>
                                <AlertCircle size={14} /> Needs attention
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#06b6d420', color: '#06b6d4' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Reviews</span>
                        <span className={styles.statValue}>{loading ? '...' : (stats.reviews ?? 'Unavailable')}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#ec489920', color: '#ec4899' }}>
                        <Calendar size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Scheduled Doses</span>
                        <span className={styles.statValue}>{loading ? '...' : (stats.schedules ?? 'Unavailable')}</span>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className={styles.twoColumn}>
                {/* Recent Activity */}
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3><Activity size={20} /> Recent Activity</h3>
                        <Link to="/admin/audit-logs" className={styles.viewAll}>
                            View All <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <div className={styles.activityList}>
                        {loading ? (
                            <p className={styles.emptyState}>Loading...</p>
                        ) : recentActivity.length === 0 ? (
                            <p className={styles.emptyState}>No recent activity</p>
                        ) : (
                            recentActivity.map(log => (
                                <div key={log.id} className={styles.activityItem}>
                                    <div
                                        className={styles.activityDot}
                                        style={{ background: auditService.getActionStyle(log.action).color }}
                                    />
                                    <div className={styles.activityInfo}>
                                        <span className={styles.activityAction}>
                                            {auditService.formatAction(log.action)}
                                        </span>
                                        <span className={styles.activityMeta}>
                                            {log.profiles?.email?.split('@')[0] || 'User'} • {formatTimeAgo(log.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Support Tickets */}
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3><MessageCircle size={20} /> Recent Tickets</h3>
                        <Link to="/admin/tickets" className={styles.viewAll}>
                            View All <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <div className={styles.ticketList}>
                        {loading ? (
                            <p className={styles.emptyState}>Loading...</p>
                        ) : recentTickets.length === 0 ? (
                            <p className={styles.emptyState}>No tickets yet</p>
                        ) : (
                            recentTickets.map(ticket => (
                                <Link
                                    key={ticket.id}
                                    to="/admin/tickets"
                                    className={styles.ticketItem}
                                >
                                    <div className={styles.ticketInfo}>
                                        <span className={styles.ticketSubject}>{ticket.subject}</span>
                                        <span className={styles.ticketMeta}>
                                            {ticket.profiles?.email?.split('@')[0] || 'User'} • {formatTimeAgo(ticket.created_at)}
                                        </span>
                                    </div>
                                    <span
                                        className={styles.ticketStatus}
                                        style={{ color: getStatusColor(ticket.status) }}
                                    >
                                        {ticket.status === 'open' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <h3>Quick Actions</h3>
                <div className={styles.actionButtons}>
                    <Link to="/admin/peptides" className={styles.actionBtn}>
                        <Database size={20} />
                        Manage Peptides
                    </Link>
                    <Link to="/admin/tickets" className={styles.actionBtn}>
                        <MessageCircle size={20} />
                        View Tickets
                    </Link>
                    <Link to="/admin/audit-logs" className={styles.actionBtn}>
                        <Activity size={20} />
                        Audit Logs
                    </Link>
                    <Link to="/encyclopedia" className={styles.actionBtn}>
                        <Eye size={20} />
                        View Encyclopedia
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
