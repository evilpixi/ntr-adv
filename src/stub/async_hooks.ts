/**
 * Stub for node:async_hooks in the browser.
 * LangGraph uses AsyncLocalStorage for context; this minimal impl runs callbacks without propagating context.
 */
export class AsyncLocalStorage<T> {
  run(_store: T, callback: () => void): void {
    callback()
  }
  getStore(): T | undefined {
    return undefined
  }
  enterWith(_store: T): void {}
}
