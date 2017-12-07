import Node from './shared/Node';

export default class Attribute extends Node {
	name: string;
	value: true | Node[]
	expression: Node
}