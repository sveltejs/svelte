/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import * as b from '#compiler/builders';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	let suspend = context.state.ast_type === 'instance' && context.state.function_depth === 1;

	if (context.state.expression) {
		context.state.expression.has_await = true;

		if (context.state.fragment && context.path.some((node) => node.type === 'ConstTag')) {
			context.state.fragment.metadata.has_await = true;
		}

		if (context.state.fragment) {
			const len = context.state.fragment.metadata.hoisted_promises.promises.push(node.argument);
			context.state.analysis.hoisted_promises.set(
				node.argument,
				b.member(context.state.fragment.metadata.hoisted_promises.id, b.literal(len - 1), true)
			);
		}

		suspend = true;
	}

	if (context.state.title) {
		context.state.title.metadata.has_await = true;
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

		context.state.analysis.suspends_without_fallback ||= !context.state.boundary?.metadata.pending;
	}

	context.next();
}
