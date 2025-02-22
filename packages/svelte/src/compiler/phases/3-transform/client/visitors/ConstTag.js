/** @import { Expression, Pattern, Identifier } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { dev } from '../../../../state.js';
import { extract_identifiers } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { create_derived } from '../utils.js';
import { get_value } from './shared/declarations.js';

/**
 * @param {AST.ConstTag} node
 * @param {ComponentContext} context
 */
export function ConstTag(node, context) {
	/** @type {Identifier} */
	let id;

	const declaration = node.declaration.declarations[0];
	// TODO we can almost certainly share some code with $derived(...)
	if (declaration.id.type === 'Identifier') {
		id = declaration.id;
		context.state.init.push(
			b.const(
				id,
				create_derived(
					context.state,
					b.thunk(/** @type {Expression} */ (context.visit(declaration.init)))
				)
			)
		);

		context.state.transform[id.name] = { read: get_value };

		id = declaration.id;
	} else {
		const identifiers = extract_identifiers(declaration.id);
		id = b.id(context.state.scope.generate('computed_const'));

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

		context.state.init.push(b.const(id, create_derived(context.state, fn)));

		for (const node of identifiers) {
			context.state.transform[node.name] = {
				read: (node) => b.member(b.call('$.get', id), node)
			};
		}
	}

	// we need to eagerly evaluate the expression in order to hit any
	// 'Cannot access x before initialization' errors
	if (dev) {
		const parent = context.path.at(-1);
		const boundary = parent?.type === 'SvelteBoundary' ? parent : null;
		const statement = b.stmt(b.call('$.get', id));
		if (boundary) {
			boundary.const_dev_statements ||= [];
			boundary.const_dev_statements.push(statement);
		} else {
			context.state.init.push(statement);
		}
	}
}
