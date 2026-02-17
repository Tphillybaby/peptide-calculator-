/**
 * Achievement Service
 * Defines all achievements and handles unlocking/tracking
 */
import { supabase } from '../lib/supabase';

// Achievement Definitions
export const ACHIEVEMENTS = {
    // Injection Milestones
    FIRST_INJECTION: {
        id: 'first_injection',
        title: 'First Steps',
        description: 'Log your first injection',
        icon: '💉',
        category: 'milestones',
        points: 10,
        requirement: 1
    },
    TEN_INJECTIONS: {
        id: 'ten_injections',
        title: 'Getting Started',
        description: 'Log 10 injections',
        icon: '📊',
        category: 'milestones',
        points: 25,
        requirement: 10
    },
    FIFTY_INJECTIONS: {
        id: 'fifty_injections',
        title: 'Committed',
        description: 'Log 50 injections',
        icon: '🎯',
        category: 'milestones',
        points: 50,
        requirement: 50
    },
    HUNDRED_INJECTIONS: {
        id: 'hundred_injections',
        title: 'Centurion',
        description: 'Log 100 injections',
        icon: '💯',
        category: 'milestones',
        points: 100,
        requirement: 100
    },

    // Streak Achievements
    WEEK_STREAK: {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day logging streak',
        icon: '🔥',
        category: 'streak',
        points: 30,
        requirement: 7
    },
    MONTH_STREAK: {
        id: 'month_streak',
        title: 'Monthly Master',
        description: 'Maintain a 30-day logging streak',
        icon: '⚡',
        category: 'streak',
        points: 100,
        requirement: 30
    },

    // Variety Achievements
    PEPTIDE_EXPLORER: {
        id: 'peptide_explorer',
        title: 'Explorer',
        description: 'Log 3 different peptides',
        icon: '🧪',
        category: 'variety',
        points: 20,
        requirement: 3
    },
    PEPTIDE_CONNOISSEUR: {
        id: 'peptide_connoisseur',
        title: 'Connoisseur',
        description: 'Log 5 different peptides',
        icon: '🏆',
        category: 'variety',
        points: 40,
        requirement: 5
    },
    PEPTIDE_SCIENTIST: {
        id: 'peptide_scientist',
        title: 'Scientist',
        description: 'Log 10 different peptides',
        icon: '🔬',
        category: 'variety',
        points: 75,
        requirement: 10
    },

    // Feature Usage
    CALCULATOR_USED: {
        id: 'calculator_used',
        title: 'Calculated Risk',
        description: 'Use the reconstitution calculator',
        icon: '🧮',
        category: 'features',
        points: 10,
        requirement: 1
    },
    STACK_BUILDER_USED: {
        id: 'stack_builder_used',
        title: 'Stack Master',
        description: 'Create your first peptide stack',
        icon: '📚',
        category: 'features',
        points: 15,
        requirement: 1
    },
    INVENTORY_MANAGED: {
        id: 'inventory_managed',
        title: 'Organized',
        description: 'Add items to your inventory',
        icon: '📦',
        category: 'features',
        points: 15,
        requirement: 1
    },
    BLOOD_WORK_LOGGED: {
        id: 'blood_work_logged',
        title: 'Data Driven',
        description: 'Log your first blood work results',
        icon: '🩸',
        category: 'features',
        points: 25,
        requirement: 1
    },

    // Community
    FIRST_REVIEW: {
        id: 'first_review',
        title: 'Critic',
        description: 'Write your first vendor review',
        icon: '⭐',
        category: 'community',
        points: 20,
        requirement: 1
    },
    FORUM_PARTICIPANT: {
        id: 'forum_participant',
        title: 'Community Member',
        description: 'Make your first forum post',
        icon: '💬',
        category: 'community',
        points: 15,
        requirement: 1
    },

    // Learning
    ENCYCLOPEDIA_READER: {
        id: 'encyclopedia_reader',
        title: 'Scholar',
        description: 'View 10 peptide encyclopedia entries',
        icon: '📖',
        category: 'learning',
        points: 20,
        requirement: 10
    },
    RESEARCH_READER: {
        id: 'research_reader',
        title: 'Researcher',
        description: 'Read 5 research papers',
        icon: '🎓',
        category: 'learning',
        points: 30,
        requirement: 5
    },
    SAFETY_CONSCIOUS: {
        id: 'safety_conscious',
        title: 'Safety First',
        description: 'Read the safety guide',
        icon: '🛡️',
        category: 'learning',
        points: 15,
        requirement: 1
    },

    // Special
    EARLY_ADOPTER: {
        id: 'early_adopter',
        title: 'Early Adopter',
        description: 'Join during the first year',
        icon: '🌟',
        category: 'special',
        points: 50,
        requirement: 1
    },
    NIGHT_OWL: {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Log an injection after midnight',
        icon: '🦉',
        category: 'special',
        points: 10,
        requirement: 1
    },
    EARLY_BIRD: {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Log an injection before 6 AM',
        icon: '🐦',
        category: 'special',
        points: 10,
        requirement: 1
    }
};

// Category metadata
export const ACHIEVEMENT_CATEGORIES = {
    milestones: { name: 'Milestones', icon: '🎯', color: '#10b981' },
    streak: { name: 'Streaks', icon: '🔥', color: '#f59e0b' },
    variety: { name: 'Variety', icon: '🧪', color: '#8b5cf6' },
    features: { name: 'Features', icon: '⚙️', color: '#3b82f6' },
    community: { name: 'Community', icon: '👥', color: '#ec4899' },
    learning: { name: 'Learning', icon: '📚', color: '#06b6d4' },
    special: { name: 'Special', icon: '⭐', color: '#f97316' }
};

class AchievementService {
    constructor() {
        this.listeners = [];
    }

    // Subscribe to achievement unlocks
    onAchievementUnlocked(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    // Notify listeners of new achievement
    notifyUnlock(achievement) {
        this.listeners.forEach(callback => callback(achievement));
    }

    // Get all user achievements
    async getUserAchievements(userId) {
        if (!userId) return [];

        const { data, error } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }

        return data || [];
    }

    // Check if achievement is unlocked
    async isUnlocked(userId, achievementId) {
        const achievements = await this.getUserAchievements(userId);
        return achievements.some(a => a.achievement_id === achievementId);
    }

    // Unlock an achievement
    async unlockAchievement(userId, achievementId) {
        if (!userId || !achievementId) return null;

        // Check if already unlocked
        const alreadyUnlocked = await this.isUnlocked(userId, achievementId);
        if (alreadyUnlocked) return null;

        const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
        if (!achievement) return null;

        const { data, error } = await supabase
            .from('user_achievements')
            .insert({
                user_id: userId,
                achievement_id: achievementId,
                progress: achievement.requirement
            })
            .select()
            .single();

        if (error) {
            console.error('Error unlocking achievement:', error);
            return null;
        }

        // Notify listeners
        this.notifyUnlock(achievement);

        return { ...data, achievement };
    }

    // Update progress for an achievement
    async updateProgress(userId, achievementId, progress) {
        if (!userId) return null;

        const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
        if (!achievement) return null;

        // Check if should unlock
        if (progress >= achievement.requirement) {
            return this.unlockAchievement(userId, achievementId);
        }

        // Update progress in database
        const { error } = await supabase
            .from('user_achievements')
            .upsert({
                user_id: userId,
                achievement_id: achievementId,
                progress: progress
            }, {
                onConflict: 'user_id,achievement_id'
            });

        if (error) {
            console.error('Error updating progress:', error);
        }

        return null;
    }

    // Check all injection-related achievements
    async checkInjectionAchievements(userId, injections) {
        if (!userId || !injections) return [];

        const unlocked = [];
        const totalInjections = injections.length;
        const uniquePeptides = new Set(injections.map(i => i.peptide_name || i.peptide)).size;

        // Check injection milestones
        if (totalInjections >= 1) {
            const result = await this.unlockAchievement(userId, 'first_injection');
            if (result) unlocked.push(result);
        }
        if (totalInjections >= 10) {
            const result = await this.unlockAchievement(userId, 'ten_injections');
            if (result) unlocked.push(result);
        }
        if (totalInjections >= 50) {
            const result = await this.unlockAchievement(userId, 'fifty_injections');
            if (result) unlocked.push(result);
        }
        if (totalInjections >= 100) {
            const result = await this.unlockAchievement(userId, 'hundred_injections');
            if (result) unlocked.push(result);
        }

        // Check variety achievements
        if (uniquePeptides >= 3) {
            const result = await this.unlockAchievement(userId, 'peptide_explorer');
            if (result) unlocked.push(result);
        }
        if (uniquePeptides >= 5) {
            const result = await this.unlockAchievement(userId, 'peptide_connoisseur');
            if (result) unlocked.push(result);
        }
        if (uniquePeptides >= 10) {
            const result = await this.unlockAchievement(userId, 'peptide_scientist');
            if (result) unlocked.push(result);
        }

        // Check time-based achievements
        const lastInjection = injections[0];
        if (lastInjection) {
            const injectionDate = new Date(lastInjection.injection_date || lastInjection.date);
            const hours = injectionDate.getHours();

            if (hours >= 0 && hours < 5) {
                const result = await this.unlockAchievement(userId, 'night_owl');
                if (result) unlocked.push(result);
            }
            if (hours >= 4 && hours < 6) {
                const result = await this.unlockAchievement(userId, 'early_bird');
                if (result) unlocked.push(result);
            }
        }

        // Calculate streak
        const streak = this.calculateStreak(injections);
        if (streak >= 7) {
            const result = await this.unlockAchievement(userId, 'week_streak');
            if (result) unlocked.push(result);
        }
        if (streak >= 30) {
            const result = await this.unlockAchievement(userId, 'month_streak');
            if (result) unlocked.push(result);
        }

        return unlocked;
    }

    // Calculate current streak
    calculateStreak(injections) {
        if (!injections || injections.length === 0) return 0;

        const now = new Date();
        const sortedDates = [...new Set(
            injections
                .map(inj => new Date(inj.injection_date || inj.date).toDateString())
        )].sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        for (let i = 0; i < sortedDates.length; i++) {
            const checkDate = new Date(now);
            checkDate.setDate(checkDate.getDate() - i);
            if (sortedDates.includes(checkDate.toDateString())) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // Get user's total points
    async getTotalPoints(userId) {
        const userAchievements = await this.getUserAchievements(userId);
        return userAchievements.reduce((total, ua) => {
            const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === ua.achievement_id);
            return total + (achievement?.points || 0);
        }, 0);
    }

    // Get achievement by ID
    getAchievementById(id) {
        return Object.values(ACHIEVEMENTS).find(a => a.id === id);
    }

    // Get all achievements grouped by category
    getAllAchievementsByCategory() {
        const grouped = {};
        Object.values(ACHIEVEMENTS).forEach(achievement => {
            if (!grouped[achievement.category]) {
                grouped[achievement.category] = [];
            }
            grouped[achievement.category].push(achievement);
        });
        return grouped;
    }
}

export const achievementService = new AchievementService();
export default achievementService;
