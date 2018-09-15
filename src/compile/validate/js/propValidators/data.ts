import { Node } from '../../../../interfaces';
import Component from '../../../Component';

const disallowed = new Set(['Literal', 'ObjectExpression', 'ArrayExpression']);

export default function data(component: Component, prop: Node) {
	while (prop.type === 'ParenthesizedExpression') prop = prop.expression;

	if (disallowed.has(prop.value.type)) {
		component.error(prop.value, {
			code: `invalid-data-property`,
			message: `'data' must be a function`
		});
	}
}
