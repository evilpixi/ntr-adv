import type { ComponentType } from 'react'

const TemplateApp: ComponentType<{ appId: string }> = () => (
  <div style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
    <p className="section-title">Plantilla</p>
    <p style={{ color: 'var(--color-text-muted)' }}>App de ejemplo. Sin Phaser.</p>
  </div>
)

export default TemplateApp
