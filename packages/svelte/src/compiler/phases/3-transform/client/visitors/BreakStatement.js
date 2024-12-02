/** @import { BreakStatement } from 'estree' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {BreakStatement} node
 * @param {ComponentContext} context
 */
export function BreakStatement(node, context) {
	if (context.state.analysis.runes || !node.label || node.label.name !== '$') {
		return;
	}

	const in_reactive_statement =
		context.path[1].type === 'LabeledStatement' && context.path[1].label.name === '$';

	if (in_reactive_statement) {
		return b.return();
	}
}
