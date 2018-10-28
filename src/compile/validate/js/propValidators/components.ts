import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import getName from '../../../../utils/getName';
import { Node } from '../../../../interfaces';
import Component from '../../../Component';

export default function components(component: Component, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		component.error(prop, {
			code: `invalid-components-property`,
			message: `The 'components' property must be an object literal`
		});
	}

	checkForDupes(component, prop.value.properties);
	checkForComputedKeys(component, prop.value.properties);

	prop.value.properties.forEach((node: Node) => {
		const name = getName(node.key);

		if (name === 'state') {
			// TODO is this still true?
			component.error(node, {
				code: `invalid-name`,
				message: `Component constructors cannot be called 'state' due to technical limitations`
			});
		}

		if (!/^[A-Z]/.test(name)) {
			component.error(node, {
				code: `component-lowercase`,
				message: `Component names must be capitalised`
			});
		}
	});
}
