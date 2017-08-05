import usesThisOrArguments from '../utils/usesThisOrArguments';
import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function setup(validator: Validator, prop: Node) {
	if (prop.value.type === 'ArrowFunctionExpression') {
		if (usesThisOrArguments(prop.value.body)) {
			validator.error(
				`'setup' should be a function expression, not an arrow function expression`,
				prop.start
			);
		}
	}
}
