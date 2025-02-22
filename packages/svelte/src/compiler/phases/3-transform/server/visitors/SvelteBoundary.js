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

	/** @type {Statement[]} */
	const statements = [];

	/** @type {Expression | null} */
	let call_expression = null;

	const payload = b.id('$$payload'); // correct ?
	const out_pos = b.id('$$pos');
	let err_id = b.id('$$err');

	/** @type {Statement[]} */
	let catch_statements = [
		b.stmt(
			b.assignment(
				'=',
				b.member(payload, 'out'),
				b.call(b.member(payload, 'out.substring'), b.literal(0), out_pos)
			)
		)
	];

	statements.push(
		b.declaration('const', [b.declarator(out_pos.name, b.member(payload, 'out.length'))])
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
			/** @type {Statement[]} */
			const init = [];
			context.visit(child, { ...context.state, init });
			catch_statements.push(...init);
			call_expression = child.expression;
		} else if (child.type === 'ConstTag') {
			/** @type {Statement[]} */
			const init = [];
			context.visit(child, { ...context.state, init });
			statements.push(...init);
		} else {
			nodes.push(child);
		}
	}

	const block = /** @type {BlockStatement} */ (context.visit({ ...node.fragment, nodes }));

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
