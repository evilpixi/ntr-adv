// Generals Configuration
// Edit this array to define the game's generals
// Each general can have an optional imageUrl to display an image
// imageUrl can be:
//   - Just the filename (e.g.: "aria.png") - the full path is built automatically
//   - A full URL (http/https) or data URI - used as is

export const generals = [
    // Player generals (5 generals) - Adeh Kingdom
    {
        id: 'aria',
        name: 'Aria',
        kingdom: 'adeh',
        description: 'Royal general, brilliant strategist and loyal to the kingdom',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: "aria.png", // Filename - the full path is built automatically
        personality: 'Natural leader with an exceptional analytical mind. She is calm under pressure, making strategic decisions with confidence. She values honor and justice above all. Although serious on the battlefield, she has a subtle sense of humor and is loyal to the death to those she trusts. Can be too much of a perfectionist at times.',
        physicalAppearance: 'Tall and elegant, with golden blonde hair gathered in an elaborate military bun. Bright blue eyes that reflect intelligence and determination. Wears royal ornate armor with the kingdom emblem in gold. Her posture is always upright and dignified, with subtle scars that tell stories of past battles. She has a rare but genuine smile that lights up her face.',
        prompt: 'anime style, beautiful female general, tall and elegant, golden blonde hair in elaborate military bun, bright blue eyes, royal ornate golden armor with kingdom emblem, dignified posture, subtle battle scars, confident expression, fantasy medieval setting, detailed armor, regal appearance, professional military portrait, high quality, detailed face, intricate design, golden accents, royal aesthetic',
        additionalData: {
            age: 28,
            specialty: 'Strategy and open field tactics',
            favoriteWeapon: 'Royal two-edged sword',
            background: 'Born into nobility, rose quickly through merit',
            fears: 'Failing her kingdom and losing her subordinates',
            hobbies: 'Studying ancient maps and playing chess',
            relationships: 'Very close to Luna, her second in command'
        }
    },
    {
        id: 'luna',
        name: 'Luna',
        kingdom: 'adeh',
        description: 'Royal guard general, expert in defense and protection',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: "luna.png", 
        personality: 'Protective by nature, always alert and ready to defend others. She is patient and meticulous, preferring strategic defense over direct attack. She has a maternal instinct towards her soldiers and is extremely loyal. Although she seems reserved, she has a warm heart that she only shows to those she completely trusts.',
        physicalAppearance: 'Medium height with a strong and athletic build. Silver hair that shines like the moon, cut in a practical but elegant style. Gray eyes that seem to see everything. Wears royal guard armor with a large shield and silver ornaments. Her gaze is vigilant and protective, always scanning the environment for threats.',
        prompt: 'anime style, beautiful female guard general, medium height athletic build, silver hair that shines like moonlight, practical elegant haircut, gray eyes that see everything, royal guard armor with large shield, silver ornaments, vigilant protective expression, defensive stance, fantasy medieval setting, detailed armor, protective aesthetic, high quality, detailed face, silver accents, moon-like glow',
        additionalData: {
            age: 26,
            specialty: 'Fortress defense and target protection',
            favoriteWeapon: 'Royal shield and short sword',
            background: 'Daughter of a former guard captain, trained since childhood',
            fears: 'Not being able to protect those she loves',
            hobbies: 'Training new recruits and meditating',
            relationships: 'Best friend of Aria, acts as her shield'
        }
    },
    {
        id: 'sakura',
        name: 'Sakura',
        kingdom: 'adeh',
        description: 'Diplomatic general, master of negotiations and subtle tactics',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: "sakura.png", 
        personality: 'Diplomatic and charismatic, she can read people like an open book. She is patient and calculating, preferring to resolve conflicts with words rather than swords. She has a charming smile that can disarm enemies and a sharp mind for detecting lies. Sometimes she can be too confident in her negotiation abilities.',
        physicalAppearance: 'Delicate but elegant, with soft pink hair flowing like cherry petals. Honey-colored eyes that reflect intelligence and kindness. Wears diplomatic clothing with light armor elements, always impeccably presented. Carries a ceremonial fan that can become a weapon if necessary. Her presence is calming and trustworthy.',
        prompt: 'anime style, beautiful female diplomat general, delicate elegant appearance, soft pink hair flowing like cherry petals, honey-colored eyes, diplomatic clothing with light armor elements, ceremonial war fan, impeccable presentation, calming trustworthy presence, charming smile, fantasy medieval setting, detailed outfit, graceful pose, high quality, detailed face, pink and gold color scheme, elegant aesthetic',
        additionalData: {
            age: 25,
            specialty: 'Negotiations, espionage and psychological warfare',
            favoriteWeapon: 'War fan and hidden dagger',
            background: 'Educated in diplomatic arts from a young age, daughter of ambassadors',
            fears: 'That her words won\'t be enough to prevent war',
            hobbies: 'Reading historical treaties and practicing calligraphy',
            relationships: 'Respected by all, especially close to Maya'
        }
    },
    {
        id: 'maya',
        name: 'Maya',
        kingdom: 'adeh',
        description: 'Cavalry general, fast and lethal on the battlefield',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: "maya.png",
        personality: 'Energetic and passionate, she loves speed and action. She is impulsive but effective, trusting her instincts in the heat of battle. She has a free and rebellious spirit that sometimes clashes with military discipline, but her loyalty is unbreakable. She is friendly and extroverted, forming quick connections with her comrades and mounts.',
        physicalAppearance: 'Agile and athletic, with dark brown hair that always seems to be in motion, often with strands escaping from her helmet. Bright green eyes full of life and determination. Wears light cavalry armor designed for mobility. Always has battle dust and small wounds that demonstrate her direct combat style. Her smile is wide and contagious.',
        prompt: 'anime style, beautiful female cavalry general, agile athletic build, dark brown hair always in motion with strands escaping helmet, bright green eyes full of life and determination, light cavalry armor designed for mobility, battle dust and small wounds, wide contagious smile, energetic expression, fantasy medieval setting, detailed armor, dynamic pose, high quality, detailed face, brown and green color scheme, warrior aesthetic',
        additionalData: {
            age: 24,
            specialty: 'Fast attacks, reconnaissance and guerrilla warfare',
            favoriteWeapon: 'Cavalry lance and curved sword',
            background: 'Raised on the plains, learned to ride before walking',
            fears: 'Losing her freedom and being trapped',
            hobbies: 'Taking care of her horse and competing in races',
            relationships: 'Has a special connection with her mount, close friend of Sakura'
        }
    },
    {
        id: 'zara',
        name: 'Zara',
        kingdom: 'adeh',
        description: 'Elite general, commander of the kingdom\'s special forces',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: "zara.png",
        personality: 'Intense and focused, she is a perfectionist on the battlefield. She is reserved and mysterious, rarely revealing her complete thoughts. She has an unbreakable sense of duty and is extremely competent in multiple combat disciplines. Although she seems cold, she feels deeply for her team, though she shows it in practical rather than emotional ways.',
        physicalAppearance: 'Athletic and muscular build, with short practical black hair. Dark penetrating eyes that seem to see through people. Wears black elite armor without unnecessary ornaments, designed for stealth and efficiency. Has multiple scars that she proudly displays as medals of honor. Her posture is always alert and ready for combat.',
        prompt: 'anime style, beautiful female shadow warrior general, athletic graceful build, short elegant black hair with mystical shimmer, dark mysterious eyes with gentle wisdom, dark ornate fantasy armor with magical runes and shadow enchantments, elegant flowing cape, calm serene expression with subtle mysterious smile, fantasy medieval setting, detailed magical armor, high quality, detailed face, dark purple and black color scheme with magical glow, mystical warrior aesthetic, fantasy magic effects',
        additionalData: {
            age: 30,
            specialty: 'Special operations, infiltration and hand-to-hand combat',
            favoriteWeapon: 'Twin daggers and composite bow',
            background: 'Unknown origin, recruited from the streets for her natural talent',
            fears: 'Not living up to expectations and failing critical missions',
            hobbies: 'Constant training and studying ancient combat techniques',
            relationships: 'Respected but feared, maintains professional distance with everyone'
        }
    },
    // Kingdom 1 - Glacia (Ice) - 1 general
    {
        id: 'frost',
        name: 'Frost',
        kingdom: 'glacia',
        description: 'Ice general, master of the frozen arts and commander of the icy forces',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 8,
        imageUrl: "frost.png",
        personality: 'Serene and calculating like ice itself, she rarely shows emotion. She is patient and methodical, planning each move with glacial precision. Although she seems cold, she has a deep love for her kingdom and people, showing it through actions rather than words. She can be relentless with enemies but protective of her own.',
        physicalAppearance: 'Tall and slender, with snow-white hair falling in icy cascades. Pale almost translucent skin with a slight bluish glow. Ice-blue eyes that seem to see through everything. Wears crystalline ice armor that never melts, with frost patterns that move magically. Her breath condenses even indoors, and her steps leave a trail of frost.',
        prompt: 'anime style, beautiful female ice general, tall slender build, snow-white hair falling in icy cascades, pale almost translucent skin with slight blue glow, ice-blue eyes, crystalline ice armor that never melts, magical moving frost patterns, condensing breath, frost trail, serene cold expression, fantasy ice kingdom setting, detailed ice armor, ethereal appearance, high quality, detailed face, blue and white color scheme, glacial aesthetic, magical ice effects',
        additionalData: {
            age: 32,
            specialty: 'Ice magic, defense in frozen terrain and winter warfare',
            favoriteWeapon: 'Ice lance and crystal shield',
            background: 'Born during the Great Ice Storm, blessed by the winter spirits',
            fears: 'Extreme heat and losing her connection to ice',
            hobbies: 'Sculpting ice and meditating in glaciers',
            relationships: 'Respected as guardian of ice, maintains emotional distance'
        }
    },
    // Kingdom 2 - Ignis (Fire) - 2 generals
    {
        id: 'ember',
        name: 'Ember',
        kingdom: 'ignis',
        description: 'Fire general, burning warrior who leads with passion and determination',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 9,
        imageUrl: "ember.png",
        personality: 'Passionate and charismatic, she leads with heart and strength. She is impulsive but effective, inspiring fierce loyalty in her troops. She has a fiery temperament that can ignite quickly, but she can also be warm and protective. She values strength and courage, despising cowardice and betrayal.',
        physicalAppearance: 'Strong and powerful build, with fire-red hair that seems to move like living flames. Golden eyes that shine with intensity. Tanned skin with fire marks that glow softly. Wears forged metal armor with fire runes that emit heat. Her hands sometimes glow with flames when she is excited or in combat.',
        prompt: 'anime style, beautiful female fire general, strong powerful build, red fire hair moving like living flames, golden eyes shining with intensity, tanned skin with glowing fire marks, forged metal armor with fire runes emitting heat, hands glowing with flames, passionate determined expression, fantasy volcanic kingdom setting, detailed fire armor, dynamic pose, high quality, detailed face, red orange and gold color scheme, fiery aesthetic, fire effects',
        additionalData: {
            age: 27,
            specialty: 'Fire hand-to-hand combat, charismatic leadership and frontal assaults',
            favoriteWeapon: 'Fire sword and burning shield',
            background: 'Daughter of a master smith, learned to control fire from childhood',
            fears: 'Being betrayed and losing her passion for battle',
            hobbies: 'Forging weapons and training in volcanic forges',
            relationships: 'Friendly rival with Blaze, respects strength above all'
        }
    },
    {
        id: 'blaze',
        name: 'Blaze',
        kingdom: 'ignis',
        description: 'Volcanic general, relentless destroyer who devastates everything in her path',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 8,
        imageUrl: "blaze.png",
        personality: 'Relentless and destructive, she enjoys chaos and destruction on the battlefield. She is colder and more calculating than Ember, using fire as a tool of terror. She has a dark and sarcastic sense of humor. Although she seems ruthless, she has a strict code of honor and respects enemies who fight bravely.',
        physicalAppearance: 'Imposing and muscular, with black hair with red and orange streaks like lava. Intense red eyes that glow like embers. Skin with burn scars that glow like magma. Wears heavy obsidian and molten metal armor, with spikes and thorns. Her presence radiates intense heat, and the ground sometimes cracks under her feet.',
        prompt: 'anime style, beautiful female volcanic general, imposing muscular build, black hair with red and orange streaks like lava, intense red eyes glowing like embers, skin with glowing magma burn scars, heavy obsidian and molten metal armor with spikes and thorns, intense heat aura, cracked ground, destructive expression, fantasy volcanic kingdom setting, detailed heavy armor, powerful stance, high quality, detailed face, black red and orange color scheme, volcanic aesthetic, lava effects',
        additionalData: {
            age: 29,
            specialty: 'Mass destruction, siege warfare and volcanic magic',
            favoriteWeapon: 'Burning war hammer and double-edged axe',
            background: 'Survivor of a volcanic eruption that transformed her',
            fears: 'Being forgotten and losing her destructive power',
            hobbies: 'Studying volcanic eruptions and collecting weapons',
            relationships: 'Friendly rival with Ember, respects brute force'
        }
    },
    // Kingdom 3 - Tempestas (Storm) - 2 generals
    {
        id: 'storm',
        name: 'Storm',
        kingdom: 'tempestas',
        description: 'Storm general, commander of the winds and master of lightning warfare',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: "storm.png",
        personality: 'Dynamic and unpredictable like a storm, her mood changes rapidly. She is strategic but adaptive, adjusting her plans on the fly. She has an electric energy that inspires her troops. She can be both calm and calculating as well as furious and destructive. She values freedom and the ability to constantly change.',
        physicalAppearance: 'Tall and thin with a presence that seems to occupy more space than she actually has. Silver hair that moves as if in constant wind, with strands that glow with static electricity. Bright white eyes that seem to reflect the power of storms. Wears mage robes with elegant tunic and magical cape that waves in the winds, adorned with elemental power symbols and storm runes. Electric sparks occasionally jump between her fingers and her command staff radiates magical power.',
        prompt: 'anime style, beautiful female storm mage general, tall thin build with imposing presence, silver hair moving in constant wind with static electricity glowing strands, bright white glowing eyes reflecting storm power, elegant mage robes with magical flowing cape adorned with elemental power symbols and storm runes, staff of command radiating magical power, electric sparks between fingers, strategic mage expression, fantasy storm kingdom setting, detailed mage outfit with magical elements, flowing magical movement, high quality, detailed face, silver purple and blue color scheme, storm mage aesthetic, lightning and wind magic effects',
        additionalData: {
            age: 31,
            specialty: 'Lightning warfare, tactical mobility and weather control',
            favoriteWeapon: 'Electric lance and wind shield',
            background: 'Born during a perfect storm, blessed by the winds',
            fears: 'Being trapped and losing her freedom of movement',
            hobbies: 'Flying with the winds and studying weather patterns',
            relationships: 'Close battle companion with Thunder, they complement each other\'s styles'
        }
    },
    {
        id: 'thunder',
        name: 'Thunder',
        kingdom: 'tempestas',
        description: 'Electric general, warrior fast as lightning and powerful as the tempest',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 9,
        imageUrl: "thunder.png",
        personality: 'Fast in both thought and action, always on the move. She is direct and straightforward, preferring action over words. She has a quick and sharp sense of humor. Although she seems impatient, she is extremely loyal and fiercely protects her allies. Her energy is contagious but can be exhausting.',
        physicalAppearance: 'Agile and athletic, with short electric yellow hair, shaved on the sides with the top in pointed spikes like lightning bolts, glowing with static energy. Bright blue eyes that seem to emit light. Skin with a slight glow suggesting contained energy. Wears light warrior armor designed for melee combat and speed, with strategic protective plates, twin electric swords on her back and lightning bow visible. Moves with almost supernatural grace, leaving a trail of sparks. Her expression is happy and smug, with an arrogant smile showing absolute confidence in her abilities.',
        prompt: 'anime style, beautiful female thunder warrior general, agile athletic build, short electric yellow hair with shaved sides, spiky top with pointed spikes like lightning bolts, static energy glow, bright blue eyes emitting light, skin with slight glow suggesting contained energy, light warrior armor designed for melee combat and speed, strategic protective plates, twin electric swords on back, lightning bow visible, supernatural graceful movement, spark trail, happy smug confident expression, arrogant smirk showing absolute confidence, fantasy storm kingdom setting, detailed warrior combat armor, dynamic speed combat pose, high quality, detailed face, yellow blue and white color scheme, thunder warrior aesthetic, electric combat effects',
        additionalData: {
            age: 26,
            specialty: 'Fast attacks, extreme speed and electric combat',
            favoriteWeapon: 'Twin electric swords and lightning bow',
            background: 'Struck by lightning in her youth, gained her electric powers',
            fears: 'Being too slow and not being able to protect in time',
            hobbies: 'Running at extreme speeds and competing in races',
            relationships: 'Close companion of Storm, they form a lethal team together'
        }
    },
    // Kingdom 4 - Umbra (Shadow) - 3 generals
    {
        id: 'shadow',
        name: 'Shadow',
        kingdom: 'umbra',
        description: 'Shadow general, stealthy assassin and master of stealth',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 11,
        imageUrl: "shadow.png",
        personality: 'Silent and lethal, she rarely speaks but her actions speak for themselves. She is patient and meticulous, waiting for the perfect moment to strike. She has a dark and subtle sense of humor. Although she seems ruthless, she has a strict code of honor and only kills when necessary. She is extremely loyal but keeps her emotions hidden.',
        physicalAppearance: 'Thin and agile, she almost seems to fade into the shadows. Midnight black hair that blends with darkness. Dark eyes that seem to absorb light. Wears dark clothing and light armor designed for stealth, with multiple pockets for hidden weapons. Moves without making a sound, like a ghost. Her presence is barely perceptible until she decides to reveal herself.',
        prompt: 'anime style, beautiful female shadow assassin general, thin agile build almost fading into shadows, midnight black hair blending with darkness, dark eyes absorbing light, dark clothing and light stealth armor with multiple hidden weapon pockets, silent ghost-like movement, barely perceptible presence, mysterious lethal expression, fantasy shadow kingdom setting, detailed stealth armor, hidden pose, high quality, detailed face, black and dark purple color scheme, shadow aesthetic, stealth effects',
        additionalData: {
            age: 28,
            specialty: 'Assassinations, infiltration and nocturnal guerrilla warfare',
            favoriteWeapon: 'Twin shadow daggers and shurikens',
            background: 'Orphan raised by the assassins\' brotherhood',
            fears: 'Being discovered and losing her stealth ability',
            hobbies: 'Practicing stealth and studying poisons',
            relationships: 'Maintains distance with everyone, respected but feared'
        }
    },
    {
        id: 'night',
        name: 'Night',
        kingdom: 'umbra',
        description: 'Night general, elite assassin who eliminates high-value targets in darkness',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 11,
        imageUrl: "night.png",
        personality: 'Lethal and sophisticated assassin who operates in the highest circles of society. She is cold and calculating, eliminating targets with surgical precision. She prefers to work alone and rarely shows emotion, but has a strict code of honor. She is extremely professional and efficient, treating each assassination as a work of art. Although she seems ruthless, she only accepts contracts she considers justified.',
        physicalAppearance: 'Elegant and lethal, with dark purple hair gathered in an elaborate hairstyle that conceals weapons. Deep violet eyes that seem to see through lies. Pale moon-like skin. Wears elegant high-society dark clothing that conceals multiple lethal weapons. Moves with feline grace, each movement calculated and precise. Her presence is sophisticated but dangerous, like a rose with thorns.',
        prompt: 'anime style, beautiful female elite assassin general, elegant lethal appearance, dark purple hair in elaborate updo hiding weapons, deep violet eyes seeing through lies, pale moon-like skin, elegant high-society dark clothing concealing multiple lethal weapons, feline graceful movement, calculated precise motions, sophisticated dangerous presence like thorned rose, cold professional expression, fantasy shadow kingdom setting, detailed elegant assassin outfit, poised ready stance, high quality, detailed face, purple black and violet color scheme, elite assassin aesthetic, shadow effects',
        additionalData: {
            age: 30,
            specialty: 'Elite assassinations, high-value target elimination and high society infiltration',
            favoriteWeapon: 'Elegant poisoned daggers and silk garrote',
            background: 'Fallen noble who became a professional assassin after losing her title',
            fears: 'Being discovered and losing her secret identity',
            hobbies: 'Collecting exotic poisons and attending high society events',
            relationships: 'Maintains professional distance, respected but feared for her lethal efficiency'
        }
    },
    {
        id: 'dark',
        name: 'Dark',
        kingdom: 'umbra',
        description: 'Darkness general, spectral warrior who commands shadow forces from the realm of the dead',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 9,
        imageUrl: "dark.png",
        personality: 'Mysterious and reserved, she guards the deepest secrets of the kingdom. She is loyal to the death to her cause and ruthless with enemies. She has an intimidating presence that inspires both respect and fear. Although she seems somber, she has an unbreakable sense of duty. She is patient and can wait years to execute a plan.',
        physicalAppearance: 'Imposing and spectral, with jet black hair that seems to be made of pure darkness and partially fades like a ghost. Completely black eyes without visible pupils that glow with spectral energy. Pale moon-like skin with a translucent effect that reveals her spectral nature. Wears dark warrior armor ornamented with shadow power symbols, partially transparent with spectral effects, spectral shadow sword and darkness shield visible. A cape that seems to be made of shadows and spectral energy flows around her. Her presence makes shadows lengthen and the air turn cold as death.',
        prompt: 'anime style, beautiful female spectral warrior general, imposing ghostly appearance, jet black hair made of pure darkness partially fading like a ghost, completely black eyes without visible pupils glowing with spectral energy, pale moon-like translucent skin revealing spectral nature, dark ornate warrior armor with shadow power symbols, partially transparent with spectral effects, spectral shadow sword and darkness shield visible, shadow and spectral energy made cape flowing around her, presence making shadows lengthen and air turn cold as death, intimidating mysterious spectral expression, fantasy shadow kingdom setting, detailed spectral warrior armor, powerful ghostly warrior pose, high quality, detailed face, black dark gray and ethereal blue color scheme, spectral warrior aesthetic, shadow manipulation and ghost effects, semi-transparent spectral glow',
        additionalData: {
            age: 35,
            specialty: 'Spectral combat, command of shadow forces and warfare from the spiritual plane',
            favoriteWeapon: 'Shadow sword and darkness shield',
            background: 'Ancestral guardian of the kingdom\'s secrets, hereditary position',
            fears: 'That the kingdom\'s secrets will be revealed',
            hobbies: 'Protecting secret archives and practicing dark magic',
            relationships: 'Maintains distance with everyone, only responds to the shadow council'
        }
    }
];
