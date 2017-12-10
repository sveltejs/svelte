import Node from './shared/Node';

export default class Ref extends Node {
	name: string;
	value: Node[]
	expression: Node
}