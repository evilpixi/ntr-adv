import type { NarratedStoryData, Personaje, PlayerProfile, HeroCard } from './types'

export const mainCharacter: Personaje = {
  id: 'pc',
  name: 'El Viajero',
  role: 'player',
  hp: 100,
  fuerza: 12,
  agilidad: 14,
  inteligencia: 16,
  carisma: 14,
  description: 'El protagonista de esta historia. Un aventurero que recorre el reino en busca de gloria, aliados y respuestas. Su pasado está envuelto en misterio, pero su determinación es clara.',
  class: 'Aventurero',
  race: 'Humano',
  currentPlaceId: 'castillo-rey',
  currentActivity: 'En la corte',
  currentState: 'Despierto',
  corruption: 0,
  sexCount: 0,
  developedKinks: [],
}

export interface PlayerProfileLabels {
  getGoverningStyleLabel: (style: PlayerProfile['governingStyle']) => string
  getGenderLabel: (key: PlayerProfile['gender']) => string
  getGenitaliaLabel: (key: PlayerProfile['genitalia']) => string
  getNobleTitleLabel: (title: PlayerProfile['nobleTitle'], gender: PlayerProfile['gender']) => string
  getPenisSizeLabel: (key: NonNullable<PlayerProfile['penisSize']>) => string
  getBustSizeLabel: (key: NonNullable<PlayerProfile['bustSize']>) => string
}

const DEFAULT_NAME_BY_GENDER: Record<PlayerProfile['gender'], string> = {
  female: 'Aelia',
  male: 'Auro',
  nonbinary: 'Aether',
}

/** Descripción física por defecto según nombre del jugador. */
const DEFAULT_APPEARANCE_BY_NAME: Record<string, string> = {
  aelia:
    'Cabello morado largo, piel blanca y ojos dorados. Viste un vestido morado de gran clase que denota su linaje.',
  auro:
    'Cabello morado corto, piel blanca y ojos dorados. Lleva armadura morada y capa, de aspecto noble y marcial.',
  aether:
    'Cabello morado semi largo, piel blanca y ojos dorados. Viste una túnica andrógina morada de gran elegancia.',
}

/** Builds the player character (noble) from the launcher profile. */
export function buildPlayerFromProfile(
  profile: PlayerProfile,
  labels: PlayerProfileLabels
): Personaje {
  const name = profile.name.trim() || DEFAULT_NAME_BY_GENDER[profile.gender]
  const generalId = name.toLowerCase()
  const description =
    profile.appearanceDescription.trim() ||
    DEFAULT_APPEARANCE_BY_NAME[generalId] ||
    'Un noble del reino. Su presencia denota autoridad y linaje.'
  const pc: Personaje = {
    id: 'pc',
    name,
    role: 'player',
    generalId,
    hp: 100,
    fuerza: 12,
    agilidad: 14,
    inteligencia: 16,
    carisma: 14,
    description,
    class: labels.getGoverningStyleLabel(profile.governingStyle),
    race: 'Humano',
    gender: labels.getGenderLabel(profile.gender),
    genitalia: labels.getGenitaliaLabel(profile.genitalia),
    nobleTitle: labels.getNobleTitleLabel(profile.nobleTitle, profile.gender),
  }
  if (profile.genitalia === 'penis') {
    const raw = profile.penisSize
    const inches = typeof raw === 'number' && raw >= 1 && raw <= 7 ? raw : 4
    pc.penisSize = labels.getPenisSizeLabel(inches)
  }
  if (profile.gender === 'female' || profile.gender === 'nonbinary') {
    const raw = profile.bustSize
    const cup = typeof raw === 'string' && ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(raw) ? raw : 'C'
    pc.bustSize = labels.getBustSizeLabel(cup as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G')
  }
  pc.currentPlaceId = 'castillo-rey'
  pc.currentActivity = 'En la corte'
  pc.currentState = 'Despierto'
  pc.corruption = 0
  pc.sexCount = 0
  pc.developedKinks = []
  return pc
}

/**
 * Heroínas por defecto. Fuente única de verdad: id, name, generalId y datos se usan
 * para la lista de personajes y para generar las cartas de héroe (buildHeroCardFromHeroine).
 */
export const heroines: Personaje[] = [
  {
    id: 'aria',
    name: 'Aria',
    role: 'hero',
    generalId: 'aria',
    hp: 100,
    fuerza: 10,
    agilidad: 12,
    inteligencia: 18,
    carisma: 17,
    description: 'General real y estratega del reino. Alta y elegante, pelo rubio dorado en moño militar, ojos azules. Líder nata, mente analítica y calmada bajo presión. Valora el honor y la justicia.',
    class: 'Estratega',
    race: 'Humana',
    relationship: 'General real, estratega del reino',
    physicalDescription: 'Alta y elegante, pelo rubio dorado en moño militar, ojos azules. Armadura real con emblema del reino.',
    personality: 'Líder nata, mente analítica, calmada bajo presión. Valora el honor y la justicia.',
    abilities: ['Estrategia de campo abierto', 'Espada real a dos manos', 'Táctica y liderazgo'],
    currentPlaceId: 'castillo-rey',
    currentActivity: 'Revisando mapas en el salón de guerra',
    currentState: 'Concentrada',
    corruption: 0,
    loveRegent: 100,
    lust: 0,
    sexCount: 0,
    developedKinks: [],
    feelingsToward: { pc: 'love' },
  },
  {
    id: 'zara',
    name: 'Zara',
    role: 'hero',
    generalId: 'zara',
    hp: 100,
    fuerza: 8,
    agilidad: 10,
    inteligencia: 18,
    carisma: 14,
    description: 'General del reino, maestra de las artes arcanas. Serena y calculadora, presencia elegante y mirada penetrante. Protege a los suyos con la misma precisión con la que planifica cada movimiento.',
    class: 'Maga',
    race: 'Humana',
    relationship: 'General del reino, maestra de las artes arcanas',
    physicalDescription: 'Alta y esbelta, presencia elegante, mirada penetrante. Atuendo de maga con detalles que denotan su rango.',
    personality: 'Serena y calculadora. Paciente y metódica. Muestra su lealtad con actos más que con palabras.',
    abilities: ['Magia arcana', 'Bastón de poder y escudo mágico', 'Defensa en terreno favorable'],
    currentPlaceId: 'castillo-rey',
    currentActivity: 'Meditando en los jardines',
    currentState: 'Tranquila',
    corruption: 0,
    loveRegent: 100,
    lust: 0,
    sexCount: 0,
    developedKinks: [],
    feelingsToward: { pc: 'love' },
  },
  {
    id: 'sakura',
    name: 'Sakura',
    role: 'hero',
    generalId: 'sakura',
    hp: 100,
    fuerza: 8,
    agilidad: 16,
    inteligencia: 18,
    carisma: 19,
    description: 'General diplomática y maestra de negociaciones. Delicada y elegante, pelo rosa suave como pétalos de cerezo, ojos miel. Diplomática y carismática, resuelve conflictos con palabras antes que con espadas.',
    class: 'Diplomática',
    race: 'Humana',
    relationship: 'General diplomática, maestra de negociaciones',
    physicalDescription: 'Delicada y elegante, pelo rosa suave como pétalos de cerezo, ojos miel. Ropa diplomática con armadura ligera y abanico ceremonial.',
    personality: 'Diplomática y carismática, lee a la gente con facilidad. Resuelve conflictos con palabras antes que con espadas.',
    abilities: ['Negociación y espionaje', 'Abanico de guerra y daga oculta', 'Guerra psicológica'],
    sexualDescription: { genitals: 'Vagina.', bustSize: 'Pequeño (A).' },
    currentPlaceId: 'castillo-rey',
    currentActivity: 'En audiencia con el consejo',
    currentState: 'Atenta',
    corruption: 0,
    loveRegent: 100,
    lust: 0,
    sexCount: 0,
    developedKinks: [],
    feelingsToward: { pc: 'love' },
  },
]

/**
 * Reemplaza personajes obsoletos por la definición actual de heroines (p. ej. Frost → Zara).
 * Usar al cargar partidas guardadas para que la imagen y datos sean consistentes.
 */
export function migrateCharacters(characters: Personaje[]): Personaje[] {
  const zara = heroines.find((h) => h.id === 'zara')
  if (!zara) return characters
  return characters.map((c) => {
    if (c.id === 'frost' || c.generalId === 'frost') {
      return {
        ...zara,
        currentPlaceId: c.currentPlaceId ?? zara.currentPlaceId,
        currentActivity: c.currentActivity ?? zara.currentActivity,
        currentState: c.currentState ?? zara.currentState,
        corruption: c.corruption ?? zara.corruption ?? 0,
        loveRegent: c.loveRegent ?? zara.loveRegent ?? 100,
        lust: c.lust ?? zara.lust ?? 0,
        sexCount: c.sexCount ?? zara.sexCount ?? 0,
        developedKinks: c.developedKinks ?? zara.developedKinks ?? [],
        feelingsToward: c.feelingsToward ?? zara.feelingsToward ?? { pc: 'love' },
      }
    }
    return c
  })
}

/** Construye una carta de héroe a partir de un personaje heroína (fuente única de verdad). */
export function buildHeroCardFromHeroine(h: Personaje): HeroCard {
  return {
    id: `c-${h.id}`,
    type: 'hero',
    name: h.name,
    generalId: h.generalId,
    relationship: h.relationship ?? `${h.class ?? 'General'} del reino`,
    hp: h.hp,
    strength: h.fuerza,
    agility: h.agilidad,
    intelligence: h.inteligencia,
    class: h.class ?? 'General',
    level: 5,
    sexualDescription: h.sexualDescription ?? { genitals: 'Vagina.', bustSize: 'Mediano.' },
    physicalDescription: h.physicalDescription ?? h.description,
    race: h.race ?? 'Humana',
    personality: h.personality ?? h.description,
    abilities: h.abilities ?? [],
  }
}

/** Lugares de interés: siempre se comienza con el Castillo del rey. */
export const placesOfInterest: NarratedStoryData['places'] = [
  {
    id: 'castillo-rey',
    name: 'Castillo del rey',
    description:
      'La fortaleza real, corazón del reino. Alberga el salón del trono, las dependencias de la familia real, el gran comedor y las salas de consejo. Desde sus murallas se domina la capital; en su interior se toman las decisiones que marcan el destino del reino.',
  },
  { id: 'p1', name: 'Aldea del Este', description: 'Pequeña aldea junto al río.' },
  { id: 'p2', name: 'Torre del Mago', description: 'Torre encantada al norte del bosque.' },
]

export const initialNarratedStoryData: NarratedStoryData = {
  characters: [mainCharacter, ...heroines],
  places: placesOfInterest,
  cards: [
    {
      id: 'c1',
      type: 'hero',
      name: 'Elena',
      relationship: 'Compañera de aventuras',
      hp: 120,
      strength: 14,
      agility: 18,
      intelligence: 16,
      class: 'Ladina',
      level: 5,
      sexualDescription: { genitals: 'Vagina.', bustSize: 'Mediano (C).' },
      physicalDescription: 'Elfa de pelo castaño, ojos verdes, complexión atlética.',
      race: 'Elfa',
      personality: 'Astuta, leal, algo sarcástica.',
      abilities: ['Esquiva', 'Sigilo', 'Cerraduras'],
    },
    // Héroes derivados de heroines (fuente única de verdad)
    ...heroines.map(buildHeroCardFromHeroine),
    {
      id: 'c2',
      type: 'magic',
      name: 'Bola de Fuego',
      description: 'Invoca una esfera de fuego que explota al impactar.',
      effect: 'Daño en área',
      cost: '15 PM',
    },
    {
      id: 'c3',
      type: 'item',
      name: 'Poción de Curación',
      description: 'Restaura 50 HP al beberla.',
    },
    {
      id: 'c4',
      type: 'soldier',
      name: 'Guardia de la Aldea',
      hp: 30,
      attack: 5,
      description: 'Soldado raso de la milicia.',
    },
  ],
}
