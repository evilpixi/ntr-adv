// Kingdoms Configuration
// Edit this array to define the game's kingdoms
// Each kingdom can have an optional imageUrl to display an image

export const kingdoms = [
    {
        id: 'adeh',
        name: 'Adeh',
        theme: 'royal',
        description: 'The royal kingdom, center of power and balance in the world',
        color: '#ffd700',
        owner: 'player',
        provinces: 7,
        imageUrl: "/images/kingdoms/adeh.jpg",
        architecturalStyle: 'Classical imperial architecture with large white and gold marble palaces, Corinthian columns, triumphal arches and royal gardens. Structures combine elegance and power, with vaulted ceilings, colorful stained glass and monumental statues representing the kingdom\'s glory.',
        biome: 'Fertile plains and temperate forests with winding rivers, gentle hills and green valleys. The climate is moderate with well-defined seasons, ideal for agriculture and human settlement.',
        governmentType: 'Constitutional monarchy with a council of nobles and provincial representatives. The king or queen rules with the support of a senate that ensures balance between the different regions of the kingdom.',
        socialDescription: 'Class-structured society but with social mobility. Citizens value justice, honor and loyalty. Education is accessible and the arts flourish. There is a strong sense of national identity and pride in royal tradition, while maintaining openness to trade and diplomacy with other kingdoms.'
    },
    {
        id: 'glacia',
        name: 'Glacia',
        theme: 'ice',
        description: 'Kingdom of eternal ice, where freezing winds blow ceaselessly and snow never melts',
        color: '#4a9eff',
        owner: 'ai',
        provinces: 3,
        imageUrl: "/images/kingdoms/glacia.jpg",
        architecturalStyle: 'Ice and crystal fortresses carved directly into glaciers, with pointed towers rising like stalactites. Structures are made of magical ice that never melts, with crystal bridges and translucent domes that reflect sunlight ethereally. Interiors are decorated with ice sculptures and frozen geometric patterns.',
        biome: 'Arctic tundra and perpetual glaciers with snow-capped mountains, infinite ice fields and frozen lakes. The climate is extremely cold, with frequent blizzards and aurora borealis that illuminate polar nights. Vegetation is scarce, limited to cold-resistant lichens and mosses.',
        governmentType: 'Frozen theocracy ruled by a Great Council of Ice Elders. Decisions are made by consensus and governed by ancient traditions that honor the winter spirits. Leadership is based on wisdom and connection to the frozen forces.',
        socialDescription: 'Resilient and united society that has learned to thrive in extreme conditions. Inhabitants value resilience, wisdom and patience. The community is highly cohesive, sharing resources and knowledge to survive. There is deep respect for nature and ancestral traditions. Ice magic is an integral part of their culture and way of life.'
    },
    {
        id: 'ignis',
        name: 'Ignis',
        theme: 'fire',
        description: 'Volcanic kingdom where lava flows like rivers and fire is the essence of life',
        color: '#ff4a4a',
        owner: 'ai',
        provinces: 3,
        imageUrl: "/images/kingdoms/ignis.jpg",
        architecturalStyle: 'Cities built on and around active volcanoes, with black obsidian and volcanic rock structures. Buildings have organic and fluid shapes, with curved roofs that mimic lava flow. Forges and foundries are integrated into the architecture, with lava channels lighting the streets. Temples have perpetual fire altars and solidified magma columns.',
        biome: 'Volcanic lands with active lava fields, smoking volcanic mountains and ash deserts. The soil is fertile near volcanoes but arid in more distant areas. Geysers and fumaroles are common. The climate is warm and dry, with skies tinged orange and red by constant eruptions.',
        governmentType: 'Military dictatorship led by a Fire Lord who rules with an iron fist. Power is concentrated in the strongest warriors and master smiths. Decisions are quick and direct, with no room for dissent. The hierarchy is based on strength and the ability to master fire.',
        socialDescription: 'Aggressive and passionate society that values strength, courage and determination. Inhabitants are natural warriors, proud of their heat resistance and mastery of fire. Forging and war are the most respected professions. There is a culture of constant competition and demonstration of power. Loyalty is fierce but can also change quickly if someone proves stronger. Life is intense and ephemeral, celebrating every moment with passion.'
    },
    {
        id: 'tempestas',
        name: 'Tempestas',
        theme: 'storm',
        description: 'Kingdom of eternal storms, where lightning illuminates the sky and winds roar with fury',
        color: '#9b59b6',
        owner: 'ai',
        provinces: 4,
        imageUrl: "/images/kingdoms/tempestas.jpg",
        architecturalStyle: 'Towering towers that rise to the clouds, built to channel and resist storms. Buildings have aerodynamic shapes with pointed roofs and ornamental lightning rods. Structures are made of conductive materials that glow with electrical energy. Floating palaces are suspended by magnetic fields, and cities are connected by bridges that cross hurricane-force winds.',
        biome: 'Plains battered by constant winds, steep mountains where storms concentrate, and perpetually cloudy skies. Frequent lightning illuminates the landscape, and winds can reach destructive speeds. Vegetation is wind-resistant, with twisted trees and plants that cling to the ground. Torrential rains are common, creating rivers that constantly change course.',
        governmentType: 'Elective republic where leaders are chosen for their ability to control storms and predict winds. A council of tempest masters governs, making quick and adaptive decisions like the storms themselves. Power changes frequently, reflecting the unpredictable nature of the weather.',
        socialDescription: 'Dynamic and adaptable society that values flexibility, innovation and the ability to change. Inhabitants are nomads in spirit, accustomed to quickly adapting to changing conditions. Storm magic is part of daily life, used for energy, transportation and communication. There is deep respect for the unpredictable and powerful nature. Society is egalitarian but competitive, where each must constantly prove their worth. Music and arts reflect the chaos and beauty of storms.'
    },
    {
        id: 'umbra',
        name: 'Umbra',
        theme: 'shadow',
        description: 'Kingdom of deep shadows, where darkness reigns and secrets hide in twilight',
        color: '#2c3e50',
        owner: 'ai',
        provinces: 4,
        imageUrl: "/images/kingdoms/umbra.jpg",
        architecturalStyle: 'Underground cities and structures emerging from darkness, built with light-absorbing materials. Buildings have angular and shadowy forms, with secret passages and hidden chambers. Architecture prioritizes stealth and defense, with high walls, hidden doors and invisible surveillance systems. Palaces are wrapped in magical shadows that change shape, and streets are lit only by faint lights that create more shadows than clarity.',
        biome: 'Lands in perpetual twilight with dark forests of tall trees that block sunlight, deep caves and shadowy valleys. The sky is constantly cloudy, and thick fog envelops the landscape. Vegetation is dark and twisted, adapted to lack of light. Rivers flow silently among shadows, and animals are nocturnal and stealthy.',
        governmentType: 'Secret oligarchy ruled by a shadow council that operates from the depths. True power is hidden, and decisions are made in darkness. There is a complex network of spies, assassins and agents that maintain order. The government is efficient but ruthless, eliminating any threat before it manifests.',
        socialDescription: 'Closed and mysterious society that values secrecy, discretion and hidden knowledge. Inhabitants are distrustful but loyal to their inner circle. Information is power, and espionage and intrigue are part of the culture. There is a strict hierarchy based on knowledge of secrets and the ability to keep them. Shadow magic is feared and respected. Society is highly organized but apparently chaotic from outside. Rituals and traditions are performed in secret, and the true nature of the kingdom remains hidden to outsiders.'
    }
];
