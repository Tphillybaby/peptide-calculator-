export const recentDoses = (items = [], now = new Date()) => items
    .filter(item => item.peptide && Number(item.dosage) > 0 && Number.isFinite(new Date(item.date).getTime()) && new Date(item.date) <= now)
    .slice().sort((a, b) => new Date(b.date) - new Date(a.date));

export const upcomingDoses = (items = [], now = new Date()) => {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 7);
    return items.filter(item => !item.completed && new Date(item.date) >= start && new Date(item.date) < end)
        .slice().sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const lowStockVials = (items = []) => items.filter(item =>
    Number(item.quantity_mg) > 0 && Number.isFinite(Number(item.remaining_mg)) && item.remaining_mg != null &&
    Number(item.remaining_mg) >= 0 && Number(item.remaining_mg) / Number(item.quantity_mg) <= 0.2);

export const repeatDoseDraft = (item, date) => ({
    peptide: item.peptide, dosage: String(item.dosage), unit: item.unit || 'mg',
    site: '', notes: '', date
});
