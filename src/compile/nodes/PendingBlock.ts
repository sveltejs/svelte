import Node from './shared/Node';
import Block from '../render-dom/Block';
import map_children from './shared/map_children';

export default class PendingBlock extends Node {
	block: Block;
	children: Node[];

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.children = map_children(component, parent, scope, info.children);

		this.warn_if_empty_block();
	}
}