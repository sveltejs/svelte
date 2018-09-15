import { Node } from '../../../../interfaces';
import Component from '../../../Component';

const disallowed = new Set(['Literal', 'ObjectExpression', 'ArrayExpression']);

export default function setup(component: Component, prop: Node) {
	while (prop.type === 'ParenthesizedExpression') prop = prop.expression;

	if (disallowed.has(prop.value.type)) {
		component.error(prop.value, {
			code: `invalid-setup-property`,
			message: `'setup' must be a function`
		});
	}
}
