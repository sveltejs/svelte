import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import { Node } from '../../../../interfaces';
import walkThroughTopFunctionScope from '../../../../utils/walkThroughTopFunctionScope';
import isThisGetCallExpression from '../../../../utils/isThisGetCallExpression';
import Component from '../../../Component';

export default function helpers(component: Component, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		component.error(prop, {
			code: `invalid-helpers-property`,
			message: `The 'helpers' property must be an object literal`
		});
	}

	checkForDupes(component, prop.value.properties);
	checkForComputedKeys(component, prop.value.properties);

	prop.value.properties.forEach((prop: Node) => {
		if (!/FunctionExpression/.test(prop.value.type)) return;

		let usesArguments = false;

		walkThroughTopFunctionScope(prop.value.body, (node: Node) => {
			if (isThisGetCallExpression(node) && !node.callee.property.computed) {
				component.error(node, {
					code: `impure-helper`,
					message: `Cannot use this.get(...) — values must be passed into the helper function as arguments`
				});
			}

			if (node.type === 'ThisExpression') {
				component.error(node, {
					code: `impure-helper`,
					message: `Helpers should be pure functions — they do not have access to the component instance and cannot use 'this'. Did you mean to put this in 'methods'?`
				});
			} else if (node.type === 'Identifier' && node.name === 'arguments') {
				usesArguments = true;
			}
		});

		if (prop.value.params.length === 0 && !usesArguments) {
			component.warn(prop, {
				code: `impure-helper`,
				message: `Helpers should be pure functions, with at least one argument`
			});
		}
	});
}
