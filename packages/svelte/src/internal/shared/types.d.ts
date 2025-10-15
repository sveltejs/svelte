export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

export type Getters<T> = {
	[K in keyof T]: () => T[K];
};

export type Snapshot<T> = ReturnType<typeof $state.snapshot<T>>;

export type MaybePromise<T> = T | Promise<T>;

export type Hydratable<T> = (
	key: string,
	fn: () => T,
	options?: { transport?: Transport<T> }
) => Promise<T>;

export type Transport<T> = {
	stringify: (value: T) => string;
	parse: (value: string) => T;
};
