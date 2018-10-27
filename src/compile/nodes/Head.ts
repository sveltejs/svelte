import Node from './shared/Node';
import Block from '../render-dom/Block';
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
}
