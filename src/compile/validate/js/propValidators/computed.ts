import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import getName from '../../../../utils/getName';
import isValidIdentifier from '../../../../utils/isValidIdentifier';
import reservedNames from '../../../../utils/reservedNames';
import { Node } from '../../../../interfaces';
import walkThroughTopFunctionScope from '../../../../utils/walkThroughTopFunctionScope';
import isThisGetCallExpression from '../../../../utils/isThisGetCallExpression';
import Component from '../../../Component';

const isFunctionExpression = new Set([
	'FunctionExpression',
	'ArrowFunctionExpression',
]);

export default function computed(component: Component, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		component.error(prop, {
			code: `invalid-computed-property`,
			message: `The 'computed' property must be an object literal`
		});
	}

	checkForDupes(component, prop.value.properties);
	checkForComputedKeys(component, prop.value.properties);

	prop.value.properties.forEach((computation: Node) => {
		const name = getName(computation.key);

		if (!isValidIdentifier(name)) {
			const suggestion = name.replace(/[^_$a-z0-9]/ig, '_').replace(/^\d/, '_$&');
			component.error(computation.key, {
				code: `invalid-computed-name`,
				message: `Computed property name '${name}' is invalid — must be a valid identifier such as ${suggestion}`
			});
		}

		if (reservedNames.has(name)) {
			component.error(computation.key, {
				code: `invalid-computed-name`,
				message: `Computed property name '${name}' is invalid — cannot be a JavaScript reserved word`
			});
		}

		if (!isFunctionExpression.has(computation.value.type)) {
			component.error(computation.value, {
				code: `invalid-computed-value`,
				message: `Computed properties can be function expressions or arrow function expressions`
			});
		}

		const { body, params } = computation.value;

		walkThroughTopFunctionScope(body, (node: Node) => {
			if (isThisGetCallExpression(node) && !node.callee.property.computed) {
				component.error(node, {
					code: `impure-computed`,
					message: `Cannot use this.get(...) — values must be passed into the function as arguments`
				});
			}

			if (node.type === 'ThisExpression') {
				component.error(node, {
					code: `impure-computed`,
					message: `Computed properties should be pure functions — they do not have access to the component instance and cannot use 'this'. Did you mean to put this in 'methods'?`
				});
			}
		});

		if (params.length === 0) {
			component.error(computation.value, {
				code: `impure-computed`,
				message: `A computed value must depend on at least one property`
			});
		}

		if (params.length > 1) {
			component.error(computation.value, {
				code: `invalid-computed-arguments`,
				message: `Computed properties must take a single argument`
			});
		}
	});
}
