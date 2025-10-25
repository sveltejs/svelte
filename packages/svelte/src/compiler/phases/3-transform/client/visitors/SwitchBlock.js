/** @import { BlockStatement, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.SwitchBlock} node
 * @param {ComponentContext} context
 */
export function SwitchBlock(node, context) {
	context.state.template.push_comment();
	const statements = [];

	const value = /** @type {Expression} */ (context.visit(node.value));

	/** @type {Expression[]} */
	const args = [
		context.state.node,
		b.arrow(
			[b.id('$$render')],
			b.block([
				b.switch_statement(
					value,
					node.consequences.map((node_consequent, index) => {
						const consequent = /** @type {BlockStatement} */ (context.visit(node_consequent));
						const consequent_id = context.state.scope.generate('consequent');
						statements.push(b.var(b.id(consequent_id), b.arrow([b.id('$$anchor')], consequent)));

						return b.switch_case(node.values[index], [
							b.stmt(b.call(b.id('$$render'), b.id(consequent_id), b.literal(index))),
							b.break()
						]);
					})
				)
			])
		)
	];

	statements.push(b.stmt(b.call('$.switch', ...args)));

	context.state.init.push(b.block(statements));
}
