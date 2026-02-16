/**
 * Stub for node:async_hooks in the browser.
 * LangGraph/LangChain use AsyncLocalStorage to pass state between nodes; getStore() must
 * return the value passed to run() so the graph can route and merge state correctly.
 */
let currentStore: unknown = undefined

export class AsyncLocalStorage<T> {
  run(store: T, callback: () => void | Promise<void>): void {
    const prev = currentStore
    currentStore = store
    try {
      const result = callback()
      if (result != null && typeof (result as Promise<unknown>).then === 'function') {
        const p = result as Promise<void>
        p.then(
          () => { currentStore = prev },
          () => { currentStore = prev }
        )
      } else {
        currentStore = prev
      }
    } catch (e) {
      currentStore = prev
      throw e
    }
  }

  getStore(): T | undefined {
    return currentStore as T | undefined
  }

  enterWith(store: T): void {
    currentStore = store
  }
}
