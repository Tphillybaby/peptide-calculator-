import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getInjectionStats } from '../src/utils/injectionStats';
import { profileUpdate } from '../src/utils/profileUpdate';
import { dueReminderTypes, isAllowedPushEndpoint } from '../server/reminderUtils';

const auth = vi.hoisted(() => ({ user: null, loading: false, authReady: true, hasAccount: false }));
vi.mock('../src/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../src/services/nativeService', () => ({ device: { isNative: false }, localNotifications: {} }));
import SignupPrompt from '../src/components/SignupPrompt';
import PromotionalAuthPopup from '../src/components/PromotionalAuthPopup';
import { notificationService } from '../src/services/notificationService';

beforeEach(() => {
    localStorage.clear();
    Object.assign(auth, { user: null, loading: false, authReady: true, hasAccount: false });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

for (const [Component, delay, text] of [[SignupPrompt, 1600, 'Sign Up Free'], [PromotionalAuthPopup, 15100, 'Create Free Account']]) {
    describe(Component.name, () => {
        it('hides an already visible prompt immediately when a user signs in', () => {
            vi.useFakeTimers(); localStorage.setItem('signup_prompt_interactions', '3');
            const view = render(<MemoryRouter><Component /></MemoryRouter>);
            act(() => vi.advanceTimersByTime(delay));
            expect(screen.getByText(text)).toBeInTheDocument();
            auth.user = { id: 'signed-in' };
            view.rerender(<MemoryRouter><Component /></MemoryRouter>);
            expect(screen.queryByText(text)).not.toBeInTheDocument();
        });
        it.each(['loading', 'hasAccount'])('never opens for %s users', key => {
            vi.useFakeTimers(); auth[key] = true; localStorage.setItem('signup_prompt_interactions', '3');
            render(<MemoryRouter><Component /></MemoryRouter>);
            act(() => vi.advanceTimersByTime(30000));
            expect(screen.queryByText(text)).not.toBeInTheDocument();
        });
        it('waits for session resolution even after the UI loading timeout', () => {
            vi.useFakeTimers(); auth.authReady = false; localStorage.setItem('signup_prompt_interactions', '3');
            render(<MemoryRouter><Component /></MemoryRouter>);
            act(() => vi.advanceTimersByTime(30000));
            expect(screen.queryByText(text)).not.toBeInTheDocument();
        });
        it('cancels a pending prompt timer on login', () => {
            vi.useFakeTimers(); localStorage.setItem('signup_prompt_interactions', '3');
            const view = render(<MemoryRouter><Component /></MemoryRouter>);
            auth.user = { id: 'signed-in' }; view.rerender(<MemoryRouter><Component /></MemoryRouter>);
            act(() => vi.advanceTimersByTime(30000));
            expect(screen.queryByText(text)).not.toBeInTheDocument();
        });
    });
}

describe('Remaining estimates', () => {
    const now = Date.UTC(2026, 10, 12);
    const injection = (peptide, dosage, unit, hoursAgo) => ({ peptide, dosage, unit, date: new Date(now - hoursAgo * 3600000).toISOString() });
    it('keeps substances and IU separate and uses each stored half-life', () => {
        const stats = getInjectionStats([
            injection('A', '4', 'mg', 4), injection('A', '1000', 'mcg', 4),
            injection('B', 4, 'mg', 4), injection('A', 10, 'IU', 4)
        ], [{ name: 'A', half_life_hours: 4 }, { name: 'B', half_life_hours: 8 }], now);
        expect(stats.activeLevels).toHaveLength(3);
        expect(stats.activeLevels[0].amount).toBe(2.5);
        expect(stats.activeLevels[1].amount).toBeCloseTo(2.8284, 4);
        expect(stats.activeLevels[2]).toMatchObject({ amount: 5, unit: 'IU' });
        expect(stats.weeklyTotals[0].amount).toBe(5);
    });
    it('never invents a half-life or counts future doses', () => {
        const stats = getInjectionStats([injection('Unknown', 2, 'mg', 1), injection('A', 100, 'mg', -2)], [], now);
        expect(stats.activeLevels).toEqual([{ peptide: 'Unknown', unit: 'mg', amount: 0, available: false }]);
        expect(stats.weeklyCount).toBe(1);
    });
});

describe('Profile persistence', () => {
    it('includes every editable field and clears optional age', () => {
        const fields = { full_name: 'Tester', age: '30', gender: 'other', weight_goal: 'recovery' };
        expect(profileUpdate('user', fields)).toMatchObject({ ...fields, age: 30, id: 'user' });
        expect(profileUpdate('user', { ...fields, age: '' }).age).toBeNull();
        expect(() => profileUpdate('user', { ...fields, age: '1.5' })).toThrow('whole number');
    });
});

describe('Notifications', () => {
    it('does not crash without the Notification API', async () => {
        vi.stubGlobal('Notification', undefined);
        // Remove rather than setting undefined, so feature detection matches an unsupported browser.
        delete window.Notification;
        expect(await notificationService.sendNotification('Test')).toBeNull();
        expect(await notificationService.requestPermission()).toBe(false);
    });
    it('handles browsers that reject Notification constructors', async () => {
        class UnsupportedNotification { static permission = 'granted'; constructor() { throw new Error('Use service worker'); } }
        vi.stubGlobal('Notification', UnsupportedNotification);
        expect(await notificationService.sendNotification('Test')).toBeNull();
    });
    it('only permits known public push endpoints', () => {
        expect(isAllowedPushEndpoint('https://fcm.googleapis.com/send/123')).toBe(true);
        expect(isAllowedPushEndpoint('https://web.push.apple.com/a')).toBe(true);
        for (const endpoint of ['https://127.0.0.1/a', 'http://fcm.googleapis.com/a', 'https://fcm.googleapis.com.evil.test/a', 'https://user@fcm.googleapis.com/a']) {
            expect(isAllowedPushEndpoint(endpoint)).toBe(false);
        }
    });
    it('handles due, upcoming, stale, and invalid reminder times', () => {
        const now = Date.now();
        expect(dueReminderTypes(new Date(now + 30 * 60000).toISOString(), now)).toEqual([30]);
        expect(dueReminderTypes(new Date(now).toISOString(), now)).toEqual([0]);
        expect(dueReminderTypes(new Date(now - 10 * 60000).toISOString(), now)).toEqual([]);
        expect(dueReminderTypes('bad date', now)).toEqual([]);
    });
    it('loads the server cron handler and rejects missing authorization', async () => {
        const { default: handler } = await import('../api/cron/send-reminders');
        const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };
        await handler({ headers: {} }, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});
