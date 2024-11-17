/** @import { BlockStatement, Expression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { is_hydratable } from '../../../../../internal/server/hydration.js';
import { empty_comment } from './shared/utils.js';

/**
 * @param {AST.KeyBlock} node
 * @param {ComponentContext} context
 */
export function KeyBlock(node, context) {
	const templates = /** @type {Array<Expression | Statement>} */ ([
		/** @type {BlockStatement} */ (context.visit(node.fragment))
	]);

	if (is_hydratable()) {
		templates.unshift(empty_comment);
		templates.push(empty_comment);
	}

	context.state.template.push(...templates);
}
