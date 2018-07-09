import Node from './shared/Node';
import Block from '../dom/Block';
import mapChildren from './shared/mapChildren';

export default class ElseBlock extends Node {
	type: 'ElseBlock';
	children: Node[];
	block: Block;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);
		this.children = mapChildren(compiler, this, scope, info.children);
	}
}