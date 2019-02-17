import Component from './../../Component';

export default class Node {
	readonly start: number;
	readonly end: number;
	readonly component: Component;
	readonly parent: Node;
	readonly type: string;

	prev?: Node;
	next?: Node;

	canUseInnerHTML: boolean;
	var: string;

	constructor(component: Component, parent, scope, info: any) {
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

	cannotUseInnerHTML() {
		if (this.canUseInnerHTML !== false) {
			this.canUseInnerHTML = false;
			if (this.parent) this.parent.cannotUseInnerHTML();
		}
	}

	hasAncestor(type: string) {
		return this.parent ?
			this.parent.type === type || this.parent.hasAncestor(type) :
			false;
	}

	findNearest(selector: RegExp) {
		if (selector.test(this.type)) return this;
		if (this.parent) return this.parent.findNearest(selector);
	}

	warnIfEmptyBlock() {
		if (!/Block$/.test(this.type) || !this.children) return;
		if (this.children.length > 1) return;

		const child = this.children[0];

		if (!child || (child.type === 'Text' && !/[^ \r\n\f\v\t]/.test(child.data))) {
			this.component.warn(this, {
				code: 'empty-block',
				message: 'Empty block'
			});
		}
	}
}
