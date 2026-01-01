import React, { useState, useEffect } from 'react';
import {
    Users, Search, Shield, ShieldOff, Mail, Calendar,
    Activity, Syringe, Star, ChevronDown, ChevronUp,
    RefreshCw, Filter, UserX, CheckCircle, XCircle,
    Clock, BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminUsers.module.css';

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all'); // all, admin, user
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [userStats, setUserStats] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        newThisWeek: 0,
        activeToday: 0
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch profiles with user data
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profileError) throw profileError;

            setUsers(profiles || []);

            // Calculate stats
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const todayStart = new Date(now.setHours(0, 0, 0, 0));

            setStats({
                total: profiles?.length || 0,
                admins: profiles?.filter(p => p.is_admin).length || 0,
                newThisWeek: profiles?.filter(p => new Date(p.created_at) >= weekAgo).length || 0,
                activeToday: profiles?.filter(p => p.last_sign_in && new Date(p.last_sign_in) >= todayStart).length || 0
            });

        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async (userId) => {
        if (userStats[userId]) return; // Already loaded

        try {
            const [injections, schedules, reviews] = await Promise.all([
                supabase.from('injections').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('schedules').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId)
            ]);

            setUserStats(prev => ({
                ...prev,
                [userId]: {
                    injections: injections.count || 0,
                    schedules: schedules.count || 0,
                    reviews: reviews.count || 0
                }
            }));
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
    };

    const toggleAdmin = async (userId, currentStatus, userEmail) => {
        // Prevent self-demotion
        if (userId === currentUser?.id) {
            setError("You cannot change your own admin status.");
            setTimeout(() => setError(''), 3000);
            return;
        }

        const newStatus = !currentStatus;
        const action = newStatus ? 'promote' : 'demote';

        if (!window.confirm(`Are you sure you want to ${action} ${userEmail} ${newStatus ? 'to' : 'from'} admin?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_admin: newStatus })
                .eq('id', userId);

            if (error) throw error;

            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, is_admin: newStatus } : u
            ));

            showSuccess(`${userEmail} has been ${newStatus ? 'promoted to' : 'removed from'} admin.`);

            // Update stats
            setStats(prev => ({
                ...prev,
                admins: newStatus ? prev.admins + 1 : prev.admins - 1
            }));

        } catch (err) {
            console.error('Error updating admin status:', err);
            setError('Failed to update admin status. ' + (err.message || ''));
            setTimeout(() => setError(''), 5000);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleExpand = (userId) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
        } else {
            setExpandedUserId(userId);
            fetchUserStats(userId);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Never';
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return formatDate(dateString);
    };

    const getInitials = (email, fullName) => {
        if (fullName) {
            return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return email ? email.substring(0, 2).toUpperCase() : '??';
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesRole =
            filterRole === 'all' ||
            (filterRole === 'admin' && user.is_admin) ||
            (filterRole === 'user' && !user.is_admin);

        return matchesSearch && matchesRole;
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1><Users size={28} /> User Management</h1>
                    <p>Manage user accounts and permissions</p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchUsers} disabled={loading}>
                    <RefreshCw size={18} className={loading ? styles.spin : ''} />
                    Refresh
                </button>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className={styles.successBanner}>
                    <CheckCircle size={18} />
                    {successMessage}
                </div>
            )}
            {error && (
                <div className={styles.errorBanner}>
                    <XCircle size={18} />
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#3b82f620', color: '#3b82f6' }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Users</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                        <Shield size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.admins}</span>
                        <span className={styles.statLabel}>Administrators</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#10b98120', color: '#10b981' }}>
                        <Calendar size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.newThisWeek}</span>
                        <span className={styles.statLabel}>New This Week</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                        <Activity size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.activeToday}</span>
                        <span className={styles.statLabel}>Active Today</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="all">All Users</option>
                    <option value="admin">Admins Only</option>
                    <option value="user">Regular Users</option>
                </select>
            </div>

            {/* Users List */}
            {loading ? (
                <div className={styles.loading}>
                    <RefreshCw size={24} className={styles.spin} />
                    Loading users...
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className={styles.emptyState}>
                    <UserX size={48} />
                    <h3>No users found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className={styles.userList}>
                    {filteredUsers.map(user => (
                        <div key={user.id} className={styles.userCard}>
                            <div
                                className={styles.userHeader}
                                onClick={() => handleExpand(user.id)}
                            >
                                <div className={styles.userAvatar}>
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.email} />
                                    ) : (
                                        <span>{getInitials(user.email, user.full_name)}</span>
                                    )}
                                    {user.is_admin && (
                                        <div className={styles.adminBadge} title="Administrator">
                                            <Shield size={10} />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.userInfo}>
                                    <div className={styles.userName}>
                                        {user.full_name || 'No name set'}
                                        {user.id === currentUser?.id && (
                                            <span className={styles.youBadge}>You</span>
                                        )}
                                    </div>
                                    <div className={styles.userEmail}>
                                        <Mail size={14} />
                                        {user.email || 'No email'}
                                    </div>
                                </div>

                                <div className={styles.userMeta}>
                                    <div className={styles.metaItem}>
                                        <Calendar size={14} />
                                        Joined {formatTimeAgo(user.created_at)}
                                    </div>
                                    {user.last_sign_in && (
                                        <div className={styles.metaItem}>
                                            <Clock size={14} />
                                            Last active {formatTimeAgo(user.last_sign_in)}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.userActions}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleAdmin(user.id, user.is_admin, user.email);
                                        }}
                                        className={user.is_admin ? styles.demoteBtn : styles.promoteBtn}
                                        disabled={user.id === currentUser?.id}
                                        title={user.id === currentUser?.id ? "Cannot change own status" : (user.is_admin ? "Remove admin" : "Make admin")}
                                    >
                                        {user.is_admin ? <ShieldOff size={16} /> : <Shield size={16} />}
                                        {user.is_admin ? 'Demote' : 'Promote'}
                                    </button>
                                    {expandedUserId === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedUserId === user.id && (
                                <div className={styles.userDetails}>
                                    <div className={styles.detailsGrid}>
                                        <div className={styles.detailCard}>
                                            <Syringe size={20} />
                                            <div>
                                                <span className={styles.detailValue}>
                                                    {userStats[user.id]?.injections ?? '...'}
                                                </span>
                                                <span className={styles.detailLabel}>Injections</span>
                                            </div>
                                        </div>
                                        <div className={styles.detailCard}>
                                            <Calendar size={20} />
                                            <div>
                                                <span className={styles.detailValue}>
                                                    {userStats[user.id]?.schedules ?? '...'}
                                                </span>
                                                <span className={styles.detailLabel}>Schedules</span>
                                            </div>
                                        </div>
                                        <div className={styles.detailCard}>
                                            <Star size={20} />
                                            <div>
                                                <span className={styles.detailValue}>
                                                    {userStats[user.id]?.reviews ?? '...'}
                                                </span>
                                                <span className={styles.detailLabel}>Reviews</span>
                                            </div>
                                        </div>
                                        <div className={styles.detailCard}>
                                            <BarChart3 size={20} />
                                            <div>
                                                <span className={styles.detailValue}>
                                                    {user.is_admin ? 'Admin' : 'User'}
                                                </span>
                                                <span className={styles.detailLabel}>Role</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.detailsInfo}>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>User ID:</span>
                                            <code className={styles.infoValue}>{user.id}</code>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Registered:</span>
                                            <span className={styles.infoValue}>{formatDate(user.created_at)}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Last Sign In:</span>
                                            <span className={styles.infoValue}>{formatDate(user.last_sign_in)}</span>
                                        </div>
                                        {user.weight_lbs && (
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoLabel}>Weight:</span>
                                                <span className={styles.infoValue}>{user.weight_lbs} lbs</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Results count */}
            {!loading && filteredUsers.length > 0 && (
                <div className={styles.resultsCount}>
                    Showing {filteredUsers.length} of {users.length} users
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
