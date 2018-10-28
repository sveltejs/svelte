import { Node } from '../../../../interfaces';
import Component from '../../../Component';

export default function immutable(component: Component, prop: Node) {
	if (prop.value.type !== 'Literal' || typeof prop.value.value !== 'boolean') {
		component.error(prop.value, {
			code: `invalid-immutable-property`,
			message: `'immutable' must be a boolean literal`
		});
	}
}
