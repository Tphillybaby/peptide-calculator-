import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, Syringe, Calendar, ArrowRight, TrendingDown,
    Package, BookOpen, Users, Bell, ChevronRight,
    Droplet, Clock, Target, Sparkles, BarChart3,
    AlertCircle, CheckCircle2, Plus, History, Beaker
} from 'lucide-react';
import { useInjections } from '../hooks/useInjections';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';
import ProgressAnalytics from '../components/ProgressAnalytics';
import OnboardingWizard from '../components/OnboardingWizard';
import StackShareCard from '../components/StackShareCard';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { getStats, injections } = useInjections();
    const { user } = useAuth();
    const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

    const stats = useMemo(() => getStats(), [getStats]);

    // Get user's first name for greeting
    const userName = useMemo(() => {
        if (!user) return 'Guest';
        const fullName = user.user_metadata?.full_name || user.email || 'User';
        return fullName.split(' ')[0].split('@')[0];
    }, [user]);

    // Calculate additional stats
    const additionalStats = useMemo(() => {
        if (!injections || injections.length === 0) {
            return {
                totalInjections: 0,
                thisWeek: 0,
                uniquePeptides: 0,
                streak: 0
            };
        }

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const thisWeek = injections.filter(inj =>
            new Date(inj.date) >= weekAgo
        ).length;

        const uniquePeptides = new Set(injections.map(inj => inj.peptide)).size;

        // Calculate streak (consecutive days with injections)
        let streak = 0;
        const sortedDates = [...new Set(
            injections
                .map(inj => new Date(inj.date).toDateString())
        )].sort((a, b) => new Date(b) - new Date(a));

        for (let i = 0; i < sortedDates.length; i++) {
            const checkDate = new Date(now);
            checkDate.setDate(checkDate.getDate() - i);
            if (sortedDates.includes(checkDate.toDateString())) {
                streak++;
            } else {
                break;
            }
        }

        return {
            totalInjections: injections.length,
            thisWeek,
            uniquePeptides,
            streak
        };
    }, [injections]);

    // Get recent activity
    const recentActivity = useMemo(() => {
        if (!injections || injections.length === 0) return [];
        return injections.slice(0, 4).map(inj => ({
            ...inj,
            timeAgo: getTimeAgo(new Date(inj.date))
        }));
    }, [injections]);

    function getTimeAgo(date) {
        if (!date || isNaN(date.getTime())) return '';
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    // Get greeting based on time of day
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const [activeFolder, setActiveFolder] = useState(null);

    // Consolidated Quick Actions with Folders
    const rootActions = [
        {
            id: 'log',
            to: '/log',
            icon: Syringe,
            title: 'Log Injection',
            desc: 'Record a new dose',
            color: '#10b981',
            primary: true
        },
        {
            id: 'inventory',
            to: '/inventory',
            icon: Package,
            title: 'Inventory',
            desc: 'Manage your stock',
            color: '#14b8a6'
        },
        {
            id: 'tools',
            icon: Beaker,
            title: 'Tools & Education',
            desc: 'Calculator, Sites, Encyclopedia',
            color: '#3b82f6',
            isFolder: true,
            items: [
                {
                    to: '/calculator',
                    icon: Activity,
                    title: 'Peptide Calculator',
                    desc: 'Reconstitute peptides',
                    color: '#3b82f6'
                },
                {
                    to: '/encyclopedia',
                    icon: BookOpen,
                    title: 'Encyclopedia',
                    desc: 'Learn about peptides',
                    color: '#f59e0b'
                },
                {
                    to: '/injection-sites',
                    icon: Target,
                    title: 'Injection Sites',
                    desc: 'Where to inject',
                    color: '#8b5cf6'
                }
            ]
        },
        {
            id: 'market',
            icon: Users,
            title: 'Sourcing & Community',
            desc: 'Prices, Reviews',
            color: '#ec4899',
            isFolder: true,
            items: [
                {
                    to: '/price-checker',
                    icon: TrendingDown,
                    title: 'Price Checker',
                    desc: 'Compare prices',
                    color: '#06b6d4'
                },
                {
                    to: '/reviews',
                    icon: Users,
                    title: 'Vendor Reviews',
                    desc: 'Community ratings',
                    color: '#ec4899'
                }
            ]
        },
        {
            id: 'titration',
            to: '/titration',
            icon: Sparkles,
            title: 'Titration Planner',
            desc: 'Dose escalation',
            color: '#f97316',
            premium: true
        },
        {
            id: 'blood-work',
            to: '/blood-work',
            icon: BarChart3,
            title: 'Blood Work',
            desc: 'Track lab results',
            color: '#6366f1',
            premium: true
        }
    ];

    const currentActions = activeFolder ? activeFolder.items : rootActions;
    const currentTitle = activeFolder ? activeFolder.title : 'Quick Actions';

    return (
        <div className={styles.container}>
            {/* Onboarding Wizard for New Users */}
            {showOnboarding && (
                <OnboardingWizard
                    onComplete={completeOnboarding}
                    onSkip={skipOnboarding}
                />
            )}

            {/* Welcome Header */}
            <header className={styles.header}>
                <div className={styles.welcomeSection}>
                    <h1>{greeting}, <span className={styles.userName}>{userName}</span></h1>
                    <p className={styles.subtitle}>Here's your peptide journey at a glance</p>
                </div>
                {user && (
                    <Link to="/tracker" className={styles.primaryAction}>
                        <Plus size={20} />
                        <span className={styles.actionText}>Log Injection</span>
                    </Link>
                )}
            </header>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.statPrimary}`}>
                    <div className={styles.statIcon}>
                        <Droplet size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {stats ? stats.activeLevel : '0.00'}
                            <span className={styles.statUnit}>mg</span>
                        </span>
                        <span className={styles.statLabel}>Est. Active Level</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {stats?.lastInjection && !isNaN(new Date(stats.lastInjection.date).getTime()) ?
                                new Date(stats.lastInjection.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                : '--'}
                        </span>
                        <span className={styles.statLabel}>
                            {stats?.lastInjection?.peptide || 'Last Injection'}
                        </span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{additionalStats.thisWeek}</span>
                        <span className={styles.statLabel}>This Week</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                        <Target size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {additionalStats.streak}
                            <span className={styles.statUnit}>days</span>
                        </span>
                        <span className={styles.statLabel}>Current Streak</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={styles.mainGrid}>
                {/* Quick Actions */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>
                            {activeFolder ? (
                                <button
                                    onClick={() => setActiveFolder(null)}
                                    className={styles.backBtn}
                                >
                                    <ChevronRight size={20} className={styles.backArrow} />
                                    Back
                                </button>
                            ) : (
                                <>
                                    <Sparkles size={20} /> {currentTitle}
                                </>
                            )}
                        </h2>
                    </div>
                    <div className={styles.actionsGrid}>
                        {currentActions.map((action, index) => {
                            const CardContent = (
                                <>
                                    {action.premium && <span className={styles.premiumBadge}>PRO</span>}
                                    <div
                                        className={styles.actionIcon}
                                        style={{ background: `${action.color}15`, color: action.color }}
                                    >
                                        <action.icon size={24} />
                                    </div>
                                    <div className={styles.actionContent}>
                                        <span className={styles.actionTitle}>{action.title}</span>
                                        <span className={styles.actionDesc}>{action.desc}</span>
                                    </div>
                                    <ArrowRight size={18} className={styles.actionArrow} />
                                </>
                            );

                            if (action.isFolder) {
                                return (
                                    <button
                                        key={action.id}
                                        className={`${styles.actionCard} ${styles.folderCard}`}
                                        style={{ '--action-color': action.color }}
                                        onClick={() => setActiveFolder(action)}
                                    >
                                        {CardContent}
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={action.to}
                                    to={action.to}
                                    className={`${styles.actionCard} ${action.primary ? styles.actionPrimary : ''}`}
                                    style={{ '--action-color': action.color }}
                                >
                                    {CardContent}
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Recent Activity */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2><History size={20} /> Recent Activity</h2>
                        {recentActivity.length > 0 && (
                            <Link to="/log" className={styles.viewAllBtn}>
                                View All <ChevronRight size={16} />
                            </Link>
                        )}
                    </div>
                    {recentActivity.length > 0 ? (
                        <div className={styles.activityList}>
                            {recentActivity.map((activity, index) => (
                                <div key={activity.id || index} className={styles.activityItem}>
                                    <div className={styles.activityIcon}>
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div className={styles.activityInfo}>
                                        <span className={styles.activityTitle}>{activity.peptide}</span>
                                        <span className={styles.activityMeta}>
                                            {activity.dosage}{activity.unit} • {activity.timeAgo}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Syringe size={32} className={styles.emptyIcon} />
                            <p>No injections logged yet</p>
                            <Link to="/log" className={styles.emptyAction}>
                                Log your first injection
                            </Link>
                        </div>
                    )}
                </section>
            </div>

            {/* Progress Analytics Section */}
            {user && (
                <section className={styles.analyticsSection}>
                    <ProgressAnalytics />
                </section>
            )}

            {/* Viral Growth: Stack Share Card */}
            {user && (
                <section className={styles.section}>
                    <StackShareCard />
                </section>
            )}

            {/* Quick Stats Footer - Mobile Only */}
            <div className={styles.mobileStats}>
                <div className={styles.mobileStatItem}>
                    <span className={styles.mobileStatValue}>{additionalStats.totalInjections}</span>
                    <span className={styles.mobileStatLabel}>Total</span>
                </div>
                <div className={styles.mobileStatDivider} />
                <div className={styles.mobileStatItem}>
                    <span className={styles.mobileStatValue}>{additionalStats.uniquePeptides}</span>
                    <span className={styles.mobileStatLabel}>Peptides</span>
                </div>
                <div className={styles.mobileStatDivider} />
                <div className={styles.mobileStatItem}>
                    <span className={styles.mobileStatValue}>{additionalStats.thisWeek}</span>
                    <span className={styles.mobileStatLabel}>This Week</span>
                </div>
            </div>

            {/* Guest CTA */}
            {!user && (
                <div className={styles.guestCta}>
                    <div className={styles.ctaContent}>
                        <AlertCircle size={24} />
                        <div>
                            <h3>Track Your Progress</h3>
                            <p>Sign in to save your injections and access all features</p>
                        </div>
                    </div>
                    <Link to="/login" className={styles.ctaButton}>
                        Sign In
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
