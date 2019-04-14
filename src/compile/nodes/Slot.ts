import Node from './shared/Node';
import Element from './Element';
import Attribute from './Attribute';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';

export default class Slot extends Element {
	type: 'Element';
	name: string;
	children: Node[];
	slot_name: string;
	values: Map<string, Attribute> = new Map();

	constructor(component: Component, parent: Node, scope: TemplateScope, info: any) {
		super(component, parent, scope, info);

		info.attributes.forEach(attr => {
			if (attr.type !== 'Attribute') {
				component.error(attr, {
					code: `invalid-slot-directive`,
					message: `<slot> cannot have directives`
				});
			}

			if (attr.name === 'name') {
				if (attr.value.length !== 1 || attr.value[0].type !== 'Text') {
					component.error(attr, {
						code: `dynamic-slot-name`,
						message: `<slot> name cannot be dynamic`
					});
				}

				this.slot_name = attr.value[0].data;
				if (this.slot_name === 'default') {
					component.error(attr, {
						code: `invalid-slot-name`,
						message: `default is a reserved word — it cannot be used as a slot name`
					});
				}
			}

			this.values.set(attr.name, new Attribute(component, this, scope, attr));

			// TODO should duplicate slots be disallowed? Feels like it's more likely to be a
			// bug than anything. Perhaps it should be a warning

			// if (validator.slots.has(slot_name)) {
			// 	validator.error(`duplicate '${slot_name}' <slot> element`, nameAttribute.start);
			// }

			// validator.slots.add(slot_name);
		});

		if (!this.slot_name) this.slot_name = 'default';

		if (this.slot_name === 'default') {
			// if this is the default slot, add our dependencies to any
			// other slots (which inherit our slot values) that were
			// previously encountered
			component.slots.forEach((slot) => {
				this.values.forEach((attribute, name) => {
					if (!slot.values.has(name)) {
						slot.values.set(name, attribute);
					}
				});
			});
		} else if (component.slots.has('default')) {
			// otherwise, go the other way — inherit values from
			// a previously encountered default slot
			const default_slot = component.slots.get('default');
			default_slot.values.forEach((attribute, name) => {
				if (!this.values.has(name)) {
					this.values.set(name, attribute);
				}
			});
		}

		component.slots.set(this.slot_name, this);

		// if (node.attributes.length === 0) && validator.slots.has('default')) {
		// 	validator.error(node, {
		// 		code: `duplicate-slot`,
		// 		message: `duplicate default <slot> element`
		// 	});
		// }
	}
}