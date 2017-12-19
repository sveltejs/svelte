import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
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
			prop.start
		);
	}

	checkForDupes(validator, prop.value.properties);
	checkForComputedKeys(validator, prop.value.properties);

	prop.value.properties.forEach((computation: Node) => {
		if (!isFunctionExpression.has(computation.value.type)) {
			validator.error(
				`Computed properties can be function expressions or arrow function expressions`,
				computation.value.start
			);
		}

		const { body, params } = computation.value;

		walkThroughTopFunctionScope(body, (node: Node) => {
			if (isThisGetCallExpression(node) && !node.callee.property.computed) {
				validator.error(
					`Cannot use this.get(...) — it must be passed into the computed function as an argument`,
					node.start
				);
			}

			if (node.type === 'ThisExpression') {
				validator.error(
					`Computed should be pure functions — they do not have access to the component instance and cannot use 'this'. Did you mean to put this in 'methods'?`,
					node.start
				);
			}
		});

		if (params.length === 0) {
			validator.error(
				`A computed value must depend on at least one property`,
				computation.value.start
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
					param.start
				);
			}
		});
	});
}
