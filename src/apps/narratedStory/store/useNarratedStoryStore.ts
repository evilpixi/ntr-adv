/**
 * React hook to subscribe to the Narrated Story store. Re-renders when state changes.
 */
import { useState, useEffect } from 'react'
import { narratedStoryStore } from './store'
import type { NarratedStoryState } from './types'

export function useNarratedStoryStore(): NarratedStoryState {
  const [state, setState] = useState<NarratedStoryState>(() => narratedStoryStore.getState())

  useEffect(() => {
    setState(narratedStoryStore.getState())
    return narratedStoryStore.subscribe(setState)
  }, [])

  return state
}

export { narratedStoryStore }
