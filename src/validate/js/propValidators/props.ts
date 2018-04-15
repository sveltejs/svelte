import { Validator } from '../../index';
import { Node } from '../../../interfaces';
import nodeToString from '../../../utils/nodeToString';

export default function props(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ArrayExpression') {
		validator.error(prop.value, {
			code: `invalid-props-property`,
			message: `'props' must be an array expression, if specified`
		});
	}

	prop.value.elements.forEach((element: Node) => {
		if (typeof nodeToString(element) !== 'string') {
			validator.error(element, {
				code: `invalid-props-property`,
				message: `'props' must be an array of string literals`
			});
		}
	});
}
