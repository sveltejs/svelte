import Node from './shared/Node';

export default class Transition extends Node {
	name: string;
	value: Node[]
	expression: Node
}