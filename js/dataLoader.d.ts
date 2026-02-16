export const gameData: {
  loaded: boolean
  load(): Promise<void>
  getKingdoms(): unknown[]
  getGenerals(): unknown[]
  getProvinces(): Record<string, unknown[]>
  getKingdomById(id: string): unknown
  getGeneralsByKingdom(kingdomId: string): unknown[]
  getProvinceNames(kingdomId: string): string[]
  getProvinceInfo(kingdomId: string, index: number): unknown
  getProvinceDescription(kingdomId: string, index: number): string | null
  getProvincePrompt(kingdomId: string, index: number): string | null
  getKingdomsImage(kingdomId: string): string | null
  getGeneralsImage(generalId: string): string | null
  getProvincesImage(kingdomId: string, index: number): string | null
}
