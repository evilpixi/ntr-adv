# Tema - Estilo reutilizable

Estilo medieval minimalista, azules oscuros. Para mantener consistencia en todo el proyecto:

1. **Variables**: usar siempre `var(--nombre)` en lugar de valores fijos.
   - Colores: `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, etc.
   - Espaciado: `--space-xs` a `--space-2xl`.
   - Tipografía: `--font-sans`, `--font-display`, `--font-size-*`, `--line-height-*`.
   - Bordes: `--radius-sm/md/lg`, `--border-width`.
   - Transiciones: `--transition-fast`, `--transition-normal`.

2. **Clases**: usar las clases de `components.css` cuando apliquen.
   - Botones: `.btn`, `.btn-primary`, `.btn-ghost`
   - Superficies: `.card`
   - Formularios: `.input`, `.select`, `.label`
   - Títulos: `.section-title`

3. **Nuevos componentes**: definir estilos en su propio `.css` importando solo lo necesario; usar las variables del tema en lugar de colores o tamaños fijos.

4. **Cambiar el tema**: editar `tokens.css`; el resto del proyecto se adapta.

5. **Iconos (medieval / fantasía)**: librería Game Icons (react-icons/gi), disponible en todo el proyecto:
   ```ts
   import { GiSword, GiDragonHead, GiScrollQuill, GiCastle } from '@/theme/icons'
   ```
   Catálogo: https://react-icons.github.io/react-icons/icons/gi/
