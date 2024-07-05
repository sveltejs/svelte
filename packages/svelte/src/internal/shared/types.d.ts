export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

export type SourceLocation =
	| [line: number, column: number]
	| [line: number, column: number, SourceLocation[]];
