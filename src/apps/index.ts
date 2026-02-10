import { registerApp } from './registry'
import TemplateApp from './_template/App'
import BlankApp from './blank/App'
import ClassicApp from './classic/App'
import DataLibraryApp from './dataLibrary/App'

registerApp({
  manifest: {
    id: '_template',
    name: 'Plantilla',
    description: 'App de ejemplo para copiar y extender',
    type: 'app',
  },
  Component: TemplateApp,
})

registerApp({
  manifest: {
    id: 'blank',
    name: 'Mi App',
    description: 'App vacía lista para programar, con el estilo de la aplicación',
    type: 'app',
  },
  Component: BlankApp,
})

registerApp({
  manifest: {
    id: 'classic',
    name: 'Classic Mode',
    description: 'Modo de juego clásico con reinos, generales y provincias',
    type: 'game-mode',
    legacy: true,
  },
  Component: ClassicApp,
})

registerApp({
  manifest: {
    id: 'data-library',
    name: 'Biblioteca de Datos',
    description: 'Explora todos los datos de reinos, generales y provincias',
    type: 'app',
    legacy: true,
  },
  Component: DataLibraryApp,
})

export { getAvailableApps, getApp, isAppRegistered } from './registry'
export type { AppManifest, AppRegistration } from './types'
