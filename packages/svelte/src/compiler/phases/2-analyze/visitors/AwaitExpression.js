/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const tla = context.state.ast_type === 'instance' && context.state.function_depth === 1;

	if (tla) {
		context.state.analysis.context_preserving_awaits.add(node);
	}

	let suspend = tla;

	if (context.state.expression) {
		context.state.expression.awaits.push({ node, path: context.path.slice() });
		context.state.expression.has_await = true;
		suspend = true;
	}

	if (suspend) {
		if (!context.state.options.experimental.async) {
			e.experimental_async(node);
		}

		if (!context.state.analysis.runes) {
			e.legacy_await_invalid(node);
		}
	}

	context.next();
}
