/** @import { ClassBody } from 'estree' */
/** @import { Context } from '../types' */
import { ClassAnalysis } from './shared/class-analysis.js';

/**
 * @param {ClassBody} node
 * @param {Context} context
 */
export function ClassBody(node, context) {
	context.next({
		...context.state,
		class_state: context.state.analysis.runes ? new ClassAnalysis() : null
	});
}
