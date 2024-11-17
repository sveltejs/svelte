/** @import { BlockStatement, Expression, Pattern, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { BLOCK_OPEN_ELSE, is_hydratable } from '../../../../../internal/server/hydration.js';
import * as b from '../../../../utils/builders.js';
import { block_close, block_open } from './shared/utils.js';

/**
 * @param {AST.EachBlock} node
 * @param {ComponentContext} context
 */
export function EachBlock(node, context) {
	const hydratable = is_hydratable();
	const state = context.state;

	const each_node_meta = node.metadata;
	const collection = /** @type {Expression} */ (context.visit(node.expression));
	const index =
		each_node_meta.contains_group_binding || !node.index ? each_node_meta.index : b.id(node.index);

	const array_id = state.scope.root.unique('each_array');
	state.init.push(b.const(array_id, b.call('$.ensure_array_like', collection)));

	/** @type {Statement[]} */
	const each = [b.let(/** @type {Pattern} */ (node.context), b.member(array_id, index, true))];

	if (index.name !== node.index && node.index != null) {
		each.push(b.let(node.index, index));
	}

	each.push(.../** @type {BlockStatement} */ (context.visit(node.body)).body);

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
		const fallback = /** @type {BlockStatement} */ (context.visit(node.fallback));

		const block = /** @type {Statement[]} */ ([for_loop]);

		if (hydratable) {
			block.unshift(b.stmt(b.assignment('+=', b.id('$$payload.out'), block_open)));

			fallback.body.unshift(
				b.stmt(b.assignment('+=', b.id('$$payload.out'), b.literal(BLOCK_OPEN_ELSE)))
			);
		}

		const templates = /** @type {Array<Expression | Statement>} */ ([
			b.if(b.binary('!==', b.member(array_id, 'length'), b.literal(0)), b.block(block), fallback)
		]);
		if (hydratable) {
			templates.push(block_close);
		}

		state.template.push(...templates);
	} else {
		const templates = /** @type {Array<Expression | Statement>} */ ([for_loop]);
		if (hydratable) {
			templates.unshift(block_open);
			templates.push(block_close);
		}
		state.template.push(...templates);
	}
}
