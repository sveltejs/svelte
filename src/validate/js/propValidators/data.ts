import { Validator } from '../../';
import { Node } from '../../../interfaces';

const allowed = new Set(['FunctionExpression', 'ArrowFunctionExpression'])

export default function data(validator: Validator, prop: Node) {
	while (prop.type === 'ParenthesizedExpression') prop = prop.expression;

	if (!allowed.has(prop.value.type)) {
		validator.error(`'data' must be a function`, prop.value.start);
	}
}
