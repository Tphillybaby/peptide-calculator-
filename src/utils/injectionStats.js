// Keep substances and units separate. Unknown half-lives never get a guessed value.
export function getInjectionStats(injections, peptides, now = Date.now()) {
    const valid = injections.filter(i => Number.isFinite(new Date(i.date).getTime()) && new Date(i.date).getTime() <= now);
    if (!valid.length) return null;
    const levels = new Map();
    const weeklyTotals = new Map();
    for (const injection of valid) {
        const dose = Number(injection.dosage);
        if (!Number.isFinite(dose) || dose <= 0) continue;
        const unit = injection.unit === 'mcg' ? 'mg' : injection.unit;
        const amount = injection.unit === 'mcg' ? dose / 1000 : dose;
        if (!['mg', 'IU'].includes(unit)) continue;
        const name = injection.peptide;
        const key = `${name}:${unit}`;
        if (now - new Date(injection.date).getTime() <= 7 * 86400000) {
            const total = weeklyTotals.get(key) || { peptide: name, unit, amount: 0 };
            total.amount += amount;
            weeklyTotals.set(key, total);
        }
        const peptide = peptides.find(p => p.name.toLowerCase() === name?.toLowerCase());
        const halfLife = Number(peptide?.half_life_hours);
        const level = levels.get(key) || { peptide: name, unit, amount: 0, available: halfLife > 0 && Number.isFinite(halfLife) };
        if (level.available) {
            const hours = (now - new Date(injection.date).getTime()) / 3600000;
            level.amount += amount * Math.pow(0.5, hours / halfLife);
        }
        levels.set(key, level);
    }
    return {
        totalInjections: injections.length,
        lastInjection: [...valid].sort((a, b) => new Date(b.date) - new Date(a.date))[0],
        activeLevels: [...levels.values()],
        weeklyTotals: [...weeklyTotals.values()],
        weeklyCount: valid.filter(i => now - new Date(i.date).getTime() <= 7 * 86400000).length
    };
}
