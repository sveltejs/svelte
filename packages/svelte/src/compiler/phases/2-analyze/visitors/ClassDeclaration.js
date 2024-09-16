/** @import { ClassDeclaration } from 'estree' */
/** @import { Context } from '../types' */
import * as w from '../../../warnings.js';
import { validate_identifier_name } from './shared/utils.js';

/**
 * @param {ClassDeclaration} node
 * @param {Context} context
 */
export function ClassDeclaration(node, context) {
	if (context.state.analysis.runes) {
		validate_identifier_name(context.state.scope.get(node.id.name));
	}

	// In modules, we allow top-level module scope only, in components, we allow the component scope,
	// which is function_depth of 1. With the exception of `new class` which is also not allowed at
	// component scope level either.
	const allowed_depth = context.state.ast_type === 'module' ? 0 : 1;

	if (context.state.scope.function_depth > allowed_depth) {
		w.perf_avoid_nested_class(node);
	}

	context.next();
}
