import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function props(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ArrayExpression') {
		validator.error(
			`'props' must be an array expression, if specified`,
			prop.value.start
		);
	}

	prop.value.elements.forEach((element: Node) => {
		if (element.type !== 'Literal' || typeof element.value !== 'string') {
			validator.error(
				`'props' must be an array of string literals`,
				element.start
			);
		}
	});
}
