// @vitest-environment node
import { beforeEach, afterEach, it, vi, expect } from 'vitest';
import { scheduledInstant } from '../src/utils/scheduleTime';
const mocks = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn(), send: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: mocks.from, rpc: mocks.rpc }) }));
vi.mock('web-push', () => ({ sendNotification: mocks.send }));
import handler from '../api/cron/send-reminders';

function query(result) {
    const builder = { then: resolve => Promise.resolve(result).then(resolve) };
    for (const method of ['select', 'eq', 'gte', 'lte', 'single', 'maybeSingle', 'update', 'delete']) builder[method] = vi.fn(() => builder);
    return builder;
}
beforeEach(() => {
    for (const [key, value] of Object.entries({ CRON_SECRET: 'test-cron', VITE_SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-only', VAPID_PUBLIC_KEY: 'public', VAPID_PRIVATE_KEY: 'private', VAPID_SUBJECT: 'mailto:test@example.com' })) vi.stubEnv(key, value);
    vi.clearAllMocks();
});
afterEach(() => vi.unstubAllEnvs());
it('sends background reminders without a page session and records delivery', async () => {
    const date = new Date().toISOString();
    const deliveryUpdate = query({ error: null });
    mocks.from.mockImplementation(table => ({
        schedules: query({ data: [{ id: 'dose', user_id: 'owner', scheduled_at: date, completed: false }], error: null }),
        profiles: query({ data: { notification_preferences: { injectionReminders: true } } }),
        push_subscriptions: query({ data: [{ id: 'sub', endpoint: 'https://fcm.googleapis.com/send/test', subscription: { endpoint: 'https://fcm.googleapis.com/send/test', keys: {} } }] }),
        reminder_deliveries: deliveryUpdate
    })[table]);
    // The second schedules query returns a single current row rather than the initial list.
    let scheduleQueries = 0;
    const from = mocks.from.getMockImplementation();
    mocks.from.mockImplementation(table => {
        if (table === 'schedules' && scheduleQueries++ > 0) return query({ data: { scheduled_at: date, completed: false } });
        return from(table);
    });
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    mocks.send.mockResolvedValue({ statusCode: 201 });
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler({ headers: { authorization: 'Bearer test-cron' } }, res);
    expect(mocks.send).toHaveBeenCalledOnce();
    expect(JSON.parse(mocks.send.mock.calls[0][1]).body).toContain('scheduled now');
    expect(deliveryUpdate.update).toHaveBeenCalledWith({ sent_at: expect.any(String) });
    expect(res.json).toHaveBeenCalledWith({ sent: 1, failed: 0 });
});
it('does not send reminders when they are disabled', async () => {
    mocks.from.mockImplementation(table => query({ data: table === 'schedules'
        ? [{ id: 'dose', user_id: 'owner', scheduled_at: new Date().toISOString() }]
        : { notification_preferences: { injectionReminders: false } }, error: null }));
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };
    await handler({ headers: { authorization: 'Bearer test-cron' } }, res);
    expect(mocks.send).not.toHaveBeenCalled();
});
it('uses the chosen local time rather than midnight for new schedules', () => {
    const date = new Date(2026, 10, 12, 0);
    const instant = new Date(scheduledInstant(date.toISOString(), '08:30'));
    expect(instant.getDate()).toBe(12);
    expect(instant.getHours()).toBe(8);
    expect(instant.getMinutes()).toBe(30);
    expect(() => scheduledInstant(date, '25:00')).toThrow('valid schedule');
});
