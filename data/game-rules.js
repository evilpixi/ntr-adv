// Configuración del juego - Reglas y Balance
// Ajusta estos valores para modificar el balance del juego

export const gameRules = {
    // HP máximo de las provincias
    provinceMaxHp: 3,
    
    // Recuperación de HP al descansar en la capital
    hpRecoveryOnRest: 20,
    
    // Aumento de amor al tener una cita
    loveIncreaseOnDate: 10,
    
    // Aumento de fuerza al entrenar
    strengthIncreaseOnTrain: 2,
    
    // Reducción de amor por turno durante esclavización
    loveDecreaseOnEnslavement: 10,
    
    // Daño base en combate
    combatDamageBase: 5,
    
    // Rango aleatorio adicional de daño en combate
    combatDamageRandom: 10
};
