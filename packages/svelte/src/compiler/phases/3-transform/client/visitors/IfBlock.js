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

	const consequent = /** @type {BlockStatement} */ (context.visit(node.consequent));
	const consequent_id = context.state.scope.generate('consequent');

	context.state.init.push(b.var(b.id(consequent_id), b.arrow([b.id('$$anchor')], consequent)));

	let alternate_id;

	if (node.alternate) {
		const alternate = /** @type {BlockStatement} */ (context.visit(node.alternate));
		alternate_id = context.state.scope.generate('alternate');
		context.state.init.push(b.var(b.id(alternate_id), b.arrow([b.id('$$anchor')], alternate)));
	}

	/** @type {Expression[]} */
	const args = [
		context.state.node,
		b.arrow(
			[b.id('$$branch')],
			b.block([
				b.if(
					/** @type {Expression} */ (context.visit(node.test)),
					b.stmt(b.call(b.id('$$branch'), b.literal(0), b.id(consequent_id))),
					alternate_id
						? b.stmt(b.call(b.id('$$branch'), b.literal(1), b.id(alternate_id)))
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

	context.state.init.push(b.stmt(b.call('$.if', ...args)));
}
