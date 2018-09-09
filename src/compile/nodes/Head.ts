import Node from './shared/Node';
import Block from '../dom/Block';
import mapChildren from './shared/mapChildren';

export default class Head extends Node {
	type: 'Head';
	children: any[]; // TODO

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		if (info.attributes.length) {
			component.error(info.attributes[0], {
				code: `invalid-attribute`,
				message: `<svelte:head> should not have any attributes or directives`
			});
		}

		this.children = mapChildren(component, parent, scope, info.children.filter(child => {
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

	ssr() {
		this.component.target.append('${(__result.head += `');

		this.children.forEach((child: Node) => {
			child.ssr();
		});

		this.component.target.append('`, "")}');
	}
}
