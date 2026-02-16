import type { ComponentType } from 'react'

export interface AppManifest {
  id: string
  name: string
  description: string
  icon?: string
  type?: 'game-mode' | 'app'
  /** Si es true, se muestra la etiqueta "Legacy" en el selector de apps */
  legacy?: boolean
}

export interface AppRegistration {
  manifest: AppManifest
  Component: ComponentType<{ appId: string }>
  /** Optional component rendered in the main menu when this app is active (e.g. "New game", "Clear save"). */
  MenuOptions?: ComponentType<{ appId: string }>
}
