export interface ActionReturn<Parameters = any> {
	update?: (parameters?: Parameters) => void;
	destroy?: () => void;
}

export interface Action<Parameters = any, Element = HTMLElement> {
	<Node extends Element>(node: Node, parameters?: Parameters): void | ActionReturn<Parameters>;
}
