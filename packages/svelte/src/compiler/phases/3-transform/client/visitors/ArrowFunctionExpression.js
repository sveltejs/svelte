/** @import { ArrowFunctionExpression } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { visit_function } from './shared/function.js';

/**
 * @param {ArrowFunctionExpression} node
 * @param {ComponentContext} context
 */
export function ArrowFunctionExpression(node, context) {
	const captures = context.state.analysis.script_replay?.callbacks.get(node);
	const native = context.state.script_replay_captures;
	if (captures && native) {
		const transform = { ...context.state.transform };
		for (const binding of captures) {
			const name = binding.node.name;
			if (context.state.scope.get(name) !== binding) continue;
			if (native[name]) transform[name] = native[name];
			else delete transform[name];
		}
		return visit_function(node, {
			...context,
			state: { ...context.state, transform, script_replay_captures: undefined }
		});
	}
	return visit_function(node, context);
}
