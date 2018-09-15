import { Node } from '../../../../interfaces';
import nodeToString from '../../../../utils/nodeToString';
import Component from '../../../Component';

export default function props(component: Component, prop: Node) {
	if (prop.value.type !== 'ArrayExpression') {
		component.error(prop.value, {
			code: `invalid-props-property`,
			message: `'props' must be an array expression, if specified`
		});
	}

	prop.value.elements.forEach((element: Node) => {
		if (typeof nodeToString(element) !== 'string') {
			component.error(element, {
				code: `invalid-props-property`,
				message: `'props' must be an array of string literals`
			});
		}
	});
}
