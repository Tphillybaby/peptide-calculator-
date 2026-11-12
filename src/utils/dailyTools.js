import { recentDoses } from './dailyDashboard';

export const doseMassMg = dose => {
    const value = Number(dose?.dosage);
    if (!Number.isFinite(value) || value <= 0) return null;
    return dose.unit === 'mg' ? value : dose.unit === 'mcg' ? value / 1000 : null;
};
export const vialDoseEstimate = (vial, injections, now = new Date()) => {
    const last = recentDoses(injections, now).find(i => i.peptide.trim().toLowerCase() === vial.peptide_name.trim().toLowerCase());
    const mass = doseMassMg(last);
    if (!mass || vial.remaining_mg == null || !Number.isFinite(Number(vial.remaining_mg))) return null;
    return { count: Math.floor(Math.max(0, Number(vial.remaining_mg)) / mass + 1e-9), dose: `${last.dosage} ${last.unit}` };
};
export const validateStock = (remaining, quantity) => {
    const value = Number(remaining), total = Number(quantity);
    if (remaining === '' || !Number.isFinite(value) || !Number.isFinite(total) || total <= 0 || value < 0 || value > total) throw new Error('Remaining stock must be between 0 and the vial quantity.');
    return value;
};
export const presetFromForm = (name, form) => {
    const dosage = Number(form.dosage);
    if (!name?.trim() || name.trim().length > 80 || !form.peptide?.trim() || form.peptide.trim().length > 200 || !Number.isFinite(dosage) || dosage <= 0 || dosage >= 1000000000 || !['mg','mcg','iu'].includes(form.unit)) throw new Error('Enter a protocol name, peptide, positive dose, and supported unit.');
    return { name: name.trim(), peptide: form.peptide.trim(), dosage, unit: form.unit };
};
export const progressSeries = (injections, peptide, unit, days = 30, now = new Date()) => {
    const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1);
    return recentDoses(injections, now).filter(i => i.peptide === peptide && i.unit === unit && new Date(i.date) >= start).reverse();
};
