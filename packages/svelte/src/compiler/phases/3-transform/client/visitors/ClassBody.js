/** @import { ClassBody } from 'estree' */
/** @import { Context } from '../types' */
import { create_client_class_transformer } from './shared/client-class-transformer.js';

/**
 * @param {ClassBody} node
 * @param {Context} context
 */
export function ClassBody(node, context) {
	if (!context.state.analysis.runes) {
		context.next();
		return;
	}

	const class_transformer = create_client_class_transformer(node.body);
	const body = class_transformer.generate_body(context);

	return { ...node, body };
}
