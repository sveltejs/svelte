import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import { Validator } from '../../';
import { Node } from '../../../interfaces';

const isFunctionExpression = new Set([
	'FunctionExpression',
	'ArrowFunctionExpression'
]);

export default function computed(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		validator.error(
			`The 'computed' property must be an object literal`,
			prop.start
		);
		return;
	}

	checkForDupes(validator, prop.value.properties);
	checkForComputedKeys(validator, prop.value.properties);

	prop.value.properties.forEach((computation: Node) => {
		if (!isFunctionExpression.has(computation.value.type)) {
			validator.error(
				`Computed properties can be function expressions or arrow function expressions`,
				computation.value.start
			);
			return;
		}

		const params = computation.value.params;

		if (params.length === 0) {
			validator.error(
				`A computed value must depend on at least one property`,
				computation.value.start
			);
			return;
		}

		params.forEach((param: Node) => {
			const valid =
				param.type === 'Identifier' ||
				(param.type === 'AssignmentPattern' &&
					param.left.type === 'Identifier');

			if (!valid) {
				validator.error(
					`Computed properties cannot use destructuring in function parameters`,
					param.start
				);
			}
		});
	});
}
