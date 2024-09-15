/** @import { BlockStatement, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 */
export function IfBlock(node, context) {
	const { state } = context;

	const consequent = /** @type {BlockStatement} */ (context.visit(node.consequent));

	// compile to if rather than $.if for non-reactive if statements
	// NOTE: this only handles expressions that are simple identifiers and doesn't handle else/elseif yet
	if (state.analysis.runes && node.test.type === 'Identifier' && !(node.alternate || node.elseif)) {
		const binding = state.scope.owner(node.test.name)?.declarations.get(node.test.name);
		if (binding?.kind === 'normal') {
			consequent.body.unshift(b.var(b.id('$$anchor'), state.node));
			state.init.push(b.if(node.test, consequent));
			return;
		}
	}

	state.template.push_quasi('<!>');

	const args = [
		state.node,
		b.thunk(/** @type {Expression} */ (context.visit(node.test))),
		b.arrow([b.id('$$anchor')], consequent)
	];

	if (node.alternate || node.elseif) {
		args.push(
			node.alternate
				? b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(node.alternate)))
				: b.literal(null)
		);
	}

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

	state.init.push(b.stmt(b.call('$.if', ...args)));
}
