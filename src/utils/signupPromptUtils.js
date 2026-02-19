/**
 * Signup Prompt Utilities
 * Separated from SignupPrompt component to allow Fast Refresh
 * and sharing of these utilities across components.
 */

export const PROMPT_STORAGE_KEY = 'signup_prompt_dismissed';
const PROMPT_INTERACTION_COUNT_KEY = 'signup_prompt_interactions';

// Check if prompt was recently dismissed (within 7 days)
export const wasRecentlyDismissed = () => {
    const dismissed = localStorage.getItem(PROMPT_STORAGE_KEY);
    if (!dismissed) return false;
    const dismissedTime = parseInt(dismissed, 10);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedTime < sevenDays;
};

// Get interaction count
export const getInteractionCount = () => {
    return parseInt(localStorage.getItem(PROMPT_INTERACTION_COUNT_KEY) || '0', 10);
};

// Increment interaction count
export const recordInteraction = () => {
    const count = getInteractionCount() + 1;
    localStorage.setItem(PROMPT_INTERACTION_COUNT_KEY, count.toString());
    return count;
};
