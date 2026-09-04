export const updateDashboardRings = (current, targets) => {
    // Función de ayuda para calcular y aplicar la animación SVG
    const animateRing = (elementId, currentValue, targetValue, circumference) => {
        const ring = document.getElementById(elementId);
        if (!ring) return;
        
        // Evitar división por cero
        const safeTarget = targetValue > 0 ? targetValue : 1; 
        let percent = currentValue / safeTarget;
        
        // Tope visual al 100% para que la línea no dé la vuelta completa y se rompa
        if (percent > 1) percent = 1; 

        // Calculamos el espacio vacío (offset)
        const offset = circumference - (percent * circumference);
        ring.style.strokeDashoffset = offset;
    };

    // 1. Actualizar los Textos Numéricos en la UI
    // Calorías
    document.getElementById('cal-current').innerText = current.kcal || 0;
    document.getElementById('cal-target').innerText = targets.kcal || 0;
    
    // Proteínas
    document.getElementById('pro-current').innerText = current.protein || 0;
    document.getElementById('pro-target').innerText = targets.protein || 0;
    
    // Carbohidratos
    document.getElementById('car-current').innerText = current.carbs || 0;
    document.getElementById('car-target').innerText = targets.carbs || 0;
    
    // Grasas
    document.getElementById('fat-current').innerText = current.fats || 0;
    document.getElementById('fat-target').innerText = targets.fats || 0;
    
    // Agua (Mostramos solo la cantidad actual y opcionalmente calculamos sobre el objetivo)
    document.getElementById('wat-current').innerText = current.water || 0;

    // 2. Animar los SVG
    // Anillo principal (Calorías): r=80, circunferencia = 2 * PI * 80 ≈ 502
    animateRing('ring-calories', current.kcal || 0, targets.kcal, 502);

    // Anillos secundarios (Macros y agua): r=32, circunferencia = 2 * PI * 32 ≈ 201
    animateRing('ring-protein', current.protein || 0, targets.protein, 201);
    animateRing('ring-carbs', current.carbs || 0, targets.carbs, 201);
    animateRing('ring-fats', current.fats || 0, targets.fats, 201);
    
    // El objetivo de agua se calculó en calculator.js (35ml x kg de peso)
    animateRing('ring-water', current.water || 0, targets.water || 2500, 201);
};
export const renderFoodList = (foods) => {
    const list = document.getElementById('food-list');
    list.innerHTML = ''; 
    
    if (!foods || foods.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#888; margin-top: 20px;">Aún no has añadido comidas hoy.</p>';
        return;
    }

    // Invertimos el array para que la última comida aparezca arriba
    const reversedFoods = [...foods].reverse();

    reversedFoods.forEach((food, reversedIndex) => {
        // Necesitamos el índice original para poder borrarlo correctamente del array
        const originalIndex = foods.length - 1 - reversedIndex; 

        const card = document.createElement('div');
        card.className = 'food-card glass-container';
        
        card.innerHTML = `
            <div class="food-details">
                <div class="food-time">${food.time}</div>
                <h3>${food.name}</h3>
                <div class="food-macros">
                    ${food.protein}g P • ${food.carbs}g C • ${food.fats}g G
                </div>
            </div>
            <div class="food-right">
                <div class="food-kcal">${food.kcal} <small>kcal</small></div>
                <button class="btn-icon btn-delete" data-index="${originalIndex}">Eliminar</button>
            </div>
        `;
        list.appendChild(card);
    });
};

    