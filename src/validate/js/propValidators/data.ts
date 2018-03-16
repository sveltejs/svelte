import { Validator } from '../../';
import { Node } from '../../../interfaces';

const disallowed = new Set(['Literal', 'ObjectExpression', 'ArrayExpression']);

export default function data(validator: Validator, prop: Node) {
	while (prop.type === 'ParenthesizedExpression') prop = prop.expression;

	if (disallowed.has(prop.value.type)) {
		validator.error(`'data' must be a function`, { start: prop.value.start, end: prop.value.end });
	}
}
