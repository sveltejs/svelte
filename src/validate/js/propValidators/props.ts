import { Validator } from '../../';
import { Node } from '../../../interfaces';
import nodeToString from '../../../utils/nodeToString';

export default function props(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ArrayExpression') {
		validator.error(
			`'props' must be an array expression, if specified`,
			prop.value
		);
	}

	prop.value.elements.forEach((element: Node) => {
		if (typeof nodeToString(element) !== 'string') {
			validator.error(
				`'props' must be an array of string literals`,
				element
			);
		}
	});
}
