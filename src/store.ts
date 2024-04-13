export type Store<T> = {
  get: () => T;
  set: (newState: T) => void;
  subscribe: (listener: (state: T) => void) => () => void;
  // TODO: maybe i'll want a `listen` that doesn't call the listener immediately
};

export function createStore<T>(initialState: T): Store<T> {
  let listeners = new Set<(state: T) => void>();
  let state = initialState;
  return {
    get() {
      return state;
    },
    set(newState: T) {
      state = newState;
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener: (state: T) => void) {
      listener(state);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
