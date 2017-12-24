import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import { walk } from 'estree-walker';
import { Validator } from '../../';
import { Node } from '../../../interfaces';
import walkThroughTopFunctionScope from '../../../utils/walkThroughTopFunctionScope';
import isThisGetCallExpression from '../../../utils/isThisGetCallExpression';

export default function helpers(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		validator.error(
			`The 'helpers' property must be an object literal`,
			prop.start
		);
	}

	checkForDupes(validator, prop.value.properties);
	checkForComputedKeys(validator, prop.value.properties);

	prop.value.properties.forEach((prop: Node) => {
		if (!/FunctionExpression/.test(prop.value.type)) return;

		let usesArguments = false;

		walkThroughTopFunctionScope(prop.value.body, (node: Node) => {
			if (isThisGetCallExpression(node) && !node.callee.property.computed) {
				validator.error(
					`Cannot use this.get(...) — values must be passed into the helper function as arguments`,
					node.start
				);
			}

			if (node.type === 'ThisExpression') {
				validator.error(
					`Helpers should be pure functions — they do not have access to the component instance and cannot use 'this'. Did you mean to put this in 'methods'?`,
					node.start
				);
			} else if (node.type === 'Identifier' && node.name === 'arguments') {
				usesArguments = true;
			}
		});

		if (prop.value.params.length === 0 && !usesArguments) {
			validator.warn(
				`Helpers should be pure functions, with at least one argument`,
				prop.start
			);
		}
	});
}
