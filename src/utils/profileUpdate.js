export function profileUpdate(userId, profile) {
    const age = profile.age === '' ? null : Number(profile.age);
    if (age !== null && (!Number.isInteger(age) || age < 1 || age > 120)) {
        throw new Error('Age must be a whole number between 1 and 120.');
    }
    return {
        id: userId, full_name: profile.full_name, age,
        gender: profile.gender, weight_goal: profile.weight_goal,
        updated_at: new Date().toISOString()
    };
}
