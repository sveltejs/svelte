import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import getName from '../../../utils/getName';
import isValidIdentifier from '../../../utils/isValidIdentifier';
import reservedNames from '../../../utils/reservedNames';
import { Validator } from '../../';
import { Node } from '../../../interfaces';
import walkThroughTopFunctionScope from '../../../utils/walkThroughTopFunctionScope';
import isThisGetCallExpression from '../../../utils/isThisGetCallExpression';

const isFunctionExpression = new Set([
	'FunctionExpression',
	'ArrowFunctionExpression',
]);

export default function computed(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		validator.error(
			`The 'computed' property must be an object literal`,
			prop
		);
	}

	checkForDupes(validator, prop.value.properties);
	checkForComputedKeys(validator, prop.value.properties);

	prop.value.properties.forEach((computation: Node) => {
		const name = getName(computation.key);

		if (!isValidIdentifier(name)) {
			const suggestion = name.replace(/[^_$a-z0-9]/ig, '_').replace(/^\d/, '_$&');
			validator.error(
				`Computed property name '${name}' is invalid — must be a valid identifier such as ${suggestion}`,
				computation
			);
		}

		if (reservedNames.has(name)) {
			validator.error(
				`Computed property name '${name}' is invalid — cannot be a JavaScript reserved word`,
				computation
			);
		}

		if (!isFunctionExpression.has(computation.value.type)) {
			validator.error(
				`Computed properties can be function expressions or arrow function expressions`,
				computation.value
			);
		}

		const { body, params } = computation.value;

		walkThroughTopFunctionScope(body, (node: Node) => {
			if (isThisGetCallExpression(node) && !node.callee.property.computed) {
				validator.error(
					`Cannot use this.get(...) — values must be passed into the function as arguments`,
					node
				);
			}

			if (node.type === 'ThisExpression') {
				validator.error(
					`Computed properties should be pure functions — they do not have access to the component instance and cannot use 'this'. Did you mean to put this in 'methods'?`,
					node
				);
			}
		});

		if (params.length === 0) {
			validator.error(
				`A computed value must depend on at least one property`,
				computation.value
			);
		}

		params.forEach((param: Node) => {
			const valid =
				param.type === 'Identifier' ||
				(param.type === 'AssignmentPattern' &&
					param.left.type === 'Identifier');

			if (!valid) {
				validator.error(
					`Computed properties cannot use destructuring in function parameters`,
					param
				);
			}
		});
	});
}
