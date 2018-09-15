import { Node } from '../../../../interfaces';
import getName from '../../../../utils/getName';
import Component from '../../../Component';

export default function checkForDupes(
	component: Component,
	properties: Node[]
) {
	const seen = new Set();

	properties.forEach(prop => {
		const name = getName(prop.key);

		if (seen.has(name)) {
			component.error(prop, {
				code: `duplicate-property`,
				message: `Duplicate property '${name}'`
			});
		}

		seen.add(name);
	});
}
