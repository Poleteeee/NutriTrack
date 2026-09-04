export const calculateTargets = (profile) => {
    // Fórmula Mifflin-St Jeor
    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
    bmr += profile.gender === 'M' ? 5 : -161;
    
    const tdee = bmr * parseFloat(profile.activity);
    const targetKcal = Math.round(tdee + parseInt(profile.goal));

    // Distribución básica de Macros (ejemplo: 30% P, 35% C, 35% G)
    // 1g Proteína = 4kcal, 1g Carbo = 4kcal, 1g Grasa = 9kcal
    const targetProtein = Math.round((targetKcal * 0.30) / 4);
    const targetCarbs = Math.round((targetKcal * 0.35) / 4);
    const targetFats = Math.round((targetKcal * 0.35) / 9);

    return { 
        kcal: targetKcal, 
        protein: targetProtein, 
        carbs: targetCarbs, 
        fats: targetFats,
        water: profile.weight * 35 // 35ml por kg de peso
    };
};

export const calculateFoodKcal = (p, c, f) => {
    return (p * 4) + (c * 4) + (f * 9);
};