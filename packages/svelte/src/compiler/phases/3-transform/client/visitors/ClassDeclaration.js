/** @import { ClassBody, ClassDeclaration, Expression, VariableDeclaration } from 'estree' */
/** @import { ClientTransformState, Context } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {ClassDeclaration} node
 * @param {Context} context
 */
export function ClassDeclaration(node, context) {
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
		if (context.path.at(-1)?.type === 'ExportDefaultDeclaration') {
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
		} else {
			return {
				...b.class_declaration(node.id, body, super_class),
				metadata: {
					computed_field_declarations: state.computed_field_declarations
				}
			};
		}
	}
	return b.class_declaration(node.id, body, super_class);
}
