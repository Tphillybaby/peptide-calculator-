export const nextPlannedReminder = (schedules, now = new Date()) => {
    const candidates = schedules.filter(s => !s.completed && s.backgroundReminderReady !== false && new Date(s.date) > now)
        .flatMap(s => [30, 0].map(minutes => ({ at: new Date(new Date(s.date).getTime() - minutes * 60000), minutes, peptide: s.peptide })))
        .filter(r => r.at > now).sort((a, b) => a.at - b.at);
    return candidates[0] || null;
};
export const reminderLabel = ({ supported, permission, enabled, subscription, configured }) => {
    if (!supported) return 'Unavailable in this browser';
    if (permission === 'denied') return 'Blocked in device settings';
    if (!enabled) return 'Off';
    if (permission !== 'granted') return 'Permission needed';
    if (!configured) return 'Background service unavailable';
    if (!subscription) return 'This device needs reconnecting';
    return 'Enabled on this device';
};
