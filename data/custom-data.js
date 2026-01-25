// Datos Personalizados del Juego
// Este archivo es OPCIONAL - si existe, sus datos se fusionan con los predeterminados
// Los datos aquí sobrescriben los datos predeterminados con el mismo ID

// Ejemplo de uso:
// export const customKingdoms = [
//     {
//         id: 'kingdom1',
//         name: 'Mi Reino Personalizado',
//         theme: 'fuego',
//         description: 'Mi descripción personalizada',
//         color: '#ff0000',
//         owner: 'ai',
//         provinces: 3,
//         imageUrl: null
//     }
// ];

// Reinos personalizados (opcional)
export const customKingdoms = [];

// Generales personalizadas (opcional)
export const customGenerals = [];

// Provincias personalizadas (opcional)
// Formato: { kingdomId: [{ name: '...', imageUrl: null }, ...] }
export const customProvinces = {};

// Reglas del juego personalizadas (opcional)
// Solo incluye las propiedades que quieres sobrescribir
export const customGameRules = {};

// Configuración de IA personalizada (opcional)
// Solo incluye las propiedades que quieres sobrescribir
export const customAIConfig = {};
