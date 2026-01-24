// Configuración de Reinos
// Edita este array para definir los reinos del juego
// Cada reino puede tener una imageUrl opcional para mostrar una imagen

export const kingdoms = [
    {
        id: 'player',
        name: 'Adeh',
        theme: 'real',
        description: 'El reino real, centro de poder y equilibrio en el mundo',
        color: '#ffd700',
        owner: 'player',
        provinces: 7,
        imageUrl: null, // Agrega una URL de imagen aquí si tienes una
        architecturalStyle: 'Arquitectura clásica imperial con grandes palacios de mármol blanco y dorado, columnas corintias, arcos triunfales y jardines reales. Las estructuras combinan elegancia y poder, con techos abovedados, vitrales coloridos y estatuas monumentales que representan la gloria del reino.',
        biome: 'Llanuras fértiles y bosques templados con ríos serpenteantes, colinas suaves y valles verdes. El clima es moderado con estaciones bien definidas, ideal para la agricultura y el asentamiento humano.',
        governmentType: 'Monarquía constitucional con un consejo de nobles y representantes de las provincias. El rey o reina gobierna con el apoyo de un senado que vela por el equilibrio entre las diferentes regiones del reino.',
        socialDescription: 'Sociedad estructurada en clases pero con movilidad social. Los ciudadanos valoran la justicia, el honor y la lealtad. La educación es accesible y las artes florecen. Existe un fuerte sentido de identidad nacional y orgullo por la tradición real, mientras se mantiene apertura al comercio y la diplomacia con otros reinos.'
    },
    {
        id: 'kingdom1',
        name: 'Glacia',
        theme: 'hielo',
        description: 'Reino del hielo eterno, donde los vientos gélidos soplan sin cesar y la nieve nunca se derrite',
        color: '#4a9eff',
        owner: 'ai',
        provinces: 2,
        imageUrl: null,
        architecturalStyle: 'Fortalezas de hielo y cristal talladas directamente en glaciares, con torres puntiagudas que se elevan como estalactitas. Las estructuras están hechas de hielo mágico que nunca se derrite, con puentes de cristal y cúpulas translúcidas que reflejan la luz del sol de manera etérea. Los interiores están decorados con esculturas de hielo y patrones geométricos helados.',
        biome: 'Tundra ártica y glaciares perpetuos con montañas nevadas, campos de hielo infinitos y lagos congelados. El clima es extremadamente frío, con ventiscas frecuentes y auroras boreales que iluminan las noches polares. La vegetación es escasa, limitada a líquenes y musgos resistentes al frío.',
        governmentType: 'Teocracia helada gobernada por un Gran Consejo de Ancianos del Hielo. Las decisiones se toman por consenso y se rigen por antiguas tradiciones que honran a los espíritus del invierno. El liderazgo se basa en la sabiduría y la conexión con las fuerzas gélidas.',
        socialDescription: 'Sociedad resiliente y unida que ha aprendido a prosperar en condiciones extremas. Los habitantes valoran la resistencia, la sabiduría y la paciencia. La comunidad es muy cohesionada, compartiendo recursos y conocimiento para sobrevivir. Existe un profundo respeto por la naturaleza y las tradiciones ancestrales. La magia del hielo es parte integral de su cultura y forma de vida.'
    },
    {
        id: 'kingdom2',
        name: 'Ignis',
        theme: 'fuego',
        description: 'Reino volcánico donde la lava fluye como ríos y el fuego es la esencia de la vida',
        color: '#ff4a4a',
        owner: 'ai',
        provinces: 2,
        imageUrl: null,
        architecturalStyle: 'Ciudades construidas sobre y alrededor de volcanes activos, con estructuras de obsidiana negra y roca volcánica. Los edificios tienen formas orgánicas y fluidas, con techos curvos que imitan el flujo de lava. Las forjas y fundiciones están integradas en la arquitectura, con canales de lava que iluminan las calles. Los templos tienen altares de fuego perpetuo y columnas de magma solidificado.',
        biome: 'Tierras volcánicas con campos de lava activos, montañas volcánicas humeantes y desiertos de ceniza. El suelo es fértil cerca de los volcanes pero árido en las zonas más alejadas. Geiseres y fumarolas son comunes. El clima es cálido y seco, con cielos teñidos de naranja y rojo por las erupciones constantes.',
        governmentType: 'Dictadura militar liderada por un Señor del Fuego que gobierna con puño de hierro. El poder se concentra en los guerreros más fuertes y los maestros forjadores. Las decisiones son rápidas y directas, sin lugar para la disidencia. La jerarquía se basa en la fuerza y la capacidad de dominar el fuego.',
        socialDescription: 'Sociedad agresiva y apasionada que valora la fuerza, el coraje y la determinación. Los habitantes son guerreros natos, orgullosos de su resistencia al calor y su dominio del fuego. La forja y la guerra son las profesiones más respetadas. Existe una cultura de competencia constante y demostración de poder. La lealtad es feroz pero también puede cambiar rápidamente si alguien demuestra ser más fuerte. La vida es intensa y efímera, celebrando cada momento con pasión.'
    },
    {
        id: 'kingdom3',
        name: 'Tempestas',
        theme: 'tormenta',
        description: 'Reino de las tormentas eternas, donde los relámpagos iluminan el cielo y los vientos rugen con furia',
        color: '#9b59b6',
        owner: 'ai',
        provinces: 3,
        imageUrl: null,
        architecturalStyle: 'Torres altísimas que se elevan hacia las nubes, construidas para canalizar y resistir las tormentas. Los edificios tienen formas aerodinámicas con techos puntiagudos y pararrayos ornamentales. Las estructuras están hechas de materiales conductores que brillan con energía eléctrica. Los palacios flotantes se mantienen suspendidos mediante campos magnéticos, y las ciudades están conectadas por puentes que cruzan los vientos huracanados.',
        biome: 'Llanuras azotadas por vientos constantes, montañas escarpadas donde se concentran las tormentas, y cielos perpetuamente nublados. Relámpagos frecuentes iluminan el paisaje, y los vientos pueden alcanzar velocidades destructivas. La vegetación es resistente al viento, con árboles retorcidos y plantas que se aferran al suelo. Lluvias torrenciales son comunes, creando ríos que cambian de curso constantemente.',
        governmentType: 'República electiva donde los líderes son elegidos por su capacidad de controlar las tormentas y predecir los vientos. Un consejo de maestros de la tempestad gobierna, tomando decisiones rápidas y adaptativas como las propias tormentas. El poder cambia con frecuencia, reflejando la naturaleza impredecible del clima.',
        socialDescription: 'Sociedad dinámica y adaptable que valora la flexibilidad, la innovación y la capacidad de cambio. Los habitantes son nómadas en espíritu, acostumbrados a adaptarse rápidamente a las condiciones cambiantes. La magia de las tormentas es parte de la vida cotidiana, usada para energía, transporte y comunicación. Existe un respeto profundo por la naturaleza impredecible y poderosa. La sociedad es igualitaria pero competitiva, donde cada uno debe demostrar su valía constantemente. La música y las artes reflejan el caos y la belleza de las tormentas.'
    },
    {
        id: 'kingdom4',
        name: 'Umbra',
        theme: 'sombra',
        description: 'Reino de las sombras profundas, donde la oscuridad reina y los secretos se ocultan en la penumbra',
        color: '#2c3e50',
        owner: 'ai',
        provinces: 1,
        imageUrl: null,
        architecturalStyle: 'Ciudades subterráneas y estructuras que emergen de la oscuridad, construidas con materiales que absorben la luz. Los edificios tienen formas angulares y sombrías, con pasadizos secretos y cámaras ocultas. La arquitectura prioriza el sigilo y la defensa, con muros altos, puertas ocultas y sistemas de vigilancia invisibles. Los palacios están envueltos en sombras mágicas que cambian de forma, y las calles están iluminadas solo por tenues luces que crean más sombras que claridad.',
        biome: 'Tierras en penumbra perpetua con bosques oscuros de árboles altos que bloquean la luz del sol, cuevas profundas y valles sombríos. El cielo está constantemente nublado, y la niebla espesa envuelve el paisaje. La vegetación es oscura y retorcida, adaptada a la falta de luz. Los ríos fluyen silenciosamente entre las sombras, y los animales son nocturnos y sigilosos.',
        governmentType: 'Oligarquía secreta gobernada por un consejo de sombras que opera desde las profundidades. El verdadero poder está oculto, y las decisiones se toman en la oscuridad. Existe una red compleja de espías, asesinos y agentes que mantienen el orden. El gobierno es eficiente pero despiadado, eliminando cualquier amenaza antes de que se manifieste.',
        socialDescription: 'Sociedad cerrada y misteriosa que valora el secreto, la discreción y el conocimiento oculto. Los habitantes son desconfiados pero leales a su círculo íntimo. La información es poder, y el espionaje y la intriga son parte de la cultura. Existe una jerarquía estricta basada en el conocimiento de secretos y la capacidad de mantenerlos. La magia de las sombras es temida y respetada. La sociedad es altamente organizada pero aparentemente caótica desde fuera. Los rituales y tradiciones se realizan en secreto, y la verdadera naturaleza del reino permanece oculta para los forasteros.'
    }
];
