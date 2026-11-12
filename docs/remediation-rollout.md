# PeptideLog fixes and reminder operation

The release includes React changes, database migrations, and the `send-reminders` Supabase Edge Function. Vercel remains on the existing Hobby plan; no account upgrade is authorized or required for this scheduling design.

## Database

The migration filenames match the versions applied to the production project's migration history:

- `20261112195712_profile_and_inventory_consistency.sql`
- `20261112195752_background_reminders.sql`
- `20261112195903_enable_background_reminder_transport.sql`
- `20261112200129_schedule_background_reminders_on_existing_plan.sql`

Do not reapply these manually to production. Compare deployed migration history before pushing future migrations. The scheduling migration assumes the runtime secret has been configured; it fails closed if configuration is missing. Configure development projects separately rather than pointing their schedulers at production.

Inventory mutations are transactional and track allocations across vials. Cached old clients retain their original insert-time deduction, avoiding a second trigger deduction. Notes-only edits do not reallocate stock. Trigger functions live in a private schema; the allocation ledger is not writable by clients.

Historical injections have no reliable original allocation ledger. Their prior consumption is preserved as a baseline, rather than refunding stock to an arbitrary vial. Changing their substance/units or reducing below the original baseline requires manual reconciliation and recreation. Deleting historical entries restores only tracked consumption since this release. Existing inaccurate inventory balances cannot be reconstructed automatically.

## Background reminders

Supabase Cron invokes `send-reminders` every minute through `pg_net`. Vault contains one encrypted JSON secret named `peptidelog_reminder_config`, with `cronSecret`, `publicKey`, `privateKey`, and `subject`. Generate the VAPID pair once using `web-push.generateVAPIDKeys()` in a trusted administrative session, and a cryptographically random shared secret of at least 32 bytes. Do not commit secret values or put private keys in frontend variables.

The Edge Function reads this configuration through a service-role-only RPC. Its automatic Supabase runtime credentials stay on the server. Gateway JWT verification is off because the function implements its own shared-secret authentication with a fixed-length hashed comparison. Missing configuration or invalid credentials fail closed. The public VAPID key and `BACKGROUND_REMINDERS_ENABLED=true` are the only new Vercel environment values required. `api/cron/send-reminders.js` is an optional Node fallback, remains unscheduled, and requires separate server credentials if ever used.

Notifications contain generic text without substance/dose details. Dispatch uses per-delivery leases, retries transient failures within a five-minute window, skips completed/cancelled schedules, removes expired subscriptions, and uses notification tags to collapse rare duplicate sends. Subscriptions are protected by ownership RLS. Logout unsubscribes the device. Browser/OS restrictions still affect actual delivery; this is not a guaranteed alarm service.

Users opt in from Settings → Notifications or the Notifications page. Existing upcoming schedules are converted from the local date/time currently shown on that device into UTC instants at opt-in. New schedules persist their UTC instant immediately. On iPhone, add the site to the Home Screen where required for push support.

## Verification

`npm test` covers signup/login races, profile payload persistence, per-substance/unit decay estimates, unsupported notification APIs, dispatch behavior, actual migration execution in embedded PostgreSQL, multi-vial stock edits/deletion, rollback, cached-client compatibility, historical baselines, and delivery leases.

Production verification also exercises inventory insertion/edit/deletion as an authenticated owner in a transaction that is rolled back, checks the authenticated reminder endpoint through `pg_net`, confirms scheduled job execution, and compares preexisting security advisories against the post-migration report. These checks do not certify real browser push-provider or native OS delivery on a user's device.

After release, verify profile persistence, signed-in popup suppression, inventory changes using disposable entries, and opt-in background push on an actual device. Do not trigger test messages to real subscribers without authorization.
