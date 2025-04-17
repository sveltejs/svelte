/** @import { Expression, Pattern } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { dev } from '../../../../state.js';
import { extract_identifiers } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { create_derived } from '../utils.js';
import { get_value } from './shared/declarations.js';

/**
 * @param {AST.ConstTag} node
 * @param {ComponentContext} context
 */
export function ConstTag(node, context) {
	const declaration = node.declaration.declarations[0];
	// TODO we can almost certainly share some code with $derived(...)
	if (declaration.id.type === 'Identifier') {
		context.state.init.push(
			b.const(
				declaration.id,
				create_derived(
					context.state,
					b.thunk(/** @type {Expression} */ (context.visit(declaration.init)))
				)
			)
		);

		context.state.transform[declaration.id.name] = { read: get_value };

		// we need to eagerly evaluate the expression in order to hit any
		// 'Cannot access x before initialization' errors
		if (dev) {
			context.state.init.push(b.stmt(b.call('$.get', declaration.id)));
		}
	} else {
		const identifiers = extract_identifiers(declaration.id);
		const tmp = b.id(context.state.scope.generate('computed_const'));

		const transform = { ...context.state.transform };

		// Make all identifiers that are declared within the following computed regular
		// variables, as they are not signals in that context yet
		for (const node of identifiers) {
			delete transform[node.name];
		}

		const child_state = { ...context.state, transform };

		// TODO optimise the simple `{ x } = y` case — we can just return `y`
		// instead of destructuring it only to return a new object
		const fn = b.arrow(
			[],
			b.block([
				b.const(
					/** @type {Pattern} */ (context.visit(declaration.id, child_state)),
					/** @type {Expression} */ (context.visit(declaration.init, child_state))
				),
				b.return(b.object(identifiers.map((node) => b.prop('init', node, node))))
			])
		);

		context.state.init.push(b.const(tmp, create_derived(context.state, fn)));

		// we need to eagerly evaluate the expression in order to hit any
		// 'Cannot access x before initialization' errors
		if (dev) {
			context.state.init.push(b.stmt(b.call('$.get', tmp)));
		}

		for (const node of identifiers) {
			context.state.transform[node.name] = {
				read: (node) => b.member(b.call('$.get', tmp), node)
			};
		}
	}
}
