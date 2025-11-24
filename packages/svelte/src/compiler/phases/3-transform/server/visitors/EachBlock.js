/** @import { BlockStatement, Expression, Pattern, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { block_close, block_open, block_open_else, create_async_block } from './shared/utils.js';

/**
 * @param {AST.EachBlock} node
 * @param {ComponentContext} context
 */
export function EachBlock(node, context) {
	const state = context.state;

	const each_node_meta = node.metadata;
	let collection = /** @type {Expression} */ (context.visit(node.expression));
	const destructured_pattern = get_destructured_pattern(node.context);

	if (destructured_pattern) {
		const mapper =
			destructured_pattern.type === 'ArrayPattern'
				? create_array_snapshot_mapper(destructured_pattern)
				: create_object_snapshot_mapper();

		collection = b.call('$.snapshot_each_value', collection, mapper);
	}
	const index =
		each_node_meta.contains_group_binding || !node.index ? each_node_meta.index : b.id(node.index);

	const array_id = state.scope.root.unique('each_array');

	/** @type {Statement} */
	let block = b.block([b.const(array_id, b.call('$.ensure_array_like', collection))]);

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

		block.body.push(
			b.if(
				b.binary('!==', b.member(array_id, 'length'), b.literal(0)),
				b.block([open, for_loop]),
				fallback
			)
		);
	} else {
		state.template.push(block_open);
		block.body.push(for_loop);
	}

	if (node.metadata.expression.is_async()) {
		state.template.push(
			create_async_block(
				block,
				node.metadata.expression.blockers(),
				node.metadata.expression.has_await
			),
			block_close
		);
	} else {
		state.template.push(...block.body, block_close);
	}
}

/**
 * @param {Pattern | null} pattern
 * @returns {import('estree').ArrayPattern | import('estree').ObjectPattern | null}
 */
function get_destructured_pattern(pattern) {
	if (!pattern) return null;
	if (pattern.type === 'ArrayPattern' || pattern.type === 'ObjectPattern') {
		return pattern;
	}

	return null;
}

/**
 * @param {import('estree').ArrayPattern} pattern
 */
function create_array_snapshot_mapper(pattern) {
	const value = b.id('$$value');
	const has_rest = pattern.elements.some((element) => element?.type === 'RestElement');

	return b.arrow(
		[value],
		b.call('$.snapshot_array', value, b.literal(pattern.elements.length), has_rest ? b.true : b.false)
	);
}

function create_object_snapshot_mapper() {
	const value = b.id('$$value');
	return b.arrow([value], b.call('$.snapshot_object', value));
}
