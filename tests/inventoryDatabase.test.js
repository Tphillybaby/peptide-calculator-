// @vitest-environment node
import { beforeAll, afterAll, it, expect } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

let db;
const owner = '00000000-0000-0000-0000-000000000001';
const other = '00000000-0000-0000-0000-000000000002';
const vial1 = '10000000-0000-0000-0000-000000000001';
const vial2 = '10000000-0000-0000-0000-000000000002';
const injection = '20000000-0000-0000-0000-000000000001';
const legacy = '20000000-0000-0000-0000-000000000002';

beforeAll(async () => {
    db = new PGlite();
    await db.exec(`
        create role anon; create role authenticated; create role service_role;
        create schema auth;
        create table auth.users(id uuid primary key);
        create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
        create table profiles(id uuid primary key);
        create table injections(id uuid primary key, user_id uuid, peptide_name text, dosage_value numeric, dosage_unit text);
        create table inventory(id uuid primary key, user_id uuid, peptide_name text, remaining_mg numeric, created_at timestamptz default now());
        create table schedules(id uuid primary key, user_id uuid, completed boolean default false);
        insert into auth.users values ('${owner}'), ('${other}');
        insert into injections values ('${legacy}','${owner}','A',4,'mg');
    `);
    for (const file of ['20261112000001_profile_and_inventory_consistency.sql','20261112000002_background_reminders.sql']) {
        await db.exec(readFileSync(new URL('../supabase/migrations/'+file, import.meta.url), 'utf8'));
    }
    await db.exec(`insert into inventory(id,user_id,peptide_name,remaining_mg) values
        ('${vial1}','${owner}','A',2), ('${vial2}','${owner}','A',5),
        ('10000000-0000-0000-0000-000000000003','${other}','A',100);`);
}, 30000);
afterAll(async () => { await db?.close(); });
const remaining = async () => (await db.query(`select remaining_mg from inventory where user_id='${owner}' order by id`)).rows.map(r => Number(r.remaining_mg));

it('deducts across vials, reconciles edits and units, and restores on delete', async () => {
    await db.exec(`insert into injections(id,user_id,peptide_name,dosage_value,dosage_unit,inventory_sync_version) values ('${injection}','${owner}','A',4,'mg',1);`);
    expect(await remaining()).toEqual([0,3]);
    await db.exec(`update injections set dosage_value=1000,dosage_unit='mcg' where id='${injection}';`);
    expect(await remaining()).toEqual([1,5]);
    await db.exec(`update injections set dosage_value=6000 where id='${injection}';`);
    expect(await remaining()).toEqual([0,1]);
    await expect(db.exec(`update injections set dosage_value=-1 where id='${injection}';`)).rejects.toThrow('Invalid injection dosage');
    expect(await remaining()).toEqual([0,1]);
    await db.exec(`delete from injections where id='${injection}';`);
    expect(await remaining()).toEqual([2,5]);
    expect((await db.query(`select remaining_mg from inventory where user_id='${other}'`)).rows[0].remaining_mg).toBe('100');
});

it('does not treat IU as mass and moves allocations when a peptide changes', async () => {
    await db.exec(`insert into injections(id,user_id,peptide_name,dosage_value,dosage_unit,inventory_sync_version) values ('${injection}','${owner}','A',4,'IU',1);`);
    expect(await remaining()).toEqual([2,5]);
    await db.exec(`update injections set dosage_unit='mg' where id='${injection}';`);
    expect(await remaining()).toEqual([0,3]);
    await db.exec(`update injections set peptide_name='B' where id='${injection}';`);
    expect(await remaining()).toEqual([2,5]);
    await db.exec(`delete from injections where id='${injection}';`);
});

it('preserves the historical baseline instead of inventing stock refunds', async () => {
    await db.exec(`update injections set dosage_value=6 where id='${legacy}';`);
    expect(await remaining()).toEqual([0,5]);
    await db.exec(`update injections set dosage_value=7 where id='${legacy}';`);
    expect(await remaining()).toEqual([0,4]);
    await expect(db.exec(`update injections set dosage_value=3,inventory_baseline_mg=0 where id='${legacy}';`)).rejects.toThrow('Historical injection');
    expect(await remaining()).toEqual([0,4]);
    await db.exec(`delete from injections where id='${legacy}';`);
    expect(await remaining()).toEqual([2,5]);
});

it('does not double deduct inserts from cached clients', async () => {
    await db.exec(`insert into injections(id,user_id,peptide_name,dosage_value,dosage_unit) values ('${injection}','${owner}','A',4,'mg');`);
    expect(await remaining()).toEqual([2,5]);
    await db.exec(`delete from injections where id='${injection}';`);
});

it('leases reminder deliveries once, retries expired leases, and never resends completed ones', async () => {
    const schedule = '30000000-0000-0000-0000-000000000001';
    const sub = '40000000-0000-0000-0000-000000000001';
    const token = '50000000-0000-0000-0000-000000000001';
    await db.exec(`insert into schedules values ('${schedule}','${owner}',false,now());
        insert into push_subscriptions(id,user_id,endpoint,subscription) values ('${sub}','${owner}','https://example.test','{}');`);
    const claim = async () => (await db.query(`select claim_reminder_delivery('${schedule}','${sub}','2026-11-12T13:00:00Z',30,'${token}') as claimed`)).rows[0].claimed;
    expect(await claim()).toBe(true);
    expect(await claim()).toBe(false);
    await db.exec(`update reminder_deliveries set lease_until=now()-interval '1 minute';`);
    expect(await claim()).toBe(true);
    await db.exec(`update reminder_deliveries set sent_at=now(),lease_until=now()-interval '1 minute';`);
    expect(await claim()).toBe(false);
    expect((await db.query(`select has_function_privilege('authenticated', 'public.claim_reminder_delivery(uuid,uuid,timestamptz,integer,uuid)', 'execute') as allowed`)).rows[0].allowed).toBe(false);
    expect((await db.query(`select has_table_privilege('authenticated','public.injection_inventory_allocations','insert') as allowed`)).rows[0].allowed).toBe(false);
});
