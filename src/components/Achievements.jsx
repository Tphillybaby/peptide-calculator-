import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Trophy, Star, Lock, CheckCircle, ChevronRight,
    Flame, Target, Beaker, Users, BookOpen, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import achievementService, { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../services/achievementService';
import styles from './Achievements.module.css';

const Achievements = () => {
    const { user } = useAuth();
    const [userAchievements, setUserAchievements] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newUnlock, setNewUnlock] = useState(null);

    // Load user achievements
    useEffect(() => {
        const loadAchievements = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const achievements = await achievementService.getUserAchievements(user.id);
                setUserAchievements(achievements);

                const points = await achievementService.getTotalPoints(user.id);
                setTotalPoints(points);
            } catch (err) {
                console.error('Error loading achievements:', err);
            } finally {
                setLoading(false);
            }
        };

        loadAchievements();
    }, [user]);

    // Listen for new unlocks
    useEffect(() => {
        const unsubscribe = achievementService.onAchievementUnlocked((achievement) => {
            setNewUnlock(achievement);
            // Refresh achievements
            if (user) {
                achievementService.getUserAchievements(user.id).then(setUserAchievements);
                achievementService.getTotalPoints(user.id).then(setTotalPoints);
            }
            // Clear notification after 5 seconds
            setTimeout(() => setNewUnlock(null), 5000);
        });

        return unsubscribe;
    }, [user]);

    const isUnlocked = useCallback((achievementId) => {
        return userAchievements.some(ua => ua.achievement_id === achievementId);
    }, [userAchievements]);

    const getUnlockDate = useCallback((achievementId) => {
        const ua = userAchievements.find(a => a.achievement_id === achievementId);
        return ua ? new Date(ua.unlocked_at).toLocaleDateString() : null;
    }, [userAchievements]);

    const achievementsByCategory = achievementService.getAllAchievementsByCategory();
    const unlockedCount = userAchievements.length;
    const totalCount = Object.values(ACHIEVEMENTS).length;
    const progressPercent = Math.round((unlockedCount / totalCount) * 100);

    const getCategoryIcon = (category) => {
        const icons = {
            milestones: Target,
            streak: Flame,
            variety: Beaker,
            features: Star,
            community: Users,
            learning: BookOpen,
            special: Award
        };
        return icons[category] || Trophy;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <Trophy size={48} className={styles.loadingIcon} />
                    <p>Loading achievements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* New Unlock Toast */}
            {newUnlock && (
                <div className={styles.unlockToast}>
                    <div className={styles.unlockIcon}>{newUnlock.icon}</div>
                    <div className={styles.unlockContent}>
                        <span className={styles.unlockLabel}>Achievement Unlocked!</span>
                        <span className={styles.unlockTitle}>{newUnlock.title}</span>
                    </div>
                    <span className={styles.unlockPoints}>+{newUnlock.points} pts</span>
                </div>
            )}

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1><Trophy size={28} /> Achievements</h1>
                    <p>Track your progress and earn rewards</p>
                </div>
                {user && (
                    <div className={styles.statsCard}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{totalPoints}</span>
                            <span className={styles.statLabel}>Total Points</span>
                        </div>
                        <div className={styles.statDivider} />
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{unlockedCount}/{totalCount}</span>
                            <span className={styles.statLabel}>Unlocked</span>
                        </div>
                    </div>
                )}
            </header>

            {/* Progress Bar */}
            {user && (
                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <span>Overall Progress</span>
                        <span className={styles.progressPercent}>{progressPercent}%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Guest Message */}
            {!user && (
                <div className={styles.guestMessage}>
                    <Lock size={32} />
                    <h2>Sign in to track achievements</h2>
                    <p>Create an account to unlock achievements and earn points as you use Peptide Log.</p>
                    <Link to="/login" className={styles.signInBtn}>
                        Sign In <ChevronRight size={18} />
                    </Link>
                </div>
            )}

            {/* Category Filters */}
            <div className={styles.categories}>
                <button
                    className={`${styles.categoryBtn} ${!selectedCategory ? styles.active : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    All
                </button>
                {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, cat]) => {
                    const Icon = getCategoryIcon(key);
                    const categoryAchievements = achievementsByCategory[key] || [];
                    const unlocked = categoryAchievements.filter(a => isUnlocked(a.id)).length;

                    return (
                        <button
                            key={key}
                            className={`${styles.categoryBtn} ${selectedCategory === key ? styles.active : ''}`}
                            onClick={() => setSelectedCategory(key)}
                            style={{ '--cat-color': cat.color }}
                        >
                            <Icon size={16} />
                            <span>{cat.name}</span>
                            <span className={styles.categoryCount}>{unlocked}/{categoryAchievements.length}</span>
                        </button>
                    );
                })}
            </div>

            {/* Achievements Grid */}
            <div className={styles.achievementsGrid}>
                {Object.entries(achievementsByCategory)
                    .filter(([cat]) => !selectedCategory || cat === selectedCategory)
                    .map(([category, achievements]) => (
                        <div key={category} className={styles.categorySection}>
                            <h2 className={styles.categoryTitle} style={{ color: ACHIEVEMENT_CATEGORIES[category]?.color }}>
                                {ACHIEVEMENT_CATEGORIES[category]?.icon} {ACHIEVEMENT_CATEGORIES[category]?.name}
                            </h2>
                            <div className={styles.achievementsList}>
                                {achievements.map(achievement => {
                                    const unlocked = isUnlocked(achievement.id);
                                    const unlockDate = getUnlockDate(achievement.id);

                                    return (
                                        <div
                                            key={achievement.id}
                                            className={`${styles.achievementCard} ${unlocked ? styles.unlocked : styles.locked}`}
                                        >
                                            <div className={styles.achievementIcon}>
                                                {unlocked ? (
                                                    <span className={styles.emoji}>{achievement.icon}</span>
                                                ) : (
                                                    <Lock size={24} />
                                                )}
                                            </div>
                                            <div className={styles.achievementInfo}>
                                                <h3>{achievement.title}</h3>
                                                <p>{achievement.description}</p>
                                                {unlocked && unlockDate && (
                                                    <span className={styles.unlockDateBadge}>
                                                        <CheckCircle size={12} /> Unlocked {unlockDate}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.achievementPoints}>
                                                <span className={styles.points}>{achievement.points}</span>
                                                <span className={styles.pointsLabel}>pts</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Achievements;
