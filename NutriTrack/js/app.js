import { saveProfile, getProfile, getTargets, getTodayData, saveTodayData, saveFrequentFood, getFrequentFoods } from './storage.js';
import { calculateTargets, calculateFoodKcal } from './calculator.js';
import { updateDashboardRings, renderFoodList } from './ui.js';

// 1. Registro del Service Worker (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registrado:', reg.scope))
            .catch(err => console.error('Error al registrar Service Worker:', err));
    });
}

// 2. Lógica principal de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    const profile = getProfile();
    
    const dashboardScreen = document.getElementById('dashboard');
    const settingsScreen = document.getElementById('settings-screen');
    const historyScreen = document.getElementById('history-screen');

    // --- INICIALIZACIÓN ---
    if (!profile) {
        document.getElementById('setup-screen').classList.remove('hidden');
        dashboardScreen.classList.add('hidden');
    } else {
        initDashboard();
    }

    // --- CONFIGURACIÓN INICIAL (SETUP) ---
    document.getElementById('setup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newProfile = {
            gender: document.getElementById('gender').value,
            age: parseInt(document.getElementById('age').value),
            weight: parseFloat(document.getElementById('weight').value),
            height: parseFloat(document.getElementById('height').value),
            activity: document.getElementById('activity').value,
            goal: document.getElementById('goal').value
        };
        const targets = calculateTargets(newProfile);
        saveProfile(newProfile, targets);
        
        document.getElementById('setup-screen').classList.add('hidden');
        initDashboard();
    });

    // --- MODAL: CÁLCULO DINÁMICO DE KCAL ---
    const updatePreviewKcal = () => {
        const p = parseFloat(document.getElementById('food-p').value) || 0;
        const c = parseFloat(document.getElementById('food-c').value) || 0;
        const f = parseFloat(document.getElementById('food-g').value) || 0;
        document.getElementById('food-kcal-preview').innerText = calculateFoodKcal(p, c, f);
    };

    ['food-p', 'food-c', 'food-g'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePreviewKcal);
    });

    // --- AUTOCOMPLETADO INTELIGENTE AL ESCRIBIR O SELECCIONAR ---
    const foodNameInput = document.getElementById('food-name');
    foodNameInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const frequentFoods = getFrequentFoods();
        const matchedFood = frequentFoods.find(f => f.name.toLowerCase() === query);

        if (matchedFood) {
            document.getElementById('food-p').value = matchedFood.protein;
            document.getElementById('food-c').value = matchedFood.carbs;
            document.getElementById('food-g').value = matchedFood.fats;
            updatePreviewKcal();
        }
    });

    // --- MODAL: ABRIR / CERRAR ---
    document.getElementById('fab-add').addEventListener('click', () => {
        renderFoodSuggestions();
        document.getElementById('modal-add-food').classList.remove('hidden');
    });
    
    document.getElementById('btn-cancel').addEventListener('click', () => {
        document.getElementById('modal-add-food').classList.add('hidden');
    });

    // --- GUARDAR NUEVA COMIDA ---
    document.getElementById('food-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('food-name').value;
        const p = parseFloat(document.getElementById('food-p').value) || 0;
        const c = parseFloat(document.getElementById('food-c').value) || 0;
        const f = parseFloat(document.getElementById('food-g').value) || 0;
        const kcal = calculateFoodKcal(p, c, f);
        
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const foodItem = { name, protein: p, carbs: c, fats: f, kcal, time };
        
        // Guardar en frecuentes para autocompletado futuro
        saveFrequentFood(foodItem);

        const todayData = getTodayData();
        if (!todayData.current) {
            todayData.current = { kcal: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
        }
        
        todayData.foods.push(foodItem);
        todayData.current.kcal += kcal;
        todayData.current.protein += p;
        todayData.current.carbs += c;
        todayData.current.fats += f;
        
        saveTodayData(todayData);
        initDashboard();
        
        document.getElementById('modal-add-food').classList.add('hidden');
        document.getElementById('food-form').reset();
        document.getElementById('food-kcal-preview').innerText = '0';
    });

    // --- ELIMINAR COMIDA ---
    document.getElementById('food-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const index = e.target.getAttribute('data-index');
            const todayData = getTodayData();
            const food = todayData.foods[index];
            
            todayData.current.kcal -= food.kcal;
            todayData.current.protein -= food.protein;
            todayData.current.carbs -= food.carbs;
            todayData.current.fats -= food.fats;
            
            todayData.current.kcal = Math.max(0, todayData.current.kcal);
            todayData.current.protein = Math.max(0, todayData.current.protein);
            todayData.current.carbs = Math.max(0, todayData.current.carbs);
            todayData.current.fats = Math.max(0, todayData.current.fats);
            
            todayData.foods.splice(index, 1);
            
            saveTodayData(todayData);
            initDashboard();
        }
    });

    // --- AÑADIR / RESTAR AGUA ---
document.querySelectorAll('.btn-water').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const amount = parseInt(e.target.getAttribute('data-amount'));
        const todayData = getTodayData();
        
        if (!todayData.current) {
            todayData.current = { kcal: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
        }
        if (typeof todayData.current.water === 'undefined') {
            todayData.current.water = 0;
        }
        
        todayData.current.water += amount;
        // Evitamos que el agua sea menor a 0
        todayData.current.water = Math.max(0, todayData.current.water);
        
        saveTodayData(todayData);
        initDashboard();
    });
});

    // --- NAVEGACIÓN Y GESTIÓN DE AJUSTES ---
    document.getElementById('btn-open-settings').addEventListener('click', () => {
        const profile = getProfile();
        if (profile) {
            document.getElementById('settings-gender').value = profile.gender;
            document.getElementById('settings-age').value = profile.age;
            document.getElementById('settings-weight').value = profile.weight;
            document.getElementById('settings-height').value = profile.height;
            document.getElementById('settings-activity').value = profile.activity;
            document.getElementById('settings-goal').value = profile.goal;
        }
        dashboardScreen.classList.add('hidden');
        settingsScreen.classList.remove('hidden');
    });

    document.getElementById('btn-close-settings').addEventListener('click', () => {
        settingsScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
    });

    document.getElementById('settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedProfile = {
            gender: document.getElementById('settings-gender').value,
            age: parseInt(document.getElementById('settings-age').value),
            weight: parseFloat(document.getElementById('settings-weight').value),
            height: parseFloat(document.getElementById('settings-height').value),
            activity: document.getElementById('settings-activity').value,
            goal: document.getElementById('settings-goal').value
        };
        const targets = calculateTargets(updatedProfile);
        saveProfile(updatedProfile, targets);
        
        settingsScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        initDashboard();
    });

    // --- NAVEGACIÓN Y GESTIÓN DE HISTORIAL ---
    document.getElementById('btn-open-history').addEventListener('click', () => {
        renderHistory();
        dashboardScreen.classList.add('hidden');
        historyScreen.classList.remove('hidden');
    });

    document.getElementById('btn-close-history').addEventListener('click', () => {
        historyScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
    });

    function renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        const keys = Object.keys(localStorage).filter(key => key.startsWith('nutritrack_day_'));
        
        if (keys.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; color:#888;">No hay días registrados todavía.</p>';
            return;
        }

        keys.sort().reverse();

        keys.forEach(key => {
            const dateStr = key.replace('nutritrack_day_', '');
            const dayData = JSON.parse(localStorage.getItem(key));
            const current = dayData.current || { kcal: 0, protein: 0, carbs: 0, fats: 0, water: 0 };

            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-date">${dateStr}</div>
                <div class="history-macros">
                    🔥 <b>${Math.round(current.kcal)}</b> kcal | 
                    🥩 ${Math.round(current.protein)}g P | 
                    🍞 ${Math.round(current.carbs)}g C | 
                    🥑 ${Math.round(current.fats)}g G | 
                    💧 ${current.water || 0}ml
                </div>
            `;
            historyList.appendChild(item);
        });
    }

}); // <-- FIN DEL DOMContentLoaded

// --- FUNCIONES GLOBALES ---
function initDashboard() {
    document.getElementById('dashboard').classList.remove('hidden');
    const targets = getTargets();
    const todayData = getTodayData();
    
    updateDashboardRings(todayData.current, targets);
    renderFoodList(todayData.foods);
    renderFoodSuggestions();
}

function renderFoodSuggestions() {
    const datalist = document.getElementById('food-suggestions');
    if (!datalist) return;
    datalist.innerHTML = '';
    
    const frequentFoods = getFrequentFoods();
    frequentFoods.forEach(food => {
        const option = document.createElement('option');
        option.value = food.name;
        datalist.appendChild(option);
    });
}const statsScreen = document.getElementById('stats-screen');
    let myChart = null;

    document.getElementById('btn-open-stats').addEventListener('click', () => {
        renderStatsChart();
        dashboardScreen.classList.add('hidden');
        statsScreen.classList.remove('hidden');
    });

    document.getElementById('btn-close-stats').addEventListener('click', () => {
        statsScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
    });

    function renderStatsChart() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('nutritrack_day_')).sort();
        const labels = [];
        const dataValues = [];

        keys.forEach(key => {
            const dateStr = key.replace('nutritrack_day_', '');
            const dayData = JSON.parse(localStorage.getItem(key));
            labels.push(dateStr.slice(5)); // Muestra mes-día (MM-DD)
            dataValues.push(dayData.current ? Math.round(dayData.current.kcal) : 0);
        });

        const ctx = document.getElementById('caloriesChart').getContext('2d');
        
        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calorías Consumidas',
                    data: dataValues,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: 'white' } }
                },
                scales: {
                    x: { ticks: { color: 'white' } },
                    y: { ticks: { color: 'white' } }
                }
            }
        });
    }