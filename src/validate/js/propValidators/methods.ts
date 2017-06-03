import checkForAccessors from '../utils/checkForAccessors';
import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import usesThisOrArguments from '../utils/usesThisOrArguments';
import { Validator } from '../../';
import { Node } from '../../../interfaces';

const builtin = new Set(['set', 'get', 'on', 'fire', 'observe', 'destroy']);

export default function methods(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		validator.error(
			`The 'methods' property must be an object literal`,
			prop.start
		);
		return;
	}

	checkForAccessors(validator, prop.value.properties, 'Methods');
	checkForDupes(validator, prop.value.properties);
	checkForComputedKeys(validator, prop.value.properties);

	prop.value.properties.forEach((prop: Node) => {
		if (builtin.has(prop.key.name)) {
			validator.error(
				`Cannot overwrite built-in method '${prop.key.name}'`,
				prop.start
			);
		}

		if (prop.value.type === 'ArrowFunctionExpression') {
			if (usesThisOrArguments(prop.value.body)) {
				validator.error(
					`Method '${prop.key
						.name}' should be a function expression, not an arrow function expression`,
					prop.start
				);
			}
		}
	});
}
