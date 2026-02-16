import type { AppRegistration } from './types'

const registry = new Map<string, AppRegistration>()

export function registerApp(registration: AppRegistration): void {
  if (registry.has(registration.manifest.id)) {
    console.warn(`App ${registration.manifest.id} already registered. Overwriting.`)
  }
  registry.set(registration.manifest.id, registration)
}

export function getAvailableApps(): AppRegistration[] {
  return Array.from(registry.values())
}

export function getApp(appId: string): AppRegistration | null {
  return registry.get(appId) ?? null
}

export function isAppRegistered(appId: string): boolean {
  return registry.has(appId)
}
