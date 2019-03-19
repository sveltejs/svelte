import Node from './shared/Node';
import Block from '../render-dom/Block';
import map_children from './shared/map_children';

export default class ElseBlock extends Node {
	type: 'ElseBlock';
	children: Node[];
	block: Block;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.children = map_children(component, this, scope, info.children);

		this.warn_if_empty_block();
	}
}