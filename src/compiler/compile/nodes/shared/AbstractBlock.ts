import Block from '../../render_dom/Block.ts';
import Component from '../../Component.ts';
import Node from './Node.ts';
import { INode } from '../interfaces.ts';

export default class AbstractBlock extends Node {
	block: Block;
	children: INode[];

	constructor(component: Component, parent, scope, info: any) {
		super(component, parent, scope, info);
	}

	warn_if_empty_block() {
		if (!this.children || this.children.length > 1) return;

		const child = this.children[0];

		if (!child || (child.type === 'Text' && !/[^ \r\n\f\v\t]/.test(child.data))) {
			this.component.warn(this, {
				code: 'empty-block',
				message: 'Empty block'
			});
		}
	}
}
