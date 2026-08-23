/** @import { AwaitExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import { save } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const argument = /** @type {Expression} */ (context.visit(node.argument));

	if (context.state.analysis.pickled_awaits.has(node)) {
		return save(argument);
	}

	// in dev, note which values are read inside a reactive expression,
	// but don't track them
	else if (dev && !is_ignored(node, 'await_reactivity_loss')) {
		return b.call(b.await(b.call('$.track_reactivity_loss', argument)));
	}

	// a context restored by an earlier pickled await must end at this suspension;
	// `async_thunk` strips the call again in thunks that contain no `$.save`
	else if (context.state.analysis.reactive_awaits.has(node)) {
		return b.await(b.call('$.suspend', argument));
	}

	return argument === node.argument ? node : { ...node, argument };
}
