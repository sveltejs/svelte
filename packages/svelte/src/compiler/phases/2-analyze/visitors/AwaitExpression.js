/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const tla = context.state.ast_type === 'instance' && context.state.function_depth === 1;
	let suspend = tla;
	let preserve_context = tla;

	if (context.state.expression) {
		suspend = true;

		// wrap the expression in `(await $.save(...)).restore()` if necessary,
		// i.e. whether anything could potentially be read _after_ the await
		let i = context.path.length;
		while (i--) {
			const parent = context.path[i];

			if (
				// @ts-expect-error we could probably use a neater/more robust mechanism
				parent.metadata?.expression === context.state.expression ||
				// @ts-expect-error
				parent.metadata?.arguments?.includes(context.state.expression)
			) {
				break;
			}

			// TODO make this more accurate — we don't need to call suspend
			// if this is the last thing that could be read
			preserve_context = true;
		}
	}

	if (suspend) {
		if (!context.state.analysis.runes) {
			e.legacy_await_invalid(node);
		}

		context.state.analysis.suspenders.set(node, preserve_context);
	}

	if (context.state.expression) {
		context.state.expression.is_async = true;
	}

	context.next();
}
