import { describe, it, expect } from 'vitest';
import { recentDoses, upcomingDoses, lowStockVials, repeatDoseDraft } from './dailyDashboard';

describe('daily dashboard', () => {
    const now = new Date('2026-11-12T12:00:00');
    it('sorts past doses without mutating history or including invalid and future records', () => {
        const rows = [{ peptide: 'A', dosage: 1, date: '2026-11-10' }, { peptide: 'B', dosage: 2, date: '2026-11-11' }, { peptide: 'C', dosage: 1, date: '2026-11-13' }, { peptide: 'D', dosage: 1, date: 'invalid' }];
        expect(recentDoses(rows, now).map(x => x.peptide)).toEqual(['B', 'A']);
        expect(rows[0].peptide).toBe('A');
    });
    it('includes incomplete earlier-today schedules but excludes yesterday and completed doses', () => {
        const rows = [{ id: 1, date: '2026-11-12T08:00:00' }, { id: 2, date: '2026-11-11T23:00:00' }, { id: 3, date: '2026-11-12T09:00:00', completed: true }, { id: 4, date: '2026-11-19T00:00:00' }];
        expect(upcomingDoses(rows, now).map(x => x.id)).toEqual([1]);
    });
    it('uses a percentage per vial and includes empty vials without flagging small full vials', () => {
        expect(lowStockVials([{ id: 1, quantity_mg: 5, remaining_mg: 5 }, { id: 2, quantity_mg: 100, remaining_mg: 20 }, { id: 3, quantity_mg: 5, remaining_mg: 0 }, { id: 4, quantity_mg: 5, remaining_mg: null }]).map(x => x.id)).toEqual([2, 3]);
    });
    it('repeats only dose fields and requires a fresh site selection', () => {
        expect(repeatDoseDraft({ id: 'old', peptide: 'A', dosage: 2, unit: 'mg', notes: 'old notes', site: 'Arm', date: 'old' }, 'today')).toEqual({ peptide: 'A', dosage: '2', unit: 'mg', site: '', notes: '', date: 'today' });
    });
});
