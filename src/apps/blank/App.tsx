import type { ComponentType } from 'react'

/**
 * App vacía con el estilo de la aplicación (tokens, tipografía, espaciado).
 * Lista para añadir tu lógica y componentes.
 */
const BlankApp: ComponentType<{ appId: string }> = () => (
  <div className="app-blank-page">
    <h2 className="section-title">Mi App</h2>
    <p className="app-blank-intro">
      Contenido listo para programarse. Usa los mismos tokens y clases que el resto de la app
      (<code>--color-*</code>, <code>.btn</code>, <code>.section-title</code>, etc.).
    </p>
  </div>
)

export default BlankApp
