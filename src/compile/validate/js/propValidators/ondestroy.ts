import usesThisOrArguments from '../utils/usesThisOrArguments';
import { Node } from '../../../../interfaces';
import Component from '../../../Component';

export default function ondestroy(component: Component, prop: Node) {
	if (prop.value.type === 'ArrowFunctionExpression') {
		if (usesThisOrArguments(prop.value.body)) {
			component.error(prop, {
				code: `invalid-ondestroy-property`,
				message: `'ondestroy' should be a function expression, not an arrow function expression`
			});
		}
	}
}
