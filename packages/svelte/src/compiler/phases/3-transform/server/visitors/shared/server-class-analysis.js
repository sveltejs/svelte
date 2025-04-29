/** @import { Expression, MethodDefinition, StaticBlock, PropertyDefinition } from 'estree' */
/** @import { Context } from '../../types.js' */
/** @import { AssignmentBuilder, StateFieldBuilder } from '../../../shared/types.js' */
/** @import { ClassAnalysis } from '../../../shared/types.js' */

import * as b from '#compiler/builders';
import { dev } from '../../../../../state.js';
import { create_class_analysis } from '../../../shared/class_analysis.js';

/**
 * @param {Array<MethodDefinition | PropertyDefinition | StaticBlock>} body
 * @returns {ClassAnalysis<Context>}
 */
export function create_server_class_analysis(body) {
	/** @type {StateFieldBuilder<Context>} */
	function build_state_field({ is_private, field, node, context }) {
		let original_id = node.type === 'AssignmentExpression' ? node.left : node.key;
		let value;
		if (node.type === 'AssignmentExpression') {
			// This means it's a state assignment in the constructor (this.foo = $state('bar'))
			// which means the state field needs to have no default value so that the initial
			// value can be assigned in the constructor.
			value = null;
		} else if (field.kind !== '$derived' && field.kind !== '$derived.by') {
			return [/** @type {PropertyDefinition} */ (context.visit(node, context.state))];
		} else {
			const init = /** @type {Expression} **/ (
				context.visit(node.value.arguments[0], context.state)
			);
			value =
				field.kind === '$derived.by' ? b.call('$.once', init) : b.call('$.once', b.thunk(init));
		}

		if (is_private) {
			return [b.prop_def(field.id, value)];
		}
		// #foo;
		const member = b.member(b.this, field.id);

		const defs = [
			// #foo;
			b.prop_def(field.id, value),
			// get foo() { return this.#foo; }
			b.method('get', original_id, [], [b.return(b.call(member))])
		];

		// TODO make this work on server
		if (dev) {
			defs.push(
				b.method(
					'set',
					original_id,
					[b.id('_')],
					[b.throw_error(`Cannot update a derived property ('${name}')`)]
				)
			);
		}

		return defs;
	}

	/** @type {AssignmentBuilder<Context>} */
	function build_assignment({ field, node, context }) {
		node.left.property = field.id;
		const init = /** @type {Expression} **/ (context.visit(node.right.arguments[0], context.state));
		node.right =
			field.kind === '$derived.by' ? b.call('$.once', init) : b.call('$.once', b.thunk(init));
	}

	return create_class_analysis(body, build_state_field, build_assignment);
}
