import Node from './shared/Node';
import Block from '../dom/Block';
import mapChildren from './shared/mapChildren';

export default class CatchBlock extends Node {
	block: Block;
	children: Node[];

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);
		this.children = mapChildren(compiler, parent, scope, info.children);
	}
}