import Node from './shared/Node';

export default class Action extends Node {
	name: string;
	value: Node[]
	expression: Node
}