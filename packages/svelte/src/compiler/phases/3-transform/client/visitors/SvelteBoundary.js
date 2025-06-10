/** @import { BlockStatement, Statement, Expression, FunctionDeclaration, VariableDeclaration, ArrowFunctionExpression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { dev } from '../../../../state.js';
import * as b from '#compiler/builders';

/**
 * @param {AST.SvelteBoundary} node
 * @param {ComponentContext} context
 */
export function SvelteBoundary(node, context) {
	const props = b.object([]);

	for (const attribute of node.attributes) {
		if (attribute.type !== 'Attribute' || attribute.value === true) {
			// these can't exist, because they would have caused validation
			// to fail, but typescript doesn't know that
			continue;
		}

		const chunk = Array.isArray(attribute.value)
			? /** @type {AST.ExpressionTag} */ (attribute.value[0])
			: attribute.value;

		const expression = /** @type {Expression} */ (context.visit(chunk.expression, context.state));

		if (chunk.metadata.expression.has_state) {
			props.properties.push(b.get(attribute.name, [b.return(expression)]));
		} else {
			props.properties.push(b.init(attribute.name, expression));
		}
	}

	const nodes = [];

	/** @type {Statement[]} */
	const const_tags = [];

	/** @type {Statement[]} */
	const hoisted = [];

	// const tags need to live inside the boundary, but might also be referenced in hoisted snippets.
	// to resolve this we cheat: we duplicate const tags inside snippets
	for (const child of node.fragment.nodes) {
		if (child.type === 'ConstTag') {
			context.visit(child, { ...context.state, init: const_tags });
		}
	}

	for (const child of node.fragment.nodes) {
		if (child.type === 'ConstTag') {
			continue;
		}

		if (child.type === 'SnippetBlock') {
			/** @type {Statement[]} */
			const statements = [];

			context.visit(child, { ...context.state, init: statements });

			const snippet = /** @type {VariableDeclaration} */ (statements[0]);

			const snippet_fn = dev
				? // @ts-expect-error we know this shape is correct
					snippet.declarations[0].init.arguments[1]
				: snippet.declarations[0].init;

			snippet_fn.body.body.unshift(
				...const_tags.filter((node) => node.type === 'VariableDeclaration')
			);

			hoisted.push(snippet);

			if (child.expression.name === 'failed') {
				props.properties.push(b.prop('init', child.expression, child.expression));
			}

			continue;
		}

		nodes.push(child);
	}

	const block = /** @type {BlockStatement} */ (context.visit({ ...node.fragment, nodes }));

	block.body.unshift(...const_tags);

	const boundary = b.stmt(
		b.call('$.boundary', context.state.node, props, b.arrow([b.id('$$anchor')], block))
	);

	context.state.template.push_comment();
	context.state.init.push(hoisted.length > 0 ? b.block([...hoisted, boundary]) : boundary);
}
