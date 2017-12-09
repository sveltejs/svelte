import Node from './shared/Node';

export default class Binding extends Node {
	name: string;
	value: Node[]
	expression: Node
}