/**
 * @template {string} Type
 * @template {import('../interfaces.js').INode} [Parent=import('../interfaces.js').INode]
 */
export default class Node {
	/**
	 * @readonly
	 * @type {number}
	 */
	start;

	/**
	 * @readonly
	 * @type {number}
	 */
	end;

	/**
	 * @readonly
	 * @type {import('../../Component.js').default}
	 */
	component;

	/**
	 * @readonly
	 * @type {Parent}
	 */
	parent;

	/**
	 * @readonly
	 * @type {Type}
	 */
	type;

	/** @type {import('../interfaces.js').INode} */
	prev;

	/** @type {import('../interfaces.js').INode} */
	next;

	/** @type {boolean} */
	can_use_innerhtml;

	/** @type {boolean} */
	is_static_content;

	/** @type {string} */
	var;

	/** @type {import('../Attribute.js').default[]} */
	attributes = [];

	/**
	 * @param {import('../../Component.js').default} component
	 * @param {Node} parent
	 * @param {any} _scope
	 * @param {import('../../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, _scope, info) {
		this.start = info.start;
		this.end = info.end;
		this.type = /** @type {Type} */ (info.type);
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
		this.can_use_innerhtml = true;
		this.is_static_content = true;
	}
	cannot_use_innerhtml() {
		if (this.can_use_innerhtml !== false) {
			this.can_use_innerhtml = false;
			if (this.parent) this.parent.cannot_use_innerhtml();
		}
	}
	not_static_content() {
		this.is_static_content = false;
		if (this.parent) this.parent.not_static_content();
	}

	/** @param {RegExp} selector */
	find_nearest(selector) {
		if (selector.test(this.type)) return this;
		if (this.parent) return this.parent.find_nearest(selector);
	}

	/** @param {string} name */
	get_static_attribute_value(name) {
		const attribute = this.attributes.find(
			/** @param {import('../Attribute.js').default} attr */
			(attr) => attr.type === 'Attribute' && attr.name.toLowerCase() === name
		);
		if (!attribute) return null;
		if (attribute.is_true) return true;
		if (attribute.chunks.length === 0) return '';
		if (attribute.chunks.length === 1 && attribute.chunks[0].type === 'Text') {
			return /** @type {import('../Text.js').default} */ (attribute.chunks[0]).data;
		}
		return null;
	}

	/** @param {string} type */
	has_ancestor(type) {
		return this.parent ? this.parent.type === type || this.parent.has_ancestor(type) : false;
	}
}
