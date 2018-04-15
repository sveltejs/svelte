import usesThisOrArguments from '../utils/usesThisOrArguments';
import { Validator } from '../../index';
import { Node } from '../../../interfaces';

export default function ondestroy(validator: Validator, prop: Node) {
	if (prop.value.type === 'ArrowFunctionExpression') {
		if (usesThisOrArguments(prop.value.body)) {
			validator.error(prop, {
				code: `invalid-property`,
				message: `'ondestroy' should be a function expression, not an arrow function expression`
			});
		}
	}
}
