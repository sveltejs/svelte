import Node from './shared/Node';
import map_children from './shared/map_children';
import hash from '../utils/hash';

export default class Head extends Node {
	type: 'Head';
	children: any[]; // TODO
	id: string;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		if (info.attributes.length) {
			component.error(info.attributes[0], {
				code: `invalid-attribute`,
				message: `<svelte:head> should not have any attributes or directives`
			});
		}

		this.children = map_children(component, parent, scope, info.children.filter(child => {
			return (child.type !== 'Text' || /\S/.test(child.data));
		}));

		if (this.children.length > 0) {
			this.id = `svelte-${hash(this.component.source.slice(this.start, this.end))}`;
		}
	}
}
