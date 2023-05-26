import Element from './Element.js';
import Attribute from './Attribute.js';
import compiler_errors from '../compiler_errors.js';

/** @extends Element */
export default class Slot extends Element {
	/** @type {'Slot'} */
	// @ts-ignore Slot elements have the 'Slot' type, but TypeScript doesn't allow us to have 'Slot' when it extends Element
	type = 'Slot';

	/** @type {string} */
	slot_name;

	/** @type {Map<string, import('./Attribute.js').default>} */
	values = new Map();

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./interfaces.js').INode} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {import('../../interfaces.js').TemplateNode} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		info.attributes.forEach(
			/** @param {any} attr */ (attr) => {
				if (attr.type !== 'Attribute' && attr.type !== 'Spread') {
					return component.error(attr, compiler_errors.invalid_slot_directive);
				}
				if (attr.name === 'name') {
					if (attr.value.length !== 1 || attr.value[0].type !== 'Text') {
						return component.error(attr, compiler_errors.dynamic_slot_name);
					}
					this.slot_name = attr.value[0].data;
					if (this.slot_name === 'default') {
						return component.error(attr, compiler_errors.invalid_slot_name);
					}
				}
				this.values.set(attr.name, new Attribute(component, this, scope, attr));
			}
		);
		if (!this.slot_name) this.slot_name = 'default';

		component.slots.set(this.slot_name, this);
		this.cannot_use_innerhtml();
		this.not_static_content();
	}
}
