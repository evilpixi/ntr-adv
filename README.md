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

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional, para desarrollo)
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

2. Copia el archivo de ejemplo de variables de entorno:
```bash
cp .env.example .env
```

3. Edita el archivo `.env` y agrega tus API keys:
```env
OPENAI_API_KEY=tu_api_key_aqui
# O el servicio de IA que prefieras usar
```

4. Abre `index.html` en tu navegador o usa un servidor local:
```bash
# Con Python
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Con PHP
php -S localhost:8000
```

5. Accede a `http://localhost:8000` en tu navegador

## ⚙️ Configuración

### Configuración de Reinos y Generales

Edita el archivo `js/config.js` para definir:
- Los reinos y sus provincias
- Las generales y sus estadísticas iniciales
- La configuración de prompts para la IA

Ejemplo:
```javascript
export const KINGDOMS = [
  { id: 'player', name: 'Tu Reino', owner: 'player', provinces: 7 },
  { id: 'kingdom1', name: 'Reino Norte', owner: 'ai', provinces: 2 },
  // ...
];

export const GENERALS = [
  { 
    id: 'gen1', 
    name: 'General A', 
    kingdom: 'player', 
    hp: 100, 
    love: 50, 
    strength: 10 
  },
  // ...
];
```

### Configuración de IA

En `js/config.js` puedes configurar:
- El servicio de IA por defecto
- Los modelos a usar
- Las plantillas de prompts
- Los parámetros de generación

## 🎯 Cómo Jugar

1. **Inicio**: El juego comienza generando una historia inicial usando IA
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
├── README.md           # Este archivo
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos del juego
└── js/
    ├── config.js       # Configuración de reinos y generales
    ├── gameState.js    # Gestión del estado del juego
    ├── combat.js       # Sistema de combate
    ├── ai.js           # IA de decisión enemiga
    ├── aiIntegration.js # Integración con LLMs
    └── game.js         # Lógica principal del juego
```

## 🔧 Desarrollo

### Branches

- `main`: Branch principal con código estable
- `dev`: Branch de desarrollo

### Agregar Nuevos Reinos o Generales

1. Edita `js/config.js`
2. Agrega el reino o general a los arrays correspondientes
3. Recarga el juego

### Personalizar Prompts de IA

Edita `PROMPT_TEMPLATE` en `js/config.js` para cambiar cómo se genera la narrativa.

## 🐛 Solución de Problemas

### La IA no genera historias

- Verifica que tu API key esté correctamente configurada en `.env`
- Asegúrate de que el servicio de IA esté disponible
- Revisa la consola del navegador para errores

### El juego no carga

- Verifica que todos los archivos estén en su lugar
- Asegúrate de usar un servidor web (no solo abrir el HTML directamente)
- Revisa la consola del navegador para errores

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
