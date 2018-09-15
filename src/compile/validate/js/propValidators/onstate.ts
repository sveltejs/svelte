import usesThisOrArguments from '../utils/usesThisOrArguments';
import { Node } from '../../../../interfaces';
import Component from '../../../Component';

export default function onstate(component: Component, prop: Node) {
	if (prop.value.type === 'ArrowFunctionExpression') {
		if (usesThisOrArguments(prop.value.body)) {
			component.error(prop, {
				code: `invalid-onstate-property`,
				message: `'onstate' should be a function expression, not an arrow function expression`
			});
		}
	}
}
