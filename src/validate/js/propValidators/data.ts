import { Validator } from '../../index';
import { Node } from '../../../interfaces';

const disallowed = new Set(['Literal', 'ObjectExpression', 'ArrayExpression']);

export default function data(validator: Validator, prop: Node) {
	while (prop.type === 'ParenthesizedExpression') prop = prop.expression;

	if (disallowed.has(prop.value.type)) {
		validator.error(prop.value, {
			code: `invalid-property`,
			message: `'data' must be a function`
		});
	}
}
