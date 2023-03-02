import Block from '../../render_dom/Block';
import Component from '../../Component';
import Node from './Node';
import { INode } from '../interfaces';
import compiler_warnings from '../../compiler_warnings';

const regex_non_whitespace_characters = /[^ \r\n\f\v\t]/;

export default class AbstractBlock extends Node {
	block: Block;
	children: INode[];

	constructor(component: Component, parent, scope, info: any) {
		super(component, parent, scope, info);
	}

	warn_if_empty_block() {
		if (!this.children || this.children.length > 1) return;

		const child = this.children[0];

		if (!child || (child.type === 'Text' && !regex_non_whitespace_characters.test(child.data))) {
			this.component.warn(this, compiler_warnings.empty_block);
		}
	}
}
