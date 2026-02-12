/** @import { BlockStatement, Expression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { block_close, block_open, block_open_else, create_child_block } from './shared/utils.js';

/**
 * @param {AST.EachBlock} node
 * @param {ComponentContext} context
 */
export function EachBlock(node, context) {
	const state = context.state;

	const each_node_meta = node.metadata;
	const collection = /** @type {Expression} */ (context.visit(node.expression));
	const index =
		each_node_meta.contains_group_binding || !node.index ? each_node_meta.index : b.id(node.index);

	const array_id = state.scope.root.unique('each_array');

	/** @type {Statement[]} */
	let statements = [b.const(array_id, b.call('$.ensure_array_like', collection))];

	/** @type {Statement[]} */
	const each = [];

	if (node.context) {
		each.push(b.let(node.context, b.member(array_id, index, true)));
	}

	if (index.name !== node.index && node.index != null) {
		each.push(b.let(node.index, index));
	}

	const new_body = /** @type {BlockStatement} */ (context.visit(node.body)).body;

	if (node.body) each.push(...new_body);

	const for_loop = b.for(
		b.declaration('let', [
			b.declarator(index, b.literal(0)),
			b.declarator('$$length', b.member(array_id, 'length'))
		]),
		b.binary('<', index, b.id('$$length')),
		b.update('++', index, false),
		b.block(each)
	);

	if (node.fallback) {
		const open = b.stmt(b.call(b.id('$$renderer.push'), block_open));

		const fallback = /** @type {BlockStatement} */ (context.visit(node.fallback));

		fallback.body.unshift(b.stmt(b.call(b.id('$$renderer.push'), block_open_else)));

		statements.push(
			b.if(
				b.binary('!==', b.member(array_id, 'length'), b.literal(0)),
				b.block([open, for_loop]),
				fallback
			)
		);
	} else {
		state.template.push(block_open);
		statements.push(for_loop);
	}

	state.template.push(
		...create_child_block(
			statements,
			node.metadata.expression.blockers(),
			node.metadata.expression.has_await
		),
		block_close
	);
}
