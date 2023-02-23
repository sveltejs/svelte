import { x } from 'code-red';
import { Node, Identifier, Expression } from 'estree';
import { walk } from 'estree-walker';
import is_reference, { NodeWithPropertyDefinition } from 'is-reference';
import { clone } from '../../../utils/clone';
import Component from '../../Component';
import flatten_reference from '../../utils/flatten_reference';
import TemplateScope from './TemplateScope';

export interface Context {
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
	context_rest_properties
}: {
	contexts: Context[];
	node: Node;
	modifier?: Context['modifier'];
	default_modifier?: Context['default_modifier'];
	scope: TemplateScope;
	component: Component;
	context_rest_properties: Map<string, Node>;
}) {
	if (!node) return;

	if (node.type === 'Identifier') {
		contexts.push({
			key: node as Identifier,
			modifier,
			default_modifier
		});
	} else if (node.type === 'RestElement') {
		contexts.push({
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
					context_rest_properties
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
					context_rest_properties
				});
			} else {
				unpack_destructuring({
					contexts,
					node: element,
					modifier: (node) => x`${modifier(node)}[${i}]` as Node,
					default_modifier,
					scope,
					component,
					context_rest_properties
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
					context_rest_properties
				});
				context_rest_properties.set((property.argument as Identifier).name, property);
			} else {
				const key = property.key as Identifier;
				const value = property.value;

				used_properties.push(x`"${key.name}"`);
				if (value.type === 'AssignmentPattern') {
					const n = contexts.length;

					mark_referenced(value.right, scope, component);

					unpack_destructuring({
						contexts,
						node: value.left,
						modifier: (node) => x`${modifier(node)}.${key.name}`,
						default_modifier: (node, to_ctx) =>
							x`${node} !== undefined ? ${node} : ${update_reference(
								contexts,
								n,
								value.right,
								to_ctx
							)}` as Node,
						scope,
						component,
						context_rest_properties
					});
				} else {
					unpack_destructuring({
						contexts,
						node: value,
						modifier: (node) => x`${modifier(node)}.${key.name}` as Node,
						default_modifier,
						scope,
						component,
						context_rest_properties
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
			const { key } = contexts[i];
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
