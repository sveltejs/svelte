/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	let suspend = context.state.ast_type === 'instance' && context.state.function_depth === 1;

	if (context.state.expression) {
		context.state.expression.has_await = true;

		if (
			context.state.fragment &&
			// TODO there's probably a better way to do this
			context.path.some((node) => node.type === 'ConstTag')
		) {
			context.state.fragment.metadata.has_await = true;
		}

		suspend = true;
	}

	// disallow top-level `await` or `await` in template expressions
	// unless a) in runes mode and b) opted into `experimental.async`
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
