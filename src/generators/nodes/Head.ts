import deindent from '../../utils/deindent';
import { stringify } from '../../utils/stringify';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';
import mapChildren from './shared/mapChildren';

export default class Head extends Node {
	type: 'Head';
	children: any[]; // TODO

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);
		this.children = mapChildren(compiler, parent, scope, info.children.filter(child => {
			return (child.type !== 'Text' || /\S/.test(child.data));
		}));
	}

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.initChildren(block, true, null);
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		this.var = 'document.head';

		this.children.forEach((child: Node) => {
			child.build(block, 'document.head', null);
		});
	}

	ssr(compiler, block) {
		compiler.append('${(__result.head += `');

		this.children.forEach((child: Node) => {
			child.ssr(compiler, block);
		});

		compiler.append('`, "")}');
	}
}
