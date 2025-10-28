/** @import { ClassBody, ClassExpression, Expression, VariableDeclaration } from 'estree' */
/** @import { ClientTransformState, Context } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {ClassExpression} node
 * @param {Context} context
 */
export function ClassExpression(node, context) {
	/** @type {ClientTransformState & { computed_field_declarations: VariableDeclaration[] }} */
	const state = {
		...context.state,
		computed_field_declarations: []
	};
	const super_class = node.superClass
		? /** @type {Expression} */ (context.visit(node.superClass))
		: null;
	const body = /** @type {ClassBody} */ (context.visit(node.body, state));
	if (state.computed_field_declarations.length > 0) {
		return b.call(
			b.arrow(
				[],
				b.block([
					...state.computed_field_declarations,
					b.return(b.class(node.id, body, super_class))
				])
			)
		);
	}
	return b.class(node.id, body, super_class);
}
