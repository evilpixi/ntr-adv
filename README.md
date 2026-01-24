# NTR Adventure - Juego de Estrategia

Un juego web de aventura gráfica basado en texto con sistema de reinos, generales y conquista. Combina estrategia, narrativa generada por IA y mecánicas de captura y esclavización.

## 🎮 Características

- **Sistema de Reinos**: 5 reinos en total, cada uno con sus propias provincias y generales
- **Generales**: Cada reino tiene entre 1 y 5 generales femeninas con estadísticas únicas
- **Sistema de Combate**: Batallas estratégicas entre generales
- **Captura y Esclavización**: Las generales derrotadas pueden ser capturadas y esclavizadas
- **Narrativa Generada por IA**: La historia se genera dinámicamente usando LLMs
- **IA Enemiga**: Sistema de IA que toma decisiones estratégicas priorizando objetivos

## 📋 Requisitos

- Node.js (v14 o superior) y npm
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- API keys para al menos uno de los servicios de IA soportados:
  - OpenAI
  - DeepSeek
  - Grok (xAI)
  - Ollama (modelo local)

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd ntr-adv
```

2. Instala las dependencias:
```bash
npm install
```

3. Copia el archivo de ejemplo de variables de entorno:
```bash
cp .env.example .env
```

4. Edita el archivo `.env` y agrega tus API keys:
```env
OPENAI_API_KEY=tu_api_key_aqui
# O el servicio de IA que prefieras usar
DEFAULT_AI_SERVICE=openai
```

5. Inicia el servidor de desarrollo:
```bash
npm start
```

6. Accede a `http://localhost:3000` en tu navegador

El servidor automáticamente:
- Inyecta las variables de entorno al frontend
- Sirve los archivos estáticos con headers de no-cache
- **Hot Reload**: Recarga automáticamente la página cuando detecta cambios en archivos JS, CSS, HTML o data/
- Observa cambios en tiempo real usando Server-Sent Events

### Hot Reload

El servidor incluye hot reload automático:
- Detecta cambios en archivos `.js`, `.css`, `.html` y archivos en `data/`
- Recarga automáticamente la página en el navegador
- No necesitas refrescar manualmente después de hacer cambios
- Los archivos se sirven con headers de no-cache para evitar problemas de caché

## ⚙️ Configuración

La configuración del juego está organizada en módulos dentro del directorio `data/` para facilitar la personalización.

### Estructura de Configuración

```
data/
├── kingdoms.js      # Configuración de reinos
├── generals.js      # Configuración de generales
├── provinces.js     # Nombres y configuración de provincias
├── game-rules.js    # Reglas y balance del juego
├── ai-config.js     # Configuración de IA y prompts
└── index.js         # Exportador centralizado y validador
```

### Configuración de Reinos

Edita `data/kingdoms.js` para definir los reinos:

```javascript
export const kingdoms = [
    {
        id: 'player',
        name: 'Tu Reino',
        owner: 'player',
        provinces: 7,
        imageUrl: 'https://example.com/images/player-kingdom.jpg' // opcional
    },
    // ...
];
```

### Configuración de Generales

Edita `data/generals.js` para definir las generales:

```javascript
export const generals = [
    {
        id: 'player_gen1',
        name: 'Aria',
        kingdom: 'player',
        hp: 100,
        maxHp: 100,
        love: 50,
        strength: 10,
        imageUrl: 'https://example.com/images/aria.jpg' // opcional
    },
    // ...
];
```

### Configuración de Provincias

Edita `data/provinces.js` para personalizar nombres e imágenes de provincias:

```javascript
export const provinceNames = {
    player: [
        { name: 'Capital Real', imageUrl: null },
        { name: 'Provincia Norte', imageUrl: 'https://...' },
        // ...
    ],
    // ...
};
```

### Imágenes

Todas las entidades (reinos, generales, provincias) pueden tener una `imageUrl` opcional:
- Si se proporciona una URL válida, se mostrará la imagen
- Si no se proporciona o la imagen falla al cargar, se mostrará un placeholder automático
- Las URLs pueden ser:
  - URLs HTTP/HTTPS: `https://example.com/image.jpg`
  - Data URIs: `data:image/png;base64,...`
  - Rutas relativas: `/images/kingdom.jpg`

### Configuración de Reglas del Juego

Edita `data/game-rules.js` para ajustar el balance:

```javascript
export const gameRules = {
    provinceMaxHp: 3,
    hpRecoveryOnRest: 20,
    loveIncreaseOnDate: 10,
    // ...
};
```

### Configuración de IA

Edita `data/ai-config.js` para configurar:
- El servicio de IA por defecto
- Los modelos a usar
- Las plantillas de prompts
- Los parámetros de generación

## 🎯 Cómo Jugar

1. **Inicio**: Al iniciar el juego, presiona el botón "Generar Historia Inicial" para crear la narrativa inicial usando IA (esto evita gastar tokens automáticamente)
2. **Asignar Acciones**: Asigna a tus generales acciones como:
   - Atacar provincias enemigas
   - Defender tus provincias
   - Descansar en la capital (recuperar HP)
   - Tener una cita contigo (aumentar amor)
   - Entrenar (aumentar fuerza)
3. **Simulación**: El juego procesa todas las acciones y combates
4. **Resultados**: Se genera una nueva historia basada en los eventos
5. **Repetir**: El ciclo continúa hasta que alguien gane o pierda

### Condiciones de Victoria/Derrota

- **Derrota**: Pierdes si:
  - Te quedas sin generales
  - Tu capital es conquistada
- **Victoria**: Ganas si conquistas todas las capitales enemigas

### Sistema de Captura

- Cuando una general es derrotada, es capturada
- El captor puede:
  - Ponerla en aislamiento (en la provincia)
  - Llevarla a la capital para esclavizarla
- Durante la esclavización, la general pierde amor por turno
- Si el amor llega a 0, se convierte en esclava del captor

## 📁 Estructura del Proyecto

```
ntr-adv/
├── .gitignore          # Exclusiones de Git
├── .env.example        # Plantilla de variables de entorno
├── package.json        # Configuración npm y dependencias
├── server.js           # Servidor de desarrollo
├── README.md           # Este archivo
├── index.html          # Página principal
├── data/               # Configuración modular del juego
│   ├── kingdoms.js     # Configuración de reinos
│   ├── generals.js     # Configuración de generales
│   ├── provinces.js    # Configuración de provincias
│   ├── game-rules.js   # Reglas y balance
│   ├── ai-config.js    # Configuración de IA
│   └── index.js        # Exportador centralizado
├── css/
│   └── style.css       # Estilos del juego
├── js/
│   ├── ui/
│   │   └── imageHelper.js # Helper para manejar imágenes
│   ├── env.js          # Variables de entorno (generado automáticamente)
│   ├── config.js       # Wrapper de compatibilidad (importa desde data/)
│   ├── gameState.js    # Gestión del estado del juego
│   ├── combat.js       # Sistema de combate
│   ├── ai.js           # IA de decisión enemiga
│   ├── aiIntegration.js # Integración con LLMs
│   └── game.js         # Lógica principal del juego
└── scripts/
    └── inject-env.js   # Script para inyectar variables de entorno
```

## 🔧 Desarrollo

### Branches

- `main`: Branch principal con código estable
- `dev`: Branch de desarrollo

### Agregar Nuevos Reinos o Generales

1. Edita `data/kingdoms.js` o `data/generals.js`
2. Agrega el reino o general a los arrays correspondientes
3. Asegúrate de que el `id` sea único
4. Si quieres agregar una imagen, agrega el campo `imageUrl`
5. Recarga el juego

### Agregar Imágenes

Para agregar imágenes a reinos, generales o provincias:

1. **Reinos**: Edita `data/kingdoms.js` y agrega `imageUrl: 'tu-url-aqui'`
2. **Generales**: Edita `data/generals.js` y agrega `imageUrl: 'tu-url-aqui'`
3. **Provincias**: Edita `data/provinces.js` y agrega `imageUrl` en el objeto de la provincia

El juego manejará automáticamente:
- Placeholders cuando no hay imagen
- Errores de carga de imagen
- Imágenes que no están disponibles

### Personalizar Prompts de IA

Edita `promptTemplate` en `data/ai-config.js` para cambiar cómo se genera la narrativa.

## 🐛 Solución de Problemas

### La IA no genera historias

- Verifica que tu API key esté correctamente configurada en `.env`
- Asegúrate de que el servicio de IA esté disponible
- Revisa la consola del navegador para errores

### El juego no carga

- Asegúrate de haber ejecutado `npm install` primero
- Verifica que el servidor esté corriendo con `npm start`
- No abras el HTML directamente, siempre usa el servidor (http://localhost:3000)
- Verifica que el archivo `js/env.js` se haya generado correctamente
- Revisa la consola del navegador para errores

### El servidor no inicia

- Verifica que Node.js esté instalado: `node --version`
- Verifica que npm esté instalado: `npm --version`
- Asegúrate de haber ejecutado `npm install` en el directorio del proyecto
- Verifica que el puerto 3000 no esté en uso

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de modificarlo y usarlo como desees.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

¡Disfruta del juego!
