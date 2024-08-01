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
	switch (get_rune(node, context.state.scope)) {
		case '$host':
			return b.id('$$props.$$host');

		case '$effect.tracking':
			return b.call('$.effect_tracking');

		case '$state.snapshot':
			return b.call(
				'$.snapshot',
				/** @type {Expression} */ (context.visit(node.arguments[0])),
				is_ignored(node, 'state_snapshot_uncloneable') && b.true
			);

		case '$state.is':
			return b.call(
				'$.is',
				/** @type {Expression} */ (context.visit(node.arguments[0])),
				/** @type {Expression} */ (context.visit(node.arguments[1]))
			);

		case '$effect.root':
			return b.call(
				'$.effect_root',
				.../** @type {Expression[]} */ (node.arguments.map((arg) => context.visit(arg)))
			);

		case '$inspect':
		case '$inspect().with':
			return transform_inspect_rune(node, context);
	}

	context.next();
}
