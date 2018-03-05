interface Options {
	immutable: boolean;
}

interface ObserveOptions {
	defer: boolean;
	init: boolean;
}

interface Cancellable {
	cancel: () => void;
}

export declare class Store<State> {
	constructor(state: State, options?: Options);

	public compute(key: string, dependencies: string[]): void;
	public get(): State;
	public get<T>(key: string): T;
	public observe<T>(key: string, callback: (value: T) => any, options?: ObserveOptions): Cancellable;
	public onchange(callback: (state: State) => any): Cancellable;
	public set(state: State);
}
