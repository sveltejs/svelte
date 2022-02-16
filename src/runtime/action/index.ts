export interface ActionReturn<Parameter = any> {
	update?: (parameter: Parameter) => void;
	destroy?: () => void;
}

export interface Action<Element = HTMLElement, Parameter = any> {
	<Node extends Element>(node: Node, parameter?: Parameter): void | ActionReturn<Parameter>;
}
