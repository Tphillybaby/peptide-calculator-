export function localDateString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function scheduledInstant(date, time) {
    const day = new Date(date);
    if (!Number.isFinite(day.getTime()) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        throw new Error('Choose a valid schedule date and time.');
    }
    return new Date(`${localDateString(day)}T${time}:00`).toISOString();
}
