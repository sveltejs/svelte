import * as namespaces from '../../utils/namespaces';
import validateEventHandler from './validateEventHandler';
import validate, { Validator } from '../index';
import { Node } from '../../interfaces';

export default function validateSlot(
	validator: Validator,
	node: Node
) {
	node.attributes.forEach(attr => {
		if (attr.type !== 'Attribute') {
			validator.error(attr, {
				code: `invalid-slot-directive`,
				message: `<slot> cannot have directives`
			});
		}

		if (attr.name !== 'name') {
			validator.error(attr, {
				code: `invalid-slot-attribute`,
				message: `"name" is the only attribute permitted on <slot> elements`
			});
		}

		if (attr.value.length !== 1 || attr.value[0].type !== 'Text') {
			validator.error(attr, {
				code: `dynamic-slot-name`,
				message: `<slot> name cannot be dynamic`
			});
		}

		const slotName = attr.value[0].data;
		if (slotName === 'default') {
			validator.error(attr, {
				code: `invalid-slot-name`,
				message: `default is a reserved word — it cannot be used as a slot name`
			});
		}

		// TODO should duplicate slots be disallowed? Feels like it's more likely to be a
		// bug than anything. Perhaps it should be a warning

		// if (validator.slots.has(slotName)) {
		// 	validator.error(`duplicate '${slotName}' <slot> element`, nameAttribute.start);
		// }

		// validator.slots.add(slotName);
	});

	// if (node.attributes.length === 0) && validator.slots.has('default')) {
	// 	validator.error(node, {
	// 		code: `duplicate-slot`,
	// 		message: `duplicate default <slot> element`
	// 	});
	// }
}