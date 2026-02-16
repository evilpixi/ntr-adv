/**
 * Minimal i18n for legacy JS (game.js, dataLibrary.js, welcome.js).
 * Reads language from localStorage key ntr-adv-settings (same as React app).
 */

const STORAGE_KEY = 'ntr-adv-settings';

export function getLang() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'es';
    const parsed = JSON.parse(raw);
    return parsed.language === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`));
}

const translations = {
  es: {
    welcome: {
      title: 'NTR Adventure',
      subtitle: 'Selecciona una aplicación para comenzar',
      errorLaunch: 'Error al iniciar la aplicación: {message}',
    },
    dataLibrary: {
      title: 'Biblioteca de Datos',
      backToStart: 'Volver al Inicio',
      tab_kingdoms: 'Reinos',
      tab_generals: 'Generales',
      tab_provinces: 'Provincias',
      noKingdoms: 'No hay reinos disponibles.',
      noGenerals: 'No hay generales disponibles.',
      noProvinces: 'No hay provincias disponibles.',
      generalsLabel: 'Generales:',
      provincesLabel: 'Provincias:',
      architecture: 'Arquitectura',
      biome: 'Bioma',
      governmentType: 'Tipo de Gobierno',
      society: 'Sociedad',
      personality: 'Personalidad',
      physicalAppearance: 'Apariencia Física',
      additionalInfo: 'Información Adicional',
      age: 'Edad:',
      specialty: 'Especialidad:',
      favoriteWeapon: 'Arma Favorita:',
      background: 'Antecedentes:',
      love: 'Amor:',
      strength: 'Fuerza:',
      capital: 'Capital',
      imagePrompt: 'Prompt de Imagen',
      hp: 'HP:',
    },
    classic: {
      generatingBtn: 'Generando...',
      loadingGenerateStory: 'Generando historia inicial...',
      loadingProcessingTurn: 'Procesando turno...',
      loadingGeneratingStory: 'Generando historia...',
      loadingText: 'Cargando...',
      kingdomAwakens: 'El reino despierta. La aventura comienza...',
      errorGeneratingStory: 'Error al generar la historia. Revisa tu configuración de IA.',
      errorProcessingTurn: 'Error al procesar el turno: {message}',
      dayTitle: '=== Día {day} ===',
      technicalSummary: '--- Resumen técnico ---',
      noActionsAssigned: 'No hay acciones asignadas. Selecciona una general para asignar una acción.',
      assignActionTitle: 'Asignar acción - {name}',
      actionTypeLabel: 'Tipo de acción:',
      selectAction: 'Selecciona una acción',
      actionType_attack: 'Atacar provincia',
      actionType_defend: 'Defender provincia',
      actionType_restCapital: 'Descansar (Capital)',
      actionType_dateCapital: 'Cita (Capital)',
      actionType_trainCapital: 'Entrenar (Capital)',
      targetProvince: 'Provincia objetivo:',
      assignBtn: 'Asignar',
      cancel: 'Cancelar',
      remove: 'Quitar',
      capital: 'Capital',
      action_attack: 'Atacar',
      action_defend: 'Defender',
      action_rest: 'Descansar',
      action_date: 'Cita',
      action_train: 'Entrenar',
      generalNotAvailable: 'Esta general no está disponible.',
      selectProvince: 'Selecciona una provincia',
      gameSaved: 'Partida guardada',
      gameLoaded: 'Partida cargada',
      errorLoadingGame: 'Error al cargar la partida',
      noSavedGame: 'No se encontró partida guardada',
      gameEnded: 'La partida ha terminado.',
      victory: '¡Victoria! Has conquistado todos los reinos.',
      defeat: 'Derrota. Tu reino ha caído.',
      noDescription: 'No hay descripción disponible.',
      noInfoAvailable: 'No hay información disponible.',
      ally: 'Aliado',
      enemy: 'Enemigo',
      free: 'Libre',
      captured: 'Capturada',
      slave: 'Esclava',
      statistics: 'Estadísticas',
      generalsLabel: 'Generales:',
      available: 'disponibles',
      provincesCount: 'Provincias',
      assignActionBtn: 'Asignar acción',
      location: 'Ubicación:',
      kingdom: 'Reino:',
      personality: 'Personalidad',
      physicalAppearance: 'Apariencia física',
      additionalInformation: 'Información adicional',
      presentGenerals: 'Generales presentes:',
      own: 'Propia',
      quickAssignAttack: 'Asignar ataque rápido',
      quickAssignDefense: 'Asignar defensa rápida',
      attackProvince: 'Atacar {name}',
      defendProvince: 'Defender {name}',
    },
  },
  en: {
    welcome: {
      title: 'NTR Adventure',
      subtitle: 'Choose an application to start',
      errorLaunch: 'Error launching application: {message}',
    },
    dataLibrary: {
      title: 'Data Library',
      backToStart: 'Back to start',
      tab_kingdoms: 'Kingdoms',
      tab_generals: 'Generals',
      tab_provinces: 'Provinces',
      noKingdoms: 'No kingdoms available.',
      noGenerals: 'No generals available.',
      noProvinces: 'No provinces available.',
      generalsLabel: 'Generals:',
      provincesLabel: 'Provinces:',
      architecture: 'Architecture',
      biome: 'Biome',
      governmentType: 'Government Type',
      society: 'Society',
      personality: 'Personality',
      physicalAppearance: 'Physical Appearance',
      additionalInfo: 'Additional Info',
      age: 'Age:',
      specialty: 'Specialty:',
      favoriteWeapon: 'Favorite Weapon:',
      background: 'Background:',
      love: 'Love:',
      strength: 'Strength:',
      capital: 'Capital',
      imagePrompt: 'Image Prompt',
      hp: 'HP:',
    },
    classic: {
      generatingBtn: 'Generating...',
      loadingGenerateStory: 'Generating initial story...',
      loadingProcessingTurn: 'Processing turn...',
      loadingGeneratingStory: 'Generating story...',
      loadingText: 'Loading...',
      kingdomAwakens: 'The kingdom awakens. The adventure begins...',
      errorGeneratingStory: 'Error generating story. Check your AI configuration.',
      errorProcessingTurn: 'Error processing turn: {message}',
      dayTitle: '=== Day {day} ===',
      technicalSummary: '--- Technical Summary ---',
      noActionsAssigned: 'No actions assigned. Select a general to assign an action.',
      assignActionTitle: 'Assign Action - {name}',
      actionTypeLabel: 'Action Type:',
      selectAction: 'Select an action',
      actionType_attack: 'Attack Province',
      actionType_defend: 'Defend Province',
      actionType_restCapital: 'Rest (Capital)',
      actionType_dateCapital: 'Date (Capital)',
      actionType_trainCapital: 'Train (Capital)',
      targetProvince: 'Target Province:',
      assignBtn: 'Assign',
      cancel: 'Cancel',
      remove: 'Remove',
      capital: 'Capital',
      action_attack: 'Attack',
      action_defend: 'Defend',
      action_rest: 'Rest',
      action_date: 'Date',
      action_train: 'Train',
      generalNotAvailable: 'This general is not available',
      selectProvince: 'Select a province',
      gameSaved: 'Game saved',
      gameLoaded: 'Game loaded',
      errorLoadingGame: 'Error loading saved game',
      noSavedGame: 'No saved game found',
      gameEnded: 'The game has ended.',
      victory: 'Victory! You have conquered all kingdoms.',
      defeat: 'Defeat. Your kingdom has fallen.',
      noDescription: 'No description available.',
      noInfoAvailable: 'No information available.',
      ally: 'Ally',
      enemy: 'Enemy',
      free: 'Free',
      captured: 'Captured',
      slave: 'Slave',
      statistics: 'Statistics',
      generalsLabel: 'Generals:',
      available: 'available',
      provincesCount: 'Provinces',
      assignActionBtn: 'Assign Action',
      location: 'Location:',
      kingdom: 'Kingdom:',
      personality: 'Personality',
      physicalAppearance: 'Physical Appearance',
      additionalInformation: 'Additional Information',
      presentGenerals: 'Present Generals:',
      own: 'Own',
      quickAssignAttack: 'Quick Assign Attack',
      quickAssignDefense: 'Quick Assign Defense',
      attackProvince: 'Attack {name}',
      defendProvince: 'Defend {name}',
    },
  },
};

/**
 * Flatten nested keys for t() so we can call t('classic.action.attack') or t('welcome.errorLaunch', { message }).
 */
function getNested(obj, key) {
  const parts = key.split('.');
  let v = obj;
  for (const p of parts) {
    v = v?.[p];
  }
  return typeof v === 'string' ? v : undefined;
}

/**
 * @param {string} key - Dot path e.g. 'classic.loadingText' or 'classic.action.attack'
 * @param {Record<string, string|number>} [vars] - Optional interpolation e.g. { name: 'X', day: 1 }
 * @returns {string}
 */
export function t(key, vars = null) {
  const lang = getLang();
  const langMap = translations[lang] ?? translations.es;
  const fallback = translations.en;
  let str = getNested(langMap, key) ?? getNested(fallback, key) ?? key;
  return interpolate(str, vars || {});
}
