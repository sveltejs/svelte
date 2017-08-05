import { Validator } from '../../';
import { Node } from '../../../interfaces';

const disallowed = new Set(['Literal', 'ObjectExpression', 'ArrayExpression']);

export default function setup(validator: Validator, prop: Node) {
	while (prop.type === 'ParenthesizedExpression') prop = prop.expression;

	if (disallowed.has(prop.value.type)) {
		validator.error(`'setup' must be a function`, prop.value.start);
	}
}
