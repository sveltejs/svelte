import { x } from 'code-red';
import { Node, Identifier, Expression, PrivateIdentifier } from 'estree';
import { walk } from 'estree-walker';
import is_reference, { NodeWithPropertyDefinition } from 'is-reference';
import { clone } from '../../../utils/clone';
import Component from '../../Component';
import flatten_reference from '../../utils/flatten_reference';
import TemplateScope from './TemplateScope';

export type Context = DestructuredVariable | ComputedProperty;

interface ComputedProperty {
	type: 'ComputedProperty';
  property_name: string;
  key: Expression | PrivateIdentifier;
}
 
interface DestructuredVariable {
	type: 'DestructuredVariable'
	key: Identifier;
	name?: string;
	modifier: (node: Node) => Node;
	default_modifier: (node: Node, to_ctx: (name: string) => Node) => Node;
}

export function unpack_destructuring({
	contexts,
	node,
	modifier = (node) => node,
	default_modifier = (node) => node,
	scope,
	component,
	context_rest_properties,
	number_of_computed_props = { n: 0 }
}: {
	contexts: Context[];
	node: Node;
	modifier?: DestructuredVariable['modifier'];
	default_modifier?: DestructuredVariable['default_modifier'];
	scope: TemplateScope;
	component: Component;
	context_rest_properties: Map<string, Node>;
	// we want to pass this by reference, as a sort of global variable, because 
	// if we pass this by value, we could get computed_property_# variable collisions
	// when we deal with nested object destructuring
	number_of_computed_props?: { n: number }; 
}) {
	if (!node) return;

	if (node.type === 'Identifier') {
		contexts.push({
			type: 'DestructuredVariable',
			key: node as Identifier,
			modifier,
			default_modifier
		});
	} else if (node.type === 'RestElement') {
		contexts.push({
			type: 'DestructuredVariable',
			key: node.argument as Identifier,
			modifier,
			default_modifier
		});
		context_rest_properties.set((node.argument as Identifier).name, node);
	} else if (node.type === 'ArrayPattern') {
		node.elements.forEach((element, i) => {
			if (element && element.type === 'RestElement') {
				unpack_destructuring({
					contexts,
					node: element,
					modifier: (node) => x`${modifier(node)}.slice(${i})` as Node,
					default_modifier,
					scope,
					component,
					context_rest_properties,
					number_of_computed_props
				});
				context_rest_properties.set((element.argument as Identifier).name, element);
			} else if (element && element.type === 'AssignmentPattern') {
				const n = contexts.length;
				mark_referenced(element.right, scope, component);

				unpack_destructuring({
					contexts,
					node: element.left,
					modifier: (node) => x`${modifier(node)}[${i}]`,
					default_modifier: (node, to_ctx) =>
						x`${node} !== undefined ? ${node} : ${update_reference(
							contexts,
							n,
							element.right,
							to_ctx
						)}` as Node,
					scope,
					component,
					context_rest_properties,
					number_of_computed_props
				});
			} else {
				unpack_destructuring({
					contexts,
					node: element,
					modifier: (node) => x`${modifier(node)}[${i}]` as Node,
					default_modifier,
					scope,
					component,
					context_rest_properties,
					number_of_computed_props
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
						x`@object_without_properties(${modifier(
							node
						)}, [${used_properties}])` as Node,
					default_modifier,
					scope,
					component,
					context_rest_properties,
					number_of_computed_props
				});
				context_rest_properties.set((property.argument as Identifier).name, property);
			} else if (property.type === 'Property') {
				const key = property.key;
				const value = property.value;

				let new_modifier: (node: Node) => Node; 

				if (property.computed) {
					// e.g { [computedProperty]: ... }
					const property_name = `computed_property_${number_of_computed_props.n}`;
					number_of_computed_props.n += 1;

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
							x`${node} !== undefined ? ${node} : ${update_reference(
								contexts,
								n,
								value.right,
								to_ctx
							)}` as Node,
						scope,
						component,
						context_rest_properties,
						number_of_computed_props
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
						number_of_computed_props
					});
				}
			}
		});
	}
}

function update_reference(
	contexts: Context[],
	n: number,
	expression: Expression,
	to_ctx: (name: string) => Node
): Node {
	const find_from_context = (node: Identifier) => {
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
	expression = clone(expression) as Expression;
	walk(expression, {
		enter(node, parent: Node) {
			if (
				is_reference(
					node as NodeWithPropertyDefinition,
					parent as NodeWithPropertyDefinition
				)
			) {
				this.replace(find_from_context(node as Identifier));
				this.skip();
			}
		}
	});

	return expression;
}

function mark_referenced(
	node: Node,
	scope: TemplateScope,
	component: Component
) {
	walk(node, {
		enter(node: any, parent: any) {
			if (is_reference(node, parent)) {
				const { name } = flatten_reference(node);
				if (!scope.is_let(name) && !scope.names.has(name)) {
					component.add_reference(node, name);
				}
			}
		}
	});
}
