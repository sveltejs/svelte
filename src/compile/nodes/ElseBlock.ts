import Node from './shared/Node';
import Block from '../render-dom/Block';
import mapChildren from './shared/mapChildren';

export default class ElseBlock extends Node {
	type: 'ElseBlock';
	children: Node[];
	block: Block;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.children = mapChildren(component, this, scope, info.children);

		this.warnIfEmptyBlock();
	}
}