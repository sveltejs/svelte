import { Node } from '../../../../interfaces';
import Component from '../../../Component';

export default function checkForComputedKeys(
	component: Component,
	properties: Node[]
) {
	properties.forEach(prop => {
		if (prop.key.computed) {
			component.error(prop, {
				code: `computed-key`,
				message: `Cannot use computed keys`
			});
		}
	});
}
