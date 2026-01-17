import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Database, LogOut, MessageCircle,
    Activity, Shield, MessageSquare, Star, DollarSign, Menu, X,
    BarChart2, Flag, Megaphone, Settings, Tag, Download, HardDrive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    // Close sidebar on route change (mobile)
    React.useEffect(() => {
        closeSidebar();
    }, [location.pathname]);

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
        { path: '/admin/peptides', icon: Database, label: 'Peptides' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/forum', icon: MessageSquare, label: 'Forum' },
        { path: '/admin/reviews', icon: Star, label: 'Reviews' },
        { path: '/admin/prices', icon: DollarSign, label: 'Prices' },
        { path: '/admin/promo-codes', icon: Tag, label: 'Promo Codes' },
        { path: '/admin/tickets', icon: MessageCircle, label: 'Support Tickets' },
        { path: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
        { path: '/admin/feature-flags', icon: Flag, label: 'Feature Flags' },
        { path: '/admin/audit-logs', icon: Activity, label: 'Audit Logs' },
        { path: '/admin/export', icon: Download, label: 'Export Data' },
        { path: '/admin/settings', icon: Settings, label: 'Site Settings' },
        { path: '/admin/monitoring', icon: Activity, label: 'Monitoring' },
        { path: '/admin/database', icon: HardDrive, label: 'Database Metrics' },
        { path: '/admin/security', icon: Shield, label: 'Security Audit' },
    ];

    return (
        <div className={styles.container}>
            {/* Mobile Header */}
            <div className={styles.mobileHeader}>
                <button onClick={toggleSidebar} className={styles.menuBtn}>
                    <Menu size={24} />
                </button>
                <div className={styles.headerTitle}>
                    <h2>Admin Panel</h2>
                </div>
                <div style={{ width: 24 }}></div> {/* Spacer for centering */}
            </div>

            {/* Overlay for mobile */}
            <div
                className={`${styles.overlay} ${isSidebarOpen ? styles.open : ''}`}
                onClick={closeSidebar}
            />

            {/* Sidebar */}
            <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                <div className={styles.headerTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Admin Panel</h2>
                    <button
                        onClick={closeSidebar}
                        className={`${styles.menuBtn} ${styles.closeBtn}`}
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
                            }
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <button onClick={handleSignOut} className={styles.signOutBtn}>
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
