/** @import { ExpressionStatement, LabeledStatement } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {LabeledStatement} node
 * @param {Context} context
 */
export function LabeledStatementLegacy(node, context) {
	if (context.path.length > 1) return;
	if (node.label.name !== '$') return;

	// TODO bail out if we're in module context

	// these statements will be topologically ordered later
	context.state.legacy_reactive_statements.set(
		node,
		// people could do "break $" inside, so we need to keep the label
		b.labeled('$', /** @type {ExpressionStatement} */ (context.visit(node.body)))
	);

	return b.empty;
}
