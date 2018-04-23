import Node from './shared/Node';
import Block from '../dom/Block';
import mapChildren from './shared/mapChildren';

export default class ElseBlock extends Node {
	type: 'ElseBlock';
	children: Node[];

	constructor(compiler, parent, info) {
		super(compiler, parent, info);
		this.children = mapChildren(compiler, this, info.children);
	}
}