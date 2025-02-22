/** @import { BlockStatement, Identifier, Statement, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { attr } from 'svelte/internal/client';
import { BLOCK_CLOSE, BLOCK_OPEN } from '../../../../../internal/server/hydration.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.SvelteBoundary} node
 * @param {ComponentContext} context
 */
export function SvelteBoundary(node, context) {
	const props = b.object([]);

	const nodes = [];

	/** @type {AST.SnippetBlock | null} */
	let failed_snippet = null;

	/** @type {Statement[]} */
	const statements = [];

	/** @type {Expression | null} */
	let call_expression = null;

	const payload = b.id('$$payload'); // correct ?
	const out_len = b.id('$$out_len');

	statements.push(
		b.declaration('const', [b.declarator(out_len.name, b.member(payload, 'out.length'))])
	);

	// Capture the `failed` explicit snippet prop
	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute' && attribute.name === 'failed' && attribute.value !== true) {
			/** @type {Statement[]} */
			const init = [];
			context.visit(attribute, { ...context.state, init });
			statements.push(...init);

			const chunk = Array.isArray(attribute.value)
				? /** @type {AST.ExpressionTag} */ (attribute.value[0])
				: attribute.value;
			call_expression = /** @type {Expression} */ (context.visit(chunk.expression, context.state));
		}
	}

	// Capture the `failed` implicit snippet prop
	for (const child of node.fragment.nodes) {
		if (child.type === 'SnippetBlock' && child.expression.name === 'failed') {
			failed_snippet = child;
			call_expression = failed_snippet.expression;
		} else if (child.type === 'ConstTag') {
			/** @type {Statement[]} */
			const init = [];
			context.visit(child, { ...context.state, init });
			statements.push(...init);
		} else {
			nodes.push(child);
		}
	}

	if (failed_snippet) {
		/** @type {Statement[]} */
		const init = [];
		context.visit(failed_snippet, { ...context.state, init });
		//props.properties.push(b.prop('init', failed_snippet.expression, failed_snippet.expression));
		statements.push(...init);
	}

	const block = /** @type {BlockStatement} */ (context.visit({ ...node.fragment, nodes }));

	/** @type {Identifier | null} */
	let err_id = b.id('$$err');

	/** @type {Statement[]} */
	let catch_statements = [];

	catch_statements.push(
		b.stmt(
			b.assignment(
				'=',
				b.member(payload, 'out'),
				b.call(b.member(payload, 'out.substring'), b.literal(0), out_len)
			)
		)
	);

	if (call_expression) {
		catch_statements.push(b.stmt(b.call(call_expression, payload, err_id)));
	}

	statements.push(b.try_catch(block, err_id, b.block(catch_statements)));

	context.state.template.push(
		b.literal(BLOCK_OPEN),
		b.block([...statements]),
		b.literal(BLOCK_CLOSE)
	);
}
