/** @import { Expression, ForOfStatement, Pattern, Statement, VariableDeclaration } from 'estree' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { dev, is_ignored } from '../../../../state.js';

/**
 * @param {ForOfStatement} node
 * @param {ComponentContext} context
 */
export function ForOfStatement(node, context) {
	if (
		node.await &&
		dev &&
		!is_ignored(node, 'await_reactivity_loss') &&
		context.state.options.experimental.async
	) {
		const left = /** @type {VariableDeclaration | Pattern} */ (context.visit(node.left));
		const argument = /** @type {Expression} */ (context.visit(node.right));
		const body = /** @type {Statement} */ (context.visit(node.body));
		const right = b.call('$.for_await_track_reactivity_loss', argument);
		return b.for_of(left, right, body, true);
	}

	context.next();
}
