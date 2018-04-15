import usesThisOrArguments from '../utils/usesThisOrArguments';
import { Validator } from '../../index';
import { Node } from '../../../interfaces';

export default function oncreate(validator: Validator, prop: Node) {
	if (prop.value.type === 'ArrowFunctionExpression') {
		if (usesThisOrArguments(prop.value.body)) {
			validator.error(prop, {
				code: `invalid-property`,
				message: `'oncreate' should be a function expression, not an arrow function expression`
			});
		}
	}
}
