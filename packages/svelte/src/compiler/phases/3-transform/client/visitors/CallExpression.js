/** @import { CallExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import { is_ignored } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';
import { get_rune } from '../../../scope.js';
import { transform_inspect_rune } from '../../utils.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	const rune = get_rune(node, context.state.scope);

	if (rune === '$host') {
		return b.id('$$props.$$host');
	}

	if (rune === '$effect.tracking') {
		return b.call('$.effect_tracking');
	}

	if (rune === '$state.snapshot') {
		return b.call(
			'$.snapshot',
			/** @type {Expression} */ (context.visit(node.arguments[0])),
			is_ignored(node, 'state_snapshot_uncloneable') && b.true
		);
	}

	if (rune === '$state.is') {
		return b.call(
			'$.is',
			/** @type {Expression} */ (context.visit(node.arguments[0])),
			/** @type {Expression} */ (context.visit(node.arguments[1]))
		);
	}

	if (rune === '$effect.root') {
		const args = /** @type {Expression[]} */ (node.arguments.map((arg) => context.visit(arg)));
		return b.call('$.effect_root', ...args);
	}

	if (rune === '$inspect' || rune === '$inspect().with') {
		return transform_inspect_rune(node, context);
	}

	context.next();
}
