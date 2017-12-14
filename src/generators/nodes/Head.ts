import deindent from '../../utils/deindent';
import { stringify } from '../../utils/stringify';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';

export default class Head extends Node {
	type: 'Head';
	attributes: Attribute[];

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
		const { generator } = this;

		this.var = 'document.head';

		this.children.forEach((child: Node) => {
			child.build(block, 'document.head', null);
		});
	}
}
