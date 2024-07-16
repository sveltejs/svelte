export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

export type SourceLocation =
	| [line: number, column: number]
	| [line: number, column: number, SourceLocation[]];

export type Getters<T> = {
	[K in keyof T]: () => T[K];
};

export type Snapshot<T> = ReturnType<typeof $state.snapshot<T>>;
