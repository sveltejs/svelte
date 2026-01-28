/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { build_template_chunk, Memoizer } from './shared/utils.js';

/**
 * @param {AST.TitleElement} node
 * @param {ComponentContext} context
 */
export function TitleElement(node, context) {
	const memoizer = new Memoizer();
	const { has_state, value } = build_template_chunk(
		/** @type {any} */ (node.fragment.nodes),
		context,
		context.state,
		(value, metadata) => memoizer.add(value, metadata)
	);
	const evaluated = context.state.scope.evaluate(value);

	const statement = b.stmt(
		b.assignment(
			'=',
			b.member(b.id('$.document'), b.id('title', node.name_loc)),
			evaluated.is_known
				? b.literal(evaluated.value)
				: evaluated.is_defined
					? value
					: b.logical('??', value, b.literal(''))
		)
	);

	// Make sure it only changes the title once async work is done
	if (has_state) {
		context.state.after_update.push(
			b.stmt(
				b.call(
					'$.deferred_template_effect',
					b.arrow(memoizer.apply(), b.block([statement])),
					memoizer.sync_values(),
					memoizer.async_values(),
					memoizer.blockers()
				)
			)
		);
	} else {
		context.state.after_update.push(b.stmt(b.call('$.effect', b.thunk(b.block([statement])))));
	}
}
