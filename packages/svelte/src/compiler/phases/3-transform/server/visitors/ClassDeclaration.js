/** @import { ClassBody, ClassDeclaration, Expression, VariableDeclaration } from 'estree' */
/** @import { ServerTransformState, Context } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {ClassDeclaration} node
 * @param {Context} context
 */
export function ClassDeclaration(node, context) {
	/** @type {ServerTransformState & { computed_field_declarations: VariableDeclaration[] }} */
	const state = {
		...context.state,
		computed_field_declarations: []
	};
	const super_class = node.superClass
		? /** @type {Expression} */ (context.visit(node.superClass))
		: null;
	const body = /** @type {ClassBody} */ (context.visit(node.body, state));
	if (state.computed_field_declarations.length > 0) {
		const init = b.call(
			b.arrow(
				[],
				b.block([
					...state.computed_field_declarations,
					b.return(b.class(node.id, body, super_class))
				])
			)
		);
		return node.id ? b.var(node.id, init) : init;
	}
	return b.class_declaration(node.id, body, super_class);
}
