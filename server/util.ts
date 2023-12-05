export function useContext(): GlobalContext {
    return globalThis.context as GlobalContext;
}

export function setContext<T extends keyof GlobalContext>(key: T, value: GlobalContext[T]) {
    globalThis.context[key] = value;
}
