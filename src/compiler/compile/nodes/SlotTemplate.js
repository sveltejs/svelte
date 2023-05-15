import Node from './shared/Node.js';
import Let from './Let.js';
import Attribute from './Attribute.js';
import compiler_errors from '../compiler_errors.js';
import get_const_tags from './shared/get_const_tags.js';

/** @extends Node<'SlotTemplate'> */
export default class SlotTemplate extends Node {
	/** @type {import('./shared/TemplateScope.js').default} */
	scope;

	/** @type {import('./interfaces.js').INode[]} */
	children;

	/** @type {import('./Let.js').default[]} */
	lets = [];

	/** @type {import('./ConstTag.js').default[]} */
	const_tags;

	/** @type {import('./Attribute.js').default} */
	slot_attribute;

	/** @type {string} */
	slot_template_name = 'default';

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./interfaces.js').INode} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {any} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.validate_slot_template_placement();
		scope = scope.child();
		info.attributes.forEach(
			/** @param {any} node */ (node) => {
				switch (node.type) {
					case 'Let': {
						const l = new Let(component, this, scope, node);
						this.lets.push(l);
						const dependencies = new Set([l.name.name]);
						l.names.forEach(
							/** @param {any} name */ (name) => {
								scope.add(name, dependencies, this);
							}
						);
						break;
					}
					case 'Attribute': {
						if (node.name === 'slot') {
							this.slot_attribute = new Attribute(component, this, scope, node);
							if (!this.slot_attribute.is_static) {
								return component.error(node, compiler_errors.invalid_slot_attribute);
							}
							const value = this.slot_attribute.get_static_value();
							if (typeof value === 'boolean') {
								return component.error(node, compiler_errors.invalid_slot_attribute_value_missing);
							}
							this.slot_template_name = /** @type {string} */ (value);
							break;
						}
						throw new Error(`Invalid attribute '${node.name}' in <svelte:fragment>`);
					}
					default:
						throw new Error(`Not implemented: ${node.type}`);
				}
			}
		);
		this.scope = scope;
		[this.const_tags, this.children] = get_const_tags(info.children, component, this, this);
	}
	validate_slot_template_placement() {
		if (this.parent.type !== 'InlineComponent') {
			return this.component.error(this, compiler_errors.invalid_slotted_content_fragment);
		}
	}
}
