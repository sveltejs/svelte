import { x } from 'code-red';
import { walk } from 'estree-walker';
import is_reference from 'is-reference';
import { clone } from '../../../utils/clone.js';
import flatten_reference from '../../utils/flatten_reference.js';
/**
 * @param {{
 * 	contexts: Context[];
 * 	node: import('estree').Pattern;
 * 	modifier?: DestructuredVariable['modifier'];
 * 	default_modifier?: DestructuredVariable['default_modifier'];
 * 	scope: import('./TemplateScope.js').default;
 * 	component: import('../../Component.js').default;
 * 	context_rest_properties: Map<string, import('estree').Node>;
 * 	in_rest_element?: boolean;
 * }} params
 */
export function unpack_destructuring({
	contexts,
	node,
	modifier = (node) => node,
	default_modifier = (node) => node,
	scope,
	component,
	context_rest_properties,
	in_rest_element = false
}) {
	if (!node) return;
	if (node.type === 'Identifier') {
		contexts.push({
			type: 'DestructuredVariable',
			key: /** @type {import('estree').Identifier} */ (node),
			modifier,
			default_modifier
		});
		if (in_rest_element) {
			context_rest_properties.set(node.name, node);
		}
	} else if (node.type === 'ArrayPattern') {
		node.elements.forEach((element, i) => {
			if (!element) {
				return;
			} else if (element.type === 'RestElement') {
				unpack_destructuring({
					contexts,
					node: element.argument,
					modifier: (node) =>
						/** @type {import('estree').Node} */ (x`${modifier(node)}.slice(${i})`),
					default_modifier,
					scope,
					component,
					context_rest_properties,
					in_rest_element: true
				});
			} else if (element.type === 'AssignmentPattern') {
				const n = contexts.length;
				mark_referenced(element.right, scope, component);
				unpack_destructuring({
					contexts,
					node: element.left,
					modifier: (node) => x`${modifier(node)}[${i}]`,
					default_modifier: (node, to_ctx) =>
						/** @type {import('estree').Node} */ (
							x`${node} !== undefined ? ${node} : ${update_reference(
								contexts,
								n,
								element.right,
								to_ctx
							)}`
						),
					scope,
					component,
					context_rest_properties,
					in_rest_element
				});
			} else {
				unpack_destructuring({
					contexts,
					node: element,
					modifier: (node) => /** @type {import('estree').Node} */ (x`${modifier(node)}[${i}]`),
					default_modifier,
					scope,
					component,
					context_rest_properties,
					in_rest_element
				});
			}
		});
	} else if (node.type === 'ObjectPattern') {
		const used_properties = [];
		node.properties.forEach((property) => {
			if (property.type === 'RestElement') {
				unpack_destructuring({
					contexts,
					node: property.argument,
					modifier: (node) =>
						/** @type {import('estree').Node} */ (
							x`@object_without_properties(${modifier(node)}, [${used_properties}])`
						),
					default_modifier,
					scope,
					component,
					context_rest_properties,
					in_rest_element: true
				});
			} else if (property.type === 'Property') {
				const key = property.key;
				const value = property.value;

				/** @type {(node: import('estree').Node) => import('estree').Node} */
				let new_modifier;
				if (property.computed) {
					// e.g { [computedProperty]: ... }
					const property_name = component.get_unique_name('computed_property');
					contexts.push({
						type: 'ComputedProperty',
						property_name,
						key
					});
					new_modifier = (node) => x`${modifier(node)}[${property_name}]`;
					used_properties.push(x`${property_name}`);
				} else if (key.type === 'Identifier') {
					// e.g. { someProperty: ... }
					const property_name = key.name;
					new_modifier = (node) => x`${modifier(node)}.${property_name}`;
					used_properties.push(x`"${property_name}"`);
				} else if (key.type === 'Literal') {
					// e.g. { "property-in-quotes": ... } or { 14: ... }
					const property_name = key.value;
					new_modifier = (node) => x`${modifier(node)}["${property_name}"]`;
					used_properties.push(x`"${property_name}"`);
				}
				if (value.type === 'AssignmentPattern') {
					// e.g. { property = default } or { property: newName = default }
					const n = contexts.length;
					mark_referenced(value.right, scope, component);
					unpack_destructuring({
						contexts,
						node: value.left,
						modifier: new_modifier,
						default_modifier: (node, to_ctx) =>
							/** @type {import('estree').Node} */ (
								x`${node} !== undefined ? ${node} : ${update_reference(
									contexts,
									n,
									value.right,
									to_ctx
								)}`
							),
						scope,
						component,
						context_rest_properties,
						in_rest_element
					});
				} else {
					// e.g. { property } or { property: newName }
					unpack_destructuring({
						contexts,
						node: value,
						modifier: new_modifier,
						default_modifier,
						scope,
						component,
						context_rest_properties,
						in_rest_element
					});
				}
			}
		});
	}
}

/**
 * @param {Context[]} contexts
 * @param {number} n
 * @param {import('estree').Expression} expression
 * @param {(name: string) => import('estree').Node} to_ctx
 * @returns {import('estree').Node}
 */
function update_reference(contexts, n, expression, to_ctx) {
	/** @param {import('estree').Identifier} node */
	const find_from_context = (node) => {
		for (let i = n; i < contexts.length; i++) {
			const cur_context = contexts[i];
			if (cur_context.type !== 'DestructuredVariable') continue;
			const { key } = cur_context;
			if (node.name === key.name) {
				throw new Error(`Cannot access '${node.name}' before initialization`);
			}
		}
		return to_ctx(node.name);
	};
	if (expression.type === 'Identifier') {
		return find_from_context(expression);
	}
	// NOTE: avoid unnecessary deep clone?
	expression = /** @type {import('estree').Expression} */ (clone(expression));
	walk(expression, {
		enter(node, parent) {
			if (
				is_reference(
					/** @type {import('is-reference').NodeWithPropertyDefinition} */ (node),
					/** @type {import('is-reference').NodeWithPropertyDefinition} */ (parent)
				)
			) {
				this.replace(find_from_context(/** @type {import('estree').Identifier} */ (node)));
				this.skip();
			}
		}
	});
	return expression;
}

/**
 * @param {import('estree').Node} node
 * @param {import('./TemplateScope.js').default} scope
 * @param {import('../../Component.js').default} component
 */
function mark_referenced(node, scope, component) {
	walk(node, {
		enter(node, parent) {
			if (is_reference(node, parent)) {
				const { name } = flatten_reference(node);
				if (!scope.is_let(name) && !scope.names.has(name)) {
					component.add_reference(node, name);
				}
			}
		}
	});
}

/** @typedef {DestructuredVariable | ComputedProperty} Context */

/**
 * @typedef {Object} ComputedProperty
 * @property {'ComputedProperty'} type
 * @property {import('estree').Identifier} property_name
 * @property {import('estree').Expression|import('estree').PrivateIdentifier} key
 */

/**
 * @typedef {Object} DestructuredVariable
 * @property {'DestructuredVariable'} type
 * @property {import('estree').Identifier} key
 * @property {string} [name]
 * @property {(node:import('estree').Node)=>import('estree').Node} modifier
 * @property {(node:import('estree').Node,to_ctx:(name:string)=>import('estree').Node)=>import('estree').Node} default_modifier
 */
