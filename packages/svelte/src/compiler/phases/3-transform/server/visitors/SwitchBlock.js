/** @import { BlockStatement, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { HYDRATION_START } from '../../../../../constants.js';
import * as b from '../../../../utils/builders.js';
import { block_close } from './shared/utils.js';

/**
 * @param {AST.SwitchBlock} node
 * @param {ComponentContext} context
 */
export function SwitchBlock(node, context) {
	const discriminant = /** @type {Expression} */ (context.visit(node.value));

	const cases = node.consequences.map((node_consequent, index) => {
		const consequent = /** @type {BlockStatement} */ (context.visit(node_consequent));
		consequent.body.unshift(
			b.stmt(b.call(b.id('$$renderer.push'), b.literal(`<!--${HYDRATION_START}${index}-->`)))
		);
		consequent.body.push(b.break());

		return b.switch_case(node.values[index], consequent.body);
	});

	// if there is no default block, we still have to create a hydration open marker
	if (node.values.at(-1) !== null) {
		const default_consequent = b.block([]);
		default_consequent.body.unshift(
			b.stmt(
				b.call(b.id('$$renderer.push'), b.literal(`<!--${HYDRATION_START}${node.values.length}-->`))
			)
		);
		cases.push(b.switch_case(null, default_consequent.body));
	}

	context.state.template.push(b.switch_statement(discriminant, cases), block_close);
}
