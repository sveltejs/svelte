import Node from './shared/Node';
import Element from './Element';
import Attribute from './Attribute';

export default class Slot extends Element {
	type: 'Element';
	name: string;
	attributes: Attribute[];
	children: Node[];

	constructor(component, parent, scope, info) {
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

				const slot_name = attr.value[0].data;
				if (slot_name === 'default') {
					component.error(attr, {
						code: `invalid-slot-name`,
						message: `default is a reserved word — it cannot be used as a slot name`
					});
				}

				if (/^[0-9]/.test(slot_name)) {
					component.error(attr, {
						code: `invalid-slot-name`,
						message: `<slot> name cannot start with a digit`
					});
				}
			}

			// TODO should duplicate slots be disallowed? Feels like it's more likely to be a
			// bug than anything. Perhaps it should be a warning

			// if (validator.slots.has(slot_name)) {
			// 	validator.error(`duplicate '${slot_name}' <slot> element`, nameAttribute.start);
			// }

			// validator.slots.add(slot_name);
		});

		// if (node.attributes.length === 0) && validator.slots.has('default')) {
		// 	validator.error(node, {
		// 		code: `duplicate-slot`,
		// 		message: `duplicate default <slot> element`
		// 	});
		// }
	}

	get_static_attribute_value(name: string) {
		const attribute = this.attributes.find(
			attr => attr.name.toLowerCase() === name
		);

		if (!attribute) return null;

		if (attribute.is_true) return true;
		if (attribute.chunks.length === 0) return '';

		if (attribute.chunks.length === 1 && attribute.chunks[0].type === 'Text') {
			return attribute.chunks[0].data;
		}

		return null;
	}
}
