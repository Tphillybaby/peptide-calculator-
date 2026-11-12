import { expect, it } from 'vitest';
import { vialDoseEstimate, validateStock, presetFromForm, progressSeries } from './dailyTools';
import { nextPlannedReminder, reminderLabel } from './reminderStatus';
const now = new Date('2026-11-12T12:00:00Z');
it('converts mcg to mg but never guesses a mass for IU', () => {
 const vial = { peptide_name:'A', remaining_mg:1.5 };
 expect(vialDoseEstimate(vial,[{ peptide:'A', dosage:250, unit:'mcg', date:now }],now)).toEqual({count:6,dose:'250 mcg'});
 expect(vialDoseEstimate(vial,[{ peptide:'A', dosage:2, unit:'iu', date:now }],now)).toBeNull();
 expect(vialDoseEstimate({...vial,remaining_mg:0},[{ peptide:'A', dosage:250, unit:'mcg', date:now }],now).count).toBe(0);
});
it('validates stock corrections and strips unrelated protocol fields', () => {
 for (const value of ['',-1,6,NaN,Infinity]) expect(() => validateStock(value,5)).toThrow();
 expect(validateStock('0',5)).toBe(0);
 expect(presetFromForm(' Morning ',{ peptide:'A',dosage:'2',unit:'iu',notes:'private',site:'Arm',date:'old' })).toEqual({name:'Morning',peptide:'A',dosage:2,unit:'iu'});
 expect(() => presetFromForm('A',{peptide:'A',dosage:-1,unit:'mg'})).toThrow();
});
it('keeps progress substances and units separate and excludes future dates', () => {
 const rows=[{peptide:'A',unit:'mg',dosage:1,date:'2026-11-11'},{peptide:'A',unit:'mcg',dosage:500,date:'2026-11-11'},{peptide:'B',unit:'mg',dosage:2,date:'2026-11-11'},{peptide:'A',unit:'mg',dosage:3,date:'2026-11-13'}];
 expect(progressSeries(rows,'A','mg',30,now).map(r=>r.dosage)).toEqual([1]);
});
it('selects the next reminder without listing past offsets or legacy schedules as ready', () => {
 expect(nextPlannedReminder([{date:'2026-11-12T13:00:00Z',peptide:'A'}],now).at.toISOString()).toBe('2026-11-12T12:30:00.000Z');
 expect(nextPlannedReminder([{date:'2026-11-12T12:10:00Z',peptide:'A'}],now).minutes).toBe(0);
 expect(nextPlannedReminder([{date:'2026-11-12T13:00:00Z',completed:true},{date:'2026-11-12T14:00:00Z',backgroundReminderReady:false}],now)).toBeNull();
});
it('never reports enabled from permission alone', () => {
 const base={supported:true,permission:'granted',enabled:true,configured:true,subscription:true};
 expect(reminderLabel(base)).toBe('Enabled on this device');
 expect(reminderLabel({...base,subscription:false})).toBe('This device needs reconnecting');
 expect(reminderLabel({...base,permission:'denied'})).toBe('Blocked in device settings');
 expect(reminderLabel({...base,enabled:false})).toBe('Off');
});
