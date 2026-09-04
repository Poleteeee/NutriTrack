import { calculateTargets } from './calculator.js';

const STORAGE_KEYS = {
    PROFILE: 'nutritrack_profile',
    TARGETS: 'nutritrack_targets',
    FREQUENT_FOODS: 'nutritrack_frequent_foods'
};

export const saveProfile = (profile, targets) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
};

export const getProfile = () => {
    const profile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return profile ? JSON.parse(profile) : null;
};

export const getTargets = () => {
    const targets = localStorage.getItem(STORAGE_KEYS.TARGETS);
    return targets ? JSON.parse(targets) : null;
};

// Función para obtener la clave del día actual (YYYY-MM-DD)
const getTodayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `nutritrack_day_${year}-${month}-${day}`;
};

export const getTodayData = () => {
    const key = getTodayKey();
    const data = localStorage.getItem(key);
    
    if (data) {
        return JSON.parse(data);
    } else {
        // Estructura inicial para un día nuevo
        const initialData = {
            current: { kcal: 0, protein: 0, carbs: 0, fats: 0, water: 0 },
            foods: []
        };
        localStorage.setItem(key, JSON.stringify(initialData));
        return initialData;
    }
};

export const saveTodayData = (data) => {
    const key = getTodayKey();
    localStorage.setItem(key, JSON.stringify(data));
};

// --- GESTIÓN DE ALIMENTOS FRECUENTES (AUTOCOMPLETADO) ---
export const saveFrequentFood = (foodItem) => {
    let foods = JSON.parse(localStorage.getItem(STORAGE_KEYS.FREQUENT_FOODS)) || [];
    const exists = foods.some(f => f.name.toLowerCase() === foodItem.name.toLowerCase());
    
    if (!exists) {
        foods.push({ 
            name: foodItem.name, 
            protein: foodItem.protein, 
            carbs: foodItem.carbs, 
            fats: foodItem.fats 
        });
        localStorage.setItem(STORAGE_KEYS.FREQUENT_FOODS, JSON.stringify(foods));
    }
};

export const getFrequentFoods = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FREQUENT_FOODS)) || [];
};