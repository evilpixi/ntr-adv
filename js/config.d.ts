export function getKingdomById(id: string): unknown
export function getGeneralsByKingdom(kingdomId: string): unknown[]
export function getProvinceNames(kingdomId: string): string[]
export function getProvinceInfo(kingdomId: string, index: number): unknown
export function getProvinceDescription(kingdomId: string, index: number): string | null
export function getProvincePrompt(kingdomId: string, index: number): string | null
export function getKingdomsImage(kingdomId: string): string | null
export function getGeneralsImage(generalId: string): string | null
export function getProvincesImage(kingdomId: string, index: number): string | null
export function getKingdomImage(kingdomId: string): string | null
export function getGeneralImage(generalId: string): string | null
export function getProvinceImage(kingdomId: string, index: number): string | null
