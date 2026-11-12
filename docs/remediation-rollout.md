# PeptideLog fixes — deployment checklist

This branch changes the React app, Supabase schema/triggers, and Vercel reminder delivery. A frontend-only deployment is incomplete.

## Apply database migrations first

Run the two new migrations through the existing Supabase migration workflow:

- `20261112000001_profile_and_inventory_consistency.sql`
- `20261112000002_background_reminders.sql`

Do not run old repository migrations blindly against production; first compare the deployed migration history. Back up the database before production schema changes.

The first migration adds profile fields and a transactional per-injection vial allocation ledger. New clients mark insertions with `inventory_sync_version: 1`; cached old clients keep their existing insert-time deduction without a second trigger deduction. Notes-only edits do not change allocations. Inventory deductions use row locks plus a per-user transaction lock and restore only recorded allocations.

Historical injections have no reliable allocation ledger. Their prior consumption is preserved as a baseline, rather than refunding stock to an arbitrary vial. Changing the substance/units or reducing below that original baseline is rejected with an explanation. To correct such an entry, manually reconcile inventory and delete/recreate it. Deleting historical entries restores only tracked consumption since this release, not their original untracked consumption. Current inventory balances should be reconciled manually if already inaccurate.

## Configure background web reminders

Set these SERVER environment variables on the existing Vercel project:

- `VITE_SUPABASE_URL` (already used by this app)
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never use a `VITE_` prefix)
- `CRON_SECRET` (must be set; the job fails closed without it)
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY` (server only)
- `VAPID_SUBJECT` (a verified support `mailto:` address or HTTPS contact URL)

Generate the VAPID pair once using the `web-push` package's `generateVAPIDKeys()` in a secure administrative environment. Keep it stable across deployments. Do not commit secrets.

`/api/cron/send-reminders` is invoked by Supabase Cron every minute using `pg_cron`, `pg_net`, and Vault. It is deliberately absent from Vercel's cron configuration so the site stays on the existing Hobby plan. No paid-plan upgrade is required or authorized. Use `supabase/setup_background_reminder_cron.sql` after configuring the Vault shared secret; confirm available Supabase extensions before applying it.

The job sends 30-minute and due-time reminders, retries within a five-minute delivery window, leases deliveries to avoid concurrent duplicate sends, and removes expired subscriptions. Notification tags collapse duplicate deliveries after a rare send/ack failure. Delivery is not guaranteed by browsers or operating systems. The endpoint and configuration API stay disabled until required environment variables are present.

Subscriptions are scoped to authenticated users with row-level security. Notifications contain generic reminder text to avoid putting substance or dose details on a lock screen. Endpoints are restricted to known public browser push services. The same PWA worker handles both caching and background push; logout unsubscribes this device.

Users must opt in from Settings → Notifications or the Notifications page. On iPhone, the website must be installed on the Home Screen where required by Safari. Permission/configuration errors remain visible; the interface does not claim background delivery is configured when setup fails.

Existing schedules lack a trustworthy timezone/UTC instant. They remain visible, but users must recreate them to enable background web delivery. New schedules persist `scheduled_at` in UTC while keeping their existing local date/time fields. Native reminders use those same instants; browser timers no longer duplicate background reminders.

## Verify after deployment

- Profile: change all fields, save, refresh, confirm all persist.
- Signup: let a guest prompt open, sign in, confirm immediate dismissal; refresh and sign out on that device, confirm no recruitment popup returns.
- Inventory: use disposable test records; log across two vials, increase/decrease dose, change peptide, delete, verify stock and owner isolation.
- Web reminders: opt in on a test account, create a near-term schedule, close the page, verify push; complete/delete a schedule and verify it is skipped. Verify revoked/expired subscriptions and logout.
- Native reminders: verify cancellation, 30-minute and due-time notifications, and schedule times on a device.

## Local validation

`npm test` includes regression tests and executes both migrations against an embedded PostgreSQL instance (PGlite). It checks multi-vial deductions, edit/delete restoration, rollback, IU handling, cached-client compatibility, baseline preservation, and delivery leases. It does not simulate concurrent production transactions, real browser push providers, or native OS delivery.

`npm run build:full` builds the app/PWA and generates prerendered pages. Live encyclopedia prerendering additionally needs the production Supabase environment.
