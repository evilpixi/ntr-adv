# Imágenes para la app (GitHub Pages / build)

Estas carpetas deben contener las imágenes que usa la app. Sin ellas, en GitHub Pages saldrán 404 al cargar reinos y generales.

## Reinados (`kingdoms/`)

Añade estos archivos **JPG** (nombres en minúsculas):

| Archivo        | Reino   |
|----------------|---------|
| `adeh.jpg`     | Adeh    |
| `glacia.jpg`   | Glacia  |
| `ignis.jpg`    | Ignis   |
| `tempestas.jpg`| Tempestas |
| `umbra.jpg`    | Umbra   |

## Generales (`generals/`)

Añade estos archivos **PNG** (nombres en minúsculas):

| Archivo     | Uso |
|-------------|-----|
| `aria.png`  | Heroína Aria |
| `zara.png`  | Heroína Zara |
| `sakura.png`| Heroína Sakura |
| `aelia.png` | Avatar jugador (género femenino) |
| `auro.png`  | Avatar jugador (género masculino) |
| `aether.png`| Avatar jugador (género no binario) |

Vite copia todo lo que está en `public/` a la raíz de `dist/`, así que con la base `/ntr-adv/` las URLs quedarán como `https://evilpixi.github.io/ntr-adv/images/kingdoms/ignis.jpg`, etc.
