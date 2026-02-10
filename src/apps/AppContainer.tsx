import { getApp } from './index'

interface AppContainerProps {
  appId: string
}

export function AppContainer({ appId }: AppContainerProps) {
  const app = getApp(appId)
  if (!app) {
    return (
      <div style={{ padding: 'var(--space-lg)', color: 'var(--color-error)' }}>
        App no encontrada: {appId}
      </div>
    )
  }
  const { Component } = app
  return (
    <div className="app-view" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Component appId={appId} />
    </div>
  )
}
