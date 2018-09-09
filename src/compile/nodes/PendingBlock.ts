import Node from './shared/Node';
import Block from '../dom/Block';
import mapChildren from './shared/mapChildren';

export default class PendingBlock extends Node {
	block: Block;
	children: Node[];

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.children = mapChildren(component, parent, scope, info.children);

		this.warnIfEmptyBlock();
	}
}