import { x } from 'code-red';
import { Node, Identifier, Expression } from 'estree';
import { walk } from 'estree-walker';
import is_reference from 'is-reference';

export interface Context {
	key: Identifier;
	name?: string;
	modifier: (node: Node) => Node;
	default_modifier: (node: Node, to_ctx: (name: string) => Node) => Node;
}

export function unpack_destructuring(contexts: Context[], node: Node, modifier: Context['modifier'] = node => node, default_modifier: Context['default_modifier'] = node => node) {
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
	} else if (node.type === 'ArrayPattern') {
		node.elements.forEach((element, i) => {
			if (element && element.type === 'RestElement') {
				unpack_destructuring(contexts, element, node => x`${modifier(node)}.slice(${i})` as Node, default_modifier);
			} else if (element && element.type === 'AssignmentPattern') {
				const n = contexts.length;

				unpack_destructuring(contexts, element.left, node => x`${modifier(node)}[${i}]`, (node, to_ctx) => x`${node} !== undefined ? ${node} : ${update_reference(contexts, n, element.right, to_ctx)}` as Node);
			} else {
				unpack_destructuring(contexts, element, node => x`${modifier(node)}[${i}]` as Node, default_modifier);
			}
		});
	} else if (node.type === 'ObjectPattern') {
		const used_properties = [];

		node.properties.forEach((property) => {
			if (property.type === 'RestElement') {
				unpack_destructuring(
					contexts,
					property.argument,
					node => x`@object_without_properties(${modifier(node)}, [${used_properties}])` as Node,
					default_modifier
				);
			} else {
				const key = property.key as Identifier;
				const value = property.value;

				used_properties.push(x`"${key.name}"`);
				if (value.type === 'AssignmentPattern') {
					const n = contexts.length;

					unpack_destructuring(contexts, value.left, node => x`${modifier(node)}.${key.name}`, (node, to_ctx) => x`${node} !== undefined ? ${node} : ${update_reference(contexts, n, value.right, to_ctx)}` as Node);
				} else {
					unpack_destructuring(contexts, value, node => x`${modifier(node)}.${key.name}` as Node, default_modifier);
				}
			}
		});
	}
}

function update_reference(contexts: Context[], n: number, expression: Expression, to_ctx: (name: string) => Node): Node {
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
	expression = JSON.parse(JSON.stringify(expression)) as Expression;
	walk(expression, {
		enter(node, parent: Node) {
			if (is_reference(node, parent)) {
				this.replace(find_from_context(node as Identifier));
				this.skip();
			}
		}
	});

	return expression;
}
