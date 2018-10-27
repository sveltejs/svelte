interface Options {
	immutable: boolean;
}

interface Cancellable {
	cancel: () => void;
}

type State = Record<string, any>;

export declare class Store {
	constructor(state: State, options?: Options);

	public compute(key: string, dependencies: string[]): void;
	public fire(name: string, data?: any): void;
	public get(): State;
	public on(name: string, callback: (data: any) => void): Cancellable;
	public set(state: State);
}
