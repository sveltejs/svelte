/** @import { BlockStatement, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 */
export function IfBlock(node, context) {
	context.state.template.push('<!>');
	const statements = [];

	const consequent = /** @type {BlockStatement} */ (context.visit(node.consequent));
	const consequent_id = context.state.scope.generate('consequent');

	statements.push(b.var(b.id(consequent_id), b.arrow([b.id('$$anchor')], consequent)));

	let alternate_id;

	if (node.alternate) {
		const alternate = /** @type {BlockStatement} */ (context.visit(node.alternate));
		alternate_id = context.state.scope.generate('alternate');
		statements.push(b.var(b.id(alternate_id), b.arrow([b.id('$$anchor')], alternate)));
	}

	/** @type {Expression[]} */
	const args = [
		context.state.node,
		b.arrow(
			[b.id('$$render')],
			b.block([
				b.if(
					/** @type {Expression} */ (context.visit(node.test)),
					b.stmt(b.call(b.id('$$render'), b.id(consequent_id))),
					alternate_id
						? b.stmt(
								b.call(
									b.id('$$render'),
									b.id(alternate_id),
									node.alternate ? b.literal(false) : undefined
								)
							)
						: undefined
				)
			])
		)
	];

	if (node.elseif) {
		// We treat this...
		//
		//   {#if x}
		//     ...
		//   {:else}
		//     {#if y}
		//       <div transition:foo>...</div>
		//     {/if}
		//   {/if}
		//
		// ...slightly differently to this...
		//
		//   {#if x}
		//     ...
		//   {:else if y}
		//     <div transition:foo>...</div>
		//   {/if}
		//
		// ...even though they're logically equivalent. In the first case, the
		// transition will only play when `y` changes, but in the second it
		// should play when `x` or `y` change — both are considered 'local'
		args.push(b.literal(true));
	}

	statements.push(b.stmt(b.call('$.if', ...args)));

	context.state.init.push(b.block(statements));
}
