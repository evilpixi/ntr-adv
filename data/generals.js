// Configuración de Generales
// Edita este array para definir las generales del juego
// Cada general puede tener una imageUrl opcional para mostrar una imagen

export const generals = [
    // Generales del jugador (5 generales) - Reino Adeh
    {
        id: 'player_gen1',
        name: 'Aria',
        kingdom: 'player',
        description: 'General real, estratega brillante y leal al reino',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: null, // Agrega una URL de imagen aquí si tienes una
        personality: 'Líder natural con una mente analítica excepcional. Es calmada bajo presión, tomando decisiones estratégicas con confianza. Valora el honor y la justicia por encima de todo. Aunque es seria en el campo de batalla, tiene un sentido del humor sutil y es leal hasta la muerte a quienes confía. Puede ser demasiado perfeccionista a veces.',
        physicalAppearance: 'Alta y elegante, con cabello rubio dorado recogido en un elaborado moño militar. Ojos azules claros que reflejan inteligencia y determinación. Porta una armadura real ornamentada con el emblema del reino en dorado. Su postura es siempre erguida y digna, con cicatrices sutiles que cuentan historias de batallas pasadas. Tiene una sonrisa rara pero genuina que ilumina su rostro.',
        prompt: 'anime style, beautiful female general, tall and elegant, golden blonde hair in elaborate military bun, bright blue eyes, royal ornate golden armor with kingdom emblem, dignified posture, subtle battle scars, confident expression, fantasy medieval setting, detailed armor, regal appearance, professional military portrait, high quality, detailed face, intricate design, golden accents, royal aesthetic',
        additionalData: {
            age: 28,
            specialty: 'Estrategia y tácticas de campo abierto',
            favoriteWeapon: 'Espada real de dos filos',
            background: 'Nacida en la nobleza, ascendió rápidamente por mérito propio',
            fears: 'Fallar a su reino y perder a sus subordinados',
            hobbies: 'Estudiar mapas antiguos y jugar ajedrez',
            relationships: 'Muy cercana a Luna, su segunda al mando'
        }
    },
    {
        id: 'player_gen2',
        name: 'Luna',
        kingdom: 'player',
        description: 'General de la guardia real, experta en defensa y protección',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: null,
        personality: 'Protectora por naturaleza, siempre está alerta y lista para defender a otros. Es paciente y meticulosa, prefiriendo la defensa estratégica sobre el ataque directo. Tiene un instinto maternal hacia sus soldados y es extremadamente leal. Aunque parece reservada, tiene un corazón cálido que solo muestra a quienes confía completamente.',
        physicalAppearance: 'Estatura media con una constitución fuerte y atlética. Cabello plateado que brilla como la luna, cortado en un estilo práctico pero elegante. Ojos grises que parecen ver todo. Viste una armadura de guardia real con escudo grande y ornamentos plateados. Su mirada es vigilante y protectora, siempre escaneando el entorno en busca de amenazas.',
        prompt: 'anime style, beautiful female guard general, medium height athletic build, silver hair that shines like moonlight, practical elegant haircut, gray eyes that see everything, royal guard armor with large shield, silver ornaments, vigilant protective expression, defensive stance, fantasy medieval setting, detailed armor, protective aesthetic, high quality, detailed face, silver accents, moon-like glow',
        additionalData: {
            age: 26,
            specialty: 'Defensa de fortalezas y protección de objetivos',
            favoriteWeapon: 'Escudo real y espada corta',
            background: 'Hija de un antiguo capitán de la guardia, entrenada desde niña',
            fears: 'No poder proteger a quienes ama',
            hobbies: 'Entrenar nuevos reclutas y meditar',
            relationships: 'Mejor amiga de Aria, actúa como su escudo'
        }
    },
    {
        id: 'player_gen3',
        name: 'Sakura',
        kingdom: 'player',
        description: 'General diplomática, maestra en negociaciones y tácticas sutiles',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: null,
        personality: 'Diplomática y carismática, puede leer a las personas como un libro abierto. Es paciente y calculadora, prefiriendo resolver conflictos con palabras antes que con espadas. Tiene una sonrisa encantadora que puede desarmar a enemigos y una mente aguda para detectar mentiras. A veces puede ser demasiado confiada en su capacidad de negociación.',
        physicalAppearance: 'Delicada pero elegante, con cabello rosa suave que fluye como pétalos de cerezo. Ojos color miel que reflejan inteligencia y amabilidad. Viste ropas diplomáticas con elementos de armadura ligera, siempre impecablemente presentada. Lleva un abanico ceremonial que puede convertirse en arma si es necesario. Su presencia es calmante y confiable.',
        prompt: 'anime style, beautiful female diplomat general, delicate elegant appearance, soft pink hair flowing like cherry petals, honey-colored eyes, diplomatic clothing with light armor elements, ceremonial war fan, impeccable presentation, calming trustworthy presence, charming smile, fantasy medieval setting, detailed outfit, graceful pose, high quality, detailed face, pink and gold color scheme, elegant aesthetic',
        additionalData: {
            age: 25,
            specialty: 'Negociaciones, espionaje y guerra psicológica',
            favoriteWeapon: 'Abanico de guerra y daga oculta',
            background: 'Educada en las artes diplomáticas desde joven, hija de embajadores',
            fears: 'Que sus palabras no sean suficientes para evitar la guerra',
            hobbies: 'Leer tratados históricos y practicar caligrafía',
            relationships: 'Respetada por todos, especialmente cercana a Maya'
        }
    },
    {
        id: 'player_gen4',
        name: 'Maya',
        kingdom: 'player',
        description: 'General de caballería, rápida y letal en el campo de batalla',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: null,
        personality: 'Energética y apasionada, ama la velocidad y la acción. Es impulsiva pero efectiva, confiando en sus instintos en el calor de la batalla. Tiene un espíritu libre y rebelde que a veces choca con la disciplina militar, pero su lealtad es inquebrantable. Es amigable y extrovertida, formando conexiones rápidas con sus compañeros y sus monturas.',
        physicalAppearance: 'Ágil y atlética, con cabello castaño oscuro que siempre parece estar en movimiento, a menudo con mechones escapándose de su casco. Ojos verdes brillantes llenos de vida y determinación. Viste una armadura ligera de caballería diseñada para la movilidad. Siempre tiene polvo de batalla y pequeñas heridas que demuestran su estilo de combate directo. Su sonrisa es amplia y contagiosa.',
        prompt: 'anime style, beautiful female cavalry general, agile athletic build, dark brown hair always in motion with strands escaping helmet, bright green eyes full of life and determination, light cavalry armor designed for mobility, battle dust and small wounds, wide contagious smile, energetic expression, fantasy medieval setting, detailed armor, dynamic pose, high quality, detailed face, brown and green color scheme, warrior aesthetic',
        additionalData: {
            age: 24,
            specialty: 'Ataques rápidos, reconocimiento y guerra de guerrillas',
            favoriteWeapon: 'Lanza de caballería y espada curva',
            background: 'Criada en las llanuras, aprendió a montar antes de caminar',
            fears: 'Perder su libertad y quedar atrapada',
            hobbies: 'Cuidar de su caballo y competir en carreras',
            relationships: 'Tiene una conexión especial con su montura, amiga cercana de Sakura'
        }
    },
    {
        id: 'player_gen5',
        name: 'Zara',
        kingdom: 'player',
        description: 'General de élite, comandante de las fuerzas especiales del reino',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: null,
        personality: 'Intensa y enfocada, es una perfeccionista en el campo de batalla. Es reservada y misteriosa, rara vez revela sus pensamientos completos. Tiene un sentido del deber inquebrantable y es extremadamente competente en múltiples disciplinas de combate. Aunque parece fría, siente profundamente por su equipo, aunque lo demuestre de manera práctica más que emocional.',
        physicalAppearance: 'Constitución atlética y musculosa, con cabello negro corto y práctico. Ojos oscuros y penetrantes que parecen ver a través de las personas. Viste una armadura negra de élite sin ornamentos innecesarios, diseñada para sigilo y eficiencia. Tiene múltiples cicatrices que demuestra con orgullo como medallas de honor. Su postura es siempre alerta y lista para el combate.',
        prompt: 'anime style, beautiful female elite special forces general, athletic muscular build, short practical black hair, dark penetrating eyes, black elite armor without unnecessary ornaments, designed for stealth and efficiency, multiple proud battle scars, alert combat-ready posture, intense focused expression, fantasy medieval setting, detailed tactical armor, high quality, detailed face, dark color scheme, professional warrior aesthetic',
        additionalData: {
            age: 30,
            specialty: 'Operaciones especiales, infiltración y combate cuerpo a cuerpo',
            favoriteWeapon: 'Dagas gemelas y arco compuesto',
            background: 'Origen desconocido, reclutada de las calles por su talento natural',
            fears: 'No estar a la altura de las expectativas y fallar en misiones críticas',
            hobbies: 'Entrenamiento constante y estudiar técnicas de combate antiguas',
            relationships: 'Respetada pero temida, mantiene distancia profesional con todos'
        }
    },
    // Reino 1 - Glacia (Hielo) - 1 general
    {
        id: 'kingdom1_gen1',
        name: 'Frost',
        kingdom: 'kingdom1',
        description: 'General del hielo, maestra de las artes gélidas y comandante de las fuerzas heladas',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 8,
        imageUrl: null,
        personality: 'Serena y calculadora como el hielo mismo, rara vez muestra emoción. Es paciente y metódica, planificando cada movimiento con precisión glacial. Aunque parece fría, tiene un profundo amor por su reino y su gente, demostrándolo a través de acciones más que palabras. Puede ser implacable con los enemigos pero protectora con los suyos.',
        physicalAppearance: 'Alta y esbelta, con cabello blanco como la nieve que cae en cascadas heladas. Piel pálida casi translúcida con un ligero brillo azulado. Ojos azul hielo que parecen ver a través de todo. Viste una armadura de hielo cristalino que nunca se derrite, con patrones de escarcha que se mueven mágicamente. Su aliento se condensa incluso en interiores, y sus pasos dejan un rastro de escarcha.',
        prompt: 'anime style, beautiful female ice general, tall slender build, snow-white hair falling in icy cascades, pale almost translucent skin with slight blue glow, ice-blue eyes, crystalline ice armor that never melts, magical moving frost patterns, condensing breath, frost trail, serene cold expression, fantasy ice kingdom setting, detailed ice armor, ethereal appearance, high quality, detailed face, blue and white color scheme, glacial aesthetic, magical ice effects',
        additionalData: {
            age: 32,
            specialty: 'Magia de hielo, defensa en terrenos gélidos y guerra de invierno',
            favoriteWeapon: 'Lanza de hielo y escudo de cristal',
            background: 'Nacida durante la Gran Tormenta de Hielo, bendecida por los espíritus del invierno',
            fears: 'El calor extremo y la pérdida de su conexión con el hielo',
            hobbies: 'Esculpir hielo y meditar en los glaciares',
            relationships: 'Respetada como guardiana del hielo, mantiene distancia emocional'
        }
    },
    // Reino 2 - Ignis (Fuego) - 2 generales
    {
        id: 'kingdom2_gen1',
        name: 'Ember',
        kingdom: 'kingdom2',
        description: 'General del fuego, guerrera ardiente que lidera con pasión y determinación',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 9,
        imageUrl: null,
        personality: 'Apasionada y carismática, lidera con el corazón y la fuerza. Es impulsiva pero efectiva, inspirando lealtad feroz en sus tropas. Tiene un temperamento ardiente que puede encenderse rápidamente, pero también puede ser cálida y protectora. Valora la fuerza y el coraje, despreciando la cobardía y la traición.',
        physicalAppearance: 'Constitución fuerte y poderosa, con cabello rojo fuego que parece moverse como llamas vivas. Ojos dorados que brillan con intensidad. Piel bronceada con marcas de fuego que brillan suavemente. Viste una armadura de metal forjado con runas de fuego que emiten calor. Sus manos a veces brillan con llamas cuando está emocionada o en combate.',
        prompt: 'anime style, beautiful female fire general, strong powerful build, red fire hair moving like living flames, golden eyes shining with intensity, tanned skin with glowing fire marks, forged metal armor with fire runes emitting heat, hands glowing with flames, passionate determined expression, fantasy volcanic kingdom setting, detailed fire armor, dynamic pose, high quality, detailed face, red orange and gold color scheme, fiery aesthetic, fire effects',
        additionalData: {
            age: 27,
            specialty: 'Combate cuerpo a cuerpo con fuego, liderazgo carismático y asaltos frontales',
            favoriteWeapon: 'Espada de fuego y escudo ardiente',
            background: 'Hija de un maestro forjador, aprendió a controlar el fuego desde niña',
            fears: 'Ser traicionada y perder su pasión por la batalla',
            hobbies: 'Forjar armas y entrenar en las forjas volcánicas',
            relationships: 'Rival amistosa con Blaze, respeta la fuerza sobre todo'
        }
    },
    {
        id: 'kingdom2_gen2',
        name: 'Blaze',
        kingdom: 'kingdom2',
        description: 'General volcánica, destructora implacable que arrasa todo a su paso',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 8,
        imageUrl: null,
        personality: 'Implacable y destructiva, disfruta del caos y la destrucción en el campo de batalla. Es más fría y calculadora que Ember, usando el fuego como herramienta de terror. Tiene un sentido del humor oscuro y sarcástico. Aunque parece despiadada, tiene un código de honor estricto y respeta a los enemigos que luchan con valentía.',
        physicalAppearance: 'Imponente y musculosa, con cabello negro con mechones rojos y naranjas como lava. Ojos rojos intensos que brillan como brasas. Piel con cicatrices de quemaduras que brillan como magma. Viste una armadura pesada de obsidiana y metal fundido, con espinas y púas. Su presencia emana calor intenso, y el suelo a veces se agrieta bajo sus pies.',
        prompt: 'anime style, beautiful female volcanic general, imposing muscular build, black hair with red and orange streaks like lava, intense red eyes glowing like embers, skin with glowing magma burn scars, heavy obsidian and molten metal armor with spikes and thorns, intense heat aura, cracked ground, destructive expression, fantasy volcanic kingdom setting, detailed heavy armor, powerful stance, high quality, detailed face, black red and orange color scheme, volcanic aesthetic, lava effects',
        additionalData: {
            age: 29,
            specialty: 'Destrucción masiva, guerra de asedio y magia volcánica',
            favoriteWeapon: 'Martillo de guerra ardiente y hacha de doble filo',
            background: 'Sobreviviente de una erupción volcánica que la transformó',
            fears: 'Ser olvidada y perder su poder destructivo',
            hobbies: 'Estudiar erupciones volcánicas y coleccionar armas',
            relationships: 'Rival amistosa con Ember, respeta la fuerza bruta'
        }
    },
    // Reino 3 - Tempestas (Tormenta) - 2 generales
    {
        id: 'kingdom3_gen1',
        name: 'Storm',
        kingdom: 'kingdom3',
        description: 'General de la tormenta, comandante de los vientos y maestra de la guerra relámpago',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: null,
        personality: 'Dinámica e impredecible como una tormenta, cambia de humor rápidamente. Es estratégica pero adaptativa, ajustando sus planes sobre la marcha. Tiene una energía eléctrica que inspira a sus tropas. Puede ser tanto calmada y calculadora como furiosa y destructiva. Valora la libertad y la capacidad de cambio constante.',
        physicalAppearance: 'Alta y delgada con una presencia que parece ocupar más espacio del que realmente tiene. Cabello plateado que se mueve como si estuviera en constante viento, con mechones que brillan con electricidad estática. Ojos grises con destellos de relámpagos. Viste una armadura ligera de metal conductor con capa que ondea mágicamente. Chispas eléctricas saltan ocasionalmente entre sus dedos.',
        prompt: 'anime style, beautiful female storm general, tall thin build with imposing presence, silver hair moving in constant wind with static electricity glowing strands, gray eyes with lightning flashes, light conductive metal armor with magically flowing cape, electric sparks between fingers, dynamic energetic expression, fantasy storm kingdom setting, detailed lightning armor, flowing movement, high quality, detailed face, silver purple and blue color scheme, storm aesthetic, lightning effects',
        additionalData: {
            age: 31,
            specialty: 'Guerra relámpago, movilidad táctica y control del clima',
            favoriteWeapon: 'Lanza eléctrica y escudo de viento',
            background: 'Nacida durante una tormenta perfecta, bendecida por los vientos',
            fears: 'Quedar atrapada y perder su libertad de movimiento',
            hobbies: 'Volar con los vientos y estudiar patrones climáticos',
            relationships: 'Compañera de batalla cercana con Thunder, complementan sus estilos'
        }
    },
    {
        id: 'kingdom3_gen2',
        name: 'Thunder',
        kingdom: 'kingdom3',
        description: 'General eléctrica, guerrera veloz como el rayo y poderosa como la tempestad',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 9,
        imageUrl: null,
        personality: 'Veloz tanto en pensamiento como en acción, siempre está en movimiento. Es directa y sin rodeos, prefiriendo la acción sobre las palabras. Tiene un sentido del humor rápido y agudo. Aunque parece impaciente, es extremadamente leal y protege ferozmente a sus aliados. Su energía es contagiosa pero puede ser agotadora.',
        physicalAppearance: 'Ágil y atlética, con cabello amarillo eléctrico que se eriza con energía estática. Ojos azules brillantes que parecen emitir luz. Piel con un ligero brillo que sugiere energía contenida. Viste una armadura ligera diseñada para velocidad, con elementos que brillan con energía eléctrica. Se mueve con una gracia casi sobrenatural, dejando un rastro de chispas.',
        prompt: 'anime style, beautiful female thunder general, agile athletic build, electric yellow hair standing with static energy, bright blue eyes emitting light, skin with slight glow suggesting contained energy, light speed-designed armor with glowing electric elements, supernatural graceful movement, spark trail, energetic fast expression, fantasy storm kingdom setting, detailed lightning armor, dynamic speed pose, high quality, detailed face, yellow blue and white color scheme, thunder aesthetic, electric effects',
        additionalData: {
            age: 26,
            specialty: 'Ataques rápidos, velocidad extrema y combate eléctrico',
            favoriteWeapon: 'Espadas gemelas eléctricas y arco de relámpago',
            background: 'Golpeada por un rayo en su juventud, ganó sus poderes eléctricos',
            fears: 'Ser demasiado lenta y no poder proteger a tiempo',
            hobbies: 'Correr a velocidades extremas y competir en carreras',
            relationships: 'Compañera cercana de Storm, forman un equipo letal juntas'
        }
    },
    // Reino 4 - Umbra (Sombra) - 3 generales
    {
        id: 'kingdom4_gen1',
        name: 'Shadow',
        kingdom: 'kingdom4',
        description: 'General de las sombras, asesina sigilosa y maestra del sigilo',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 11,
        imageUrl: null,
        personality: 'Silenciosa y letal, rara vez habla pero sus acciones hablan por sí solas. Es paciente y meticulosa, esperando el momento perfecto para atacar. Tiene un sentido del humor oscuro y sutil. Aunque parece despiadada, tiene un código de honor estricto y solo mata cuando es necesario. Es extremadamente leal pero mantiene sus emociones ocultas.',
        physicalAppearance: 'Delgada y ágil, casi parece desvanecerse en las sombras. Cabello negro como la medianoche que se funde con la oscuridad. Ojos oscuros que parecen absorber la luz. Viste ropas oscuras y armadura ligera diseñada para sigilo, con múltiples bolsillos para armas ocultas. Se mueve sin hacer ruido, como un fantasma. Su presencia es apenas perceptible hasta que decide mostrarse.',
        prompt: 'anime style, beautiful female shadow assassin general, thin agile build almost fading into shadows, midnight black hair blending with darkness, dark eyes absorbing light, dark clothing and light stealth armor with multiple hidden weapon pockets, silent ghost-like movement, barely perceptible presence, mysterious lethal expression, fantasy shadow kingdom setting, detailed stealth armor, hidden pose, high quality, detailed face, black and dark purple color scheme, shadow aesthetic, stealth effects',
        additionalData: {
            age: 28,
            specialty: 'Asesinatos, infiltración y guerra de guerrillas nocturna',
            favoriteWeapon: 'Dagas gemelas de sombra y shurikens',
            background: 'Huérfana criada por la hermandad de asesinos',
            fears: 'Ser descubierta y perder su capacidad de sigilo',
            hobbies: 'Practicar sigilo y estudiar venenos',
            relationships: 'Mantiene distancia con todos, respetada pero temida'
        }
    },
    {
        id: 'kingdom4_gen2',
        name: 'Night',
        kingdom: 'kingdom4',
        description: 'General de la noche, estratega que opera en la oscuridad y la penumbra',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: null,
        personality: 'Estratega brillante que piensa varios pasos por delante. Es calmada y calculadora, prefiriendo la manipulación y la guerra psicológica sobre el combate directo. Tiene una mente aguda para detectar debilidades y explotarlas. Aunque parece fría, tiene un profundo amor por su reino que la motiva. Es misteriosa y guarda sus secretos celosamente.',
        physicalAppearance: 'Elegante y misteriosa, con cabello púrpura oscuro que parece absorber la luz. Ojos violeta profundos que reflejan inteligencia y misterio. Piel pálida que contrasta con su cabello oscuro. Viste ropas oscuras elegantes con capa que parece estar hecha de sombras. Su presencia es imponente pero sutil, como la noche misma.',
        prompt: 'anime style, beautiful female night strategist general, elegant mysterious appearance, dark purple hair absorbing light, deep violet eyes reflecting intelligence and mystery, pale skin contrasting dark hair, elegant dark clothing with shadow-made cape, imposing yet subtle presence like night itself, calculating intelligent expression, fantasy shadow kingdom setting, detailed elegant dark outfit, strategic pose, high quality, detailed face, purple black and violet color scheme, night aesthetic, shadow effects',
        additionalData: {
            age: 33,
            specialty: 'Estrategia oscura, guerra psicológica y manipulación',
            favoriteWeapon: 'Bastón de sombras y daga ceremonial',
            background: 'Antigua erudita que se unió a las sombras por venganza',
            fears: 'Que sus planes fallen y perder el control',
            hobbies: 'Estudiar estrategias antiguas y leer textos prohibidos',
            relationships: 'Respetada como mentora, mantiene relaciones profesionales'
        }
    },
    {
        id: 'kingdom4_gen3',
        name: 'Dark',
        kingdom: 'kingdom4',
        description: 'General de la oscuridad, comandante de las fuerzas sombrías y guardiana de los secretos',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 9,
        imageUrl: null,
        personality: 'Misteriosa y reservada, guarda los secretos más profundos del reino. Es leal hasta la muerte a su causa y despiadada con los enemigos. Tiene una presencia intimidante que inspira tanto respeto como miedo. Aunque parece sombría, tiene un sentido del deber inquebrantable. Es paciente y puede esperar años para ejecutar un plan.',
        physicalAppearance: 'Imponente y sombría, con cabello negro azabache que parece estar hecho de oscuridad pura. Ojos completamente negros sin pupila visible. Piel pálida como la luna. Viste una armadura oscura ornamentada con símbolos de poder sombrío, con una capa que parece estar hecha de sombras. Su presencia hace que las sombras se alarguen a su alrededor.',
        prompt: 'anime style, beautiful female darkness general, imposing somber appearance, jet black hair made of pure darkness, completely black eyes without visible pupils, pale moon-like skin, dark ornate armor with shadow power symbols, shadow-made cape, presence making shadows lengthen around her, intimidating mysterious expression, fantasy shadow kingdom setting, detailed dark ornate armor, powerful dark pose, high quality, detailed face, black and dark gray color scheme, darkness aesthetic, shadow manipulation effects',
        additionalData: {
            age: 35,
            specialty: 'Comando de fuerzas sombrías, magia oscura y guardián de secretos',
            favoriteWeapon: 'Espada de sombras y escudo de oscuridad',
            background: 'Guardiana ancestral de los secretos del reino, posición hereditaria',
            fears: 'Que los secretos del reino sean revelados',
            hobbies: 'Proteger los archivos secretos y practicar magia oscura',
            relationships: 'Mantiene distancia con todos, solo responde al consejo de sombras'
        }
    }
];
