import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Database, Settings, LogOut, MessageCircle, Activity, Shield, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <div style={{
                width: '250px',
                background: 'rgba(15, 23, 42, 0.8)',
                borderRight: '1px solid var(--glass-border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ marginBottom: '2rem', paddingLeft: '0.75rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Admin Panel</h2>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <NavLink
                        to="/admin"
                        end
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-primary)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        })}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/peptides"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-primary)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        })}
                    >
                        <Database size={20} />
                        Peptides
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-primary)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        })}
                    >
                        <Users size={20} />
                        Users
                    </NavLink>
                    <NavLink
                        to="/admin/forum"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-primary)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        })}
                    >
                        <MessageSquare size={20} />
                        Forum
                    </NavLink>
                    <NavLink
                        to="/admin/reviews"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-primary)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        })}
                    >
                        <Star size={20} />
                        Reviews
                    </NavLink>
                    <NavLink
                        to="/admin/tickets"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-primary)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        })}
                    >
                        <MessageCircle size={20} />
                        Support Tickets
                    </NavLink>
                    <NavLink
                        to="/admin/audit-logs"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-primary)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        })}
                    >
                        <Activity size={20} />
                        Audit Logs
                    </NavLink>
                    <NavLink
                        to="/admin/monitoring"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-primary)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        })}
                    >
                        <Activity size={20} />
                        Monitoring
                    </NavLink>
                    <NavLink
                        to="/admin/security"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-primary)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        })}
                    >
                        <Shield size={20} />
                        Security Audit
                    </NavLink>
                </nav>

                <button
                    onClick={handleSignOut}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: 'auto'
                    }}
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
