import usesThisOrArguments from '../utils/usesThisOrArguments';
import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function ondestroy(validator: Validator, prop: Node) {
	if (prop.value.type === 'ArrowFunctionExpression') {
		if (usesThisOrArguments(prop.value.body)) {
			validator.error(
				`'ondestroy' should be a function expression, not an arrow function expression`,
				prop.start
			);
		}
	}
}
