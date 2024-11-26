/** @import { BlockStatement, Statement, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

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

		if (attribute.metadata.expression.has_state) {
			props.properties.push(b.get(attribute.name, [b.return(expression)]));
		} else {
			props.properties.push(b.init(attribute.name, expression));
		}
	}

	const nodes = [];

	/** @type {Statement[]} */
	const snippet_statements = [];

	// Capture the `failed` implicit snippet prop
	for (const child of node.fragment.nodes) {
		if (child.type === 'SnippetBlock' && child.expression.name === 'failed') {
			/** @type {Statement[]} */
			const init = [];
			context.visit(child, { ...context.state, init });
			props.properties.push(b.prop('init', child.expression, child.expression));
			snippet_statements.push(...init);
		} else {
			nodes.push(child);
		}
	}

	const block = /** @type {BlockStatement} */ (context.visit({ ...node.fragment, nodes }));

	const boundary = b.stmt(
		b.call('$.boundary', context.state.node, props, b.arrow([b.id('$$anchor')], block))
	);

	context.state.template.push('<!>');
	context.state.init.push(
		snippet_statements.length > 0 ? b.block([...snippet_statements, boundary]) : boundary
	);
}
