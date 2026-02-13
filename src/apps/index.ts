import { registerApp } from './registry'
import TemplateApp from './_template/App'
import NarratedStoryApp from './narratedStory/App'
import NarratedStoryMenuOptions from './narratedStory/NarratedStoryMenuOptions'
import CardGameApp from './cardgame/App'
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
    id: 'narrated-story',
    name: 'NTR Narrated Story',
    description: 'Roleplay your fantasies with the AI.',
    type: 'app',
  },
  Component: NarratedStoryApp,
  MenuOptions: NarratedStoryMenuOptions,
})

registerApp({
  manifest: {
    id: 'cardgame',
    name: 'Card Game',
    description: 'Juego de cartas TCG: héroes, magia, objetos y soldados.',
    type: 'app',
  },
  Component: CardGameApp,
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
