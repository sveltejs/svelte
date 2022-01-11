export interface ActionReturn<Parameters = any> {
	update?: (parameters: Parameters) => void;
	destroy?: () => void;
}

export interface Action<Parameters = any> {
	(node: HTMLElement, parameters: Parameters): ActionReturn<Parameters>;
}
