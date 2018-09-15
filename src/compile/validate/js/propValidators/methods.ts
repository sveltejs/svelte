import checkForAccessors from '../utils/checkForAccessors';
import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import usesThisOrArguments from '../utils/usesThisOrArguments';
import getName from '../../../../utils/getName';
import { Node } from '../../../../interfaces';
import Component from '../../../Component';

const builtin = new Set(['set', 'get', 'on', 'fire', 'destroy']);

export default function methods(component: Component, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		component.error(prop, {
			code: `invalid-methods-property`,
			message: `The 'methods' property must be an object literal`
		});
	}

	checkForAccessors(component, prop.value.properties, 'Methods');
	checkForDupes(component, prop.value.properties);
	checkForComputedKeys(component, prop.value.properties);

	prop.value.properties.forEach((prop: Node) => {
		const name = getName(prop.key);

		if (builtin.has(name)) {
			component.error(prop, {
				code: `invalid-method-name`,
				message: `Cannot overwrite built-in method '${name}'`
			});
		}

		if (prop.value.type === 'ArrowFunctionExpression') {
			if (usesThisOrArguments(prop.value.body)) {
				component.error(prop, {
					code: `invalid-method-value`,
					message: `Method '${prop.key.name}' should be a function expression, not an arrow function expression`
				});
			}
		}
	});
}
