export interface GameOptions {
  rootElement?: HTMLElement
}

export class Game {
  constructor(options?: GameOptions)
  initializeGame(gameModeId?: string): Promise<void>
  renderAll(): Promise<void>
  destroy(): void
}
