import { Node } from '../../../../interfaces';
import Component from '../../../Component';

export default function checkForAccessors(
	component: Component,
	properties: Node[],
	label: string
) {
	properties.forEach(prop => {
		if (prop.kind !== 'init') {
			component.error(prop, {
				code: `illegal-accessor`,
				message: `${label} cannot use getters and setters`
			});
		}
	});
}
