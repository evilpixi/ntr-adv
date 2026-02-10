export interface GameOptions {
  rootElement?: HTMLElement
}

export class Game {
  constructor(options?: GameOptions)
  initializeGame(gameModeId?: string): Promise<void>
  destroy(): void
}
