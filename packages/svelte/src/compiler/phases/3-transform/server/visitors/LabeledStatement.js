/** @import { ExpressionStatement, LabeledStatement } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '#compiler/builders';

/**
 * @param {LabeledStatement} node
 * @param {Context} context
 */
export function LabeledStatement(node, context) {
	if (context.state.analysis.runes || context.path.length > 1 || node.label.name !== '$') {
		return;
	}

	// TODO bail out if we're in module context

	// these statements will be topologically ordered later
	context.state.legacy_reactive_statements.set(
		node,
		// people could do "break $" inside, so we need to keep the label
		b.labeled('$', /** @type {ExpressionStatement} */ (context.visit(node.body)))
	);

	return b.empty;
}
