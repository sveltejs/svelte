import Attribute from './../Attribute';
import Component from './../../Component';
import { INode } from '../interfaces';
import Text from '../Text';

export default class Node {
	readonly start: number;
	readonly end: number;
	readonly component: Component;
	readonly parent: INode;
	readonly type: string;

	prev?: INode;
	next?: INode;

	can_use_innerhtml: boolean;
	var: string;
	attributes: Attribute[];

	constructor(component: Component, parent: any, scope: any, info: { start: number; end: number; type: string; }) {
		this.start = info.start;
		this.end = info.end;
		this.type = info.type;

		// this makes properties non-enumerable, which makes logging
		// bearable. might have a performance cost. TODO remove in prod?
		Object.defineProperties(this, {
			component: {
				value: component
			},
			parent: {
				value: parent
			}
		});
	}

	cannot_use_innerhtml() {
		if (this.can_use_innerhtml !== false) {
			this.can_use_innerhtml = false;
			if (this.parent) this.parent.cannot_use_innerhtml();
		}
	}

	find_nearest(selector: RegExp) {
		if (selector.test(this.type)) return this;
		if (this.parent) return this.parent.find_nearest(selector);
	}

	get_static_attribute_value(name: string) {
		const attribute = this.attributes.find(
			(attr: Attribute) => attr.type === 'Attribute' && attr.name.toLowerCase() === name
		);

		if (!attribute) return null;

		if (attribute.is_true) return true;
		if (attribute.chunks.length === 0) return '';

		if (attribute.chunks.length === 1 && attribute.chunks[0].type === 'Text') {
			return (attribute.chunks[0] as Text).data;
		}

		return null;
	}

	has_ancestor(type: string) {
		return this.parent ?
			this.parent.type === type || this.parent.has_ancestor(type) :
			false;
	}
}
