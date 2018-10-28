interface Options {
	immutable: boolean;
}

interface Cancellable {
	cancel: () => void;
}

interface Tuple<T extends any, L extends number> extends Array<T> {
	0: T;
	length: L;
}

type State = Record<string, any>;

export declare class Store {
	constructor(state: State, options?: Options);

	public compute<L extends number>(
		key: string,
		dependencies: Tuple<string, L>,
		fn: (...dependencies: Tuple<any, L>) => any,
	): void;

	public fire(name: string, data?: any): void;
	public get(): State;
	public on(name: string, callback: (data: any) => void): Cancellable;
	public set(state: State): void;
}
