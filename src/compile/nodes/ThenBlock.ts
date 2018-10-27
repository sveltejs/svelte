import Node from './shared/Node';
import Block from '../render-dom/Block';
import mapChildren from './shared/mapChildren';

export default class ThenBlock extends Node {
	block: Block;
	children: Node[];

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.children = mapChildren(component, parent, scope, info.children);

		this.warnIfEmptyBlock();
	}
}