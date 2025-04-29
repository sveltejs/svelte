/** @import { ClassBody } from 'estree' */
/** @import { Context } from '../types.js' */
import { create_server_class_analysis } from './shared/server-class-analysis.js';

/**
 * @param {ClassBody} node
 * @param {Context} context
 */
export function ClassBody(node, context) {
	if (!context.state.analysis.runes) {
		context.next();
		return;
	}

	const class_analysis = create_server_class_analysis(node.body);
	const body = class_analysis.generate_body(context);

	return { ...node, body };
}
