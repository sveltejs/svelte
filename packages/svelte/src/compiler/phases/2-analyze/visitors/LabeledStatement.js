/** @import { LabeledStatement } from 'estree' */
/** @import { SvelteNode } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';

/**
 * @param {LabeledStatement} node
 * @param {Context} context
 */
export function LabeledStatement(node, context) {
	if (node.label.name === '$') {
		const parent = /** @type {SvelteNode} */ (context.path.at(-1));

		const is_reactive_statement =
			context.state.ast_type === 'instance' && parent.type === 'Program';

		if (context.state.analysis.runes) {
			if (is_reactive_statement) {
				e.legacy_reactive_statement_invalid(node);
			}
		} else {
			if (!is_reactive_statement) {
				w.reactive_declaration_invalid_placement(node);
			}
		}
	}

	context.next();
}
