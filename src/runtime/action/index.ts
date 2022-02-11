export interface ActionReturn<Parameters = any> {
	update?: (parameters: Parameters) => void;
	destroy?: () => void;
}

export interface Action<Element = HTMLElement, Parameters = any> {
	<Node extends Element>(node: Node, parameters?: Parameters): void | ActionReturn<Parameters>;
}
