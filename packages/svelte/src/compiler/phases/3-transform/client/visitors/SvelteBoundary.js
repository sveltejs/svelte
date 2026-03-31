/** @import { BlockStatement, Expression, Statement, VariableDeclaration } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
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

	// const tags need to live inside the boundary, but might also be referenced in hoisted snippets.
	// to resolve this we cheat: we duplicate const tags inside snippets
	// We'll revert this behavior in the future, it was a mistake to allow this (Component snippets also don't do this).
	/** @type {AST.ConstTag[]} */
	const const_tags = [];

	/** @type {Statement[]} */
	const hoisted = [];

	let has_const = false;

	for (const child of node.fragment.nodes) {
		if (child.type === 'ConstTag') {
			has_const = true;
			nodes.push(child);
			if (!context.state.options.experimental.async) {
				const_tags.push(child);
			}
			continue;
		}

		if (child.type === 'SnippetBlock') {
			if (
				context.state.options.experimental.async &&
				has_const &&
				!['failed', 'pending'].includes(child.expression.name)
			) {
				// we can't hoist snippets as they may reference const tags, so we just keep them in the fragment
				nodes.push(child);
			} else {
				/** @type {Statement[]} */
				const statements = [];

				if (!context.state.options.experimental.async && const_tags.length > 0) {
					child.body.nodes.unshift(...const_tags);
					child.body.metadata.consts.sync.push(...const_tags);
				}

				context.visit(child, { ...context.state, snippets: statements });

				const snippet = /** @type {VariableDeclaration} */ (statements[0]);

				if (['failed', 'pending'].includes(child.expression.name)) {
					props.properties.push(b.prop('init', child.expression, child.expression));
				}

				hoisted.push(snippet);
			}

			continue;
		}

		nodes.push(child);
	}

	const block = /** @type {BlockStatement} */ (
		context.visit(
			{ ...node.fragment, nodes },
			// Since we're creating a new fragment the reference in scopes can't match, so we gotta attach the right scope manually
			{ ...context.state, scope: context.state.scopes.get(node.fragment) ?? context.state.scope }
		)
	);

	const boundary = b.stmt(
		b.call('$.boundary', context.state.node, props, b.arrow([b.id('$$anchor')], block))
	);

	context.state.template.push_comment();
	context.state.init.push(hoisted.length > 0 ? b.block([...hoisted, boundary]) : boundary);
}
