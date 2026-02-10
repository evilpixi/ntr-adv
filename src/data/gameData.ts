/**
 * Game data layer for React apps.
 * Re-exports the legacy gameData singleton and image/helper APIs so Data Library
 * and Classic can use the same data without duplicating load logic.
 */
import { useEffect, useState } from 'react'
import { gameData as loader } from '../../js/dataLoader.js'
import {
  getKingdomById,
  getGeneralsByKingdom,
  getProvinceNames,
  getProvinceInfo,
  getProvinceDescription,
  getProvincePrompt,
  getKingdomsImage,
  getGeneralsImage,
  getProvincesImage,
  getKingdomImage,
  getGeneralImage,
  getProvinceImage,
} from '../../js/config.js'

export const gameData = loader

export {
  getKingdomById,
  getGeneralsByKingdom,
  getProvinceNames,
  getProvinceInfo,
  getProvinceDescription,
  getProvincePrompt,
  getKingdomsImage,
  getGeneralsImage,
  getProvincesImage,
  getKingdomImage,
  getGeneralImage,
  getProvinceImage,
}

export interface UseGameDataResult {
  loaded: boolean
  error: Error | null
  gameData: typeof loader
}

/**
 * Ensures game data is loaded and exposes the loader. Use in Data Library and Classic.
 */
export function useGameData(): UseGameDataResult {
  const [loaded, setLoaded] = useState(loader.loaded)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (loader.loaded) {
      setLoaded(true)
      return
    }
    loader
      .load()
      .then(() => setLoaded(true))
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
  }, [])

  return { loaded, error, gameData: loader }
}
