/** @import { Expression, MethodDefinition, StaticBlock, PropertyDefinition, SpreadElement } from 'estree' */
/** @import { Context } from '../../types.js' */
/** @import { AssignmentBuilder, StateFieldBuilder } from '../../../shared/types.js' */
/** @import { ClassTransformer } from '../../../shared/types.js' */
/** @import { StateCreationRuneName } from '../../../../../../utils.js' */

import * as b from '#compiler/builders';
import { dev } from '../../../../../state.js';
import { create_class_transformer } from '../../../shared/class_transformer.js';

/**
 * @param {Array<MethodDefinition | PropertyDefinition | StaticBlock>} body
 * @returns {ClassTransformer<Context>}
 */
export function create_server_class_transformer(body) {
	/** @type {StateFieldBuilder<Context>} */
	function build_state_field({ is_private, field, node, context }) {
		let original_id = node.type === 'AssignmentExpression' ? node.left.property : node.key;
		let value;
		if (node.type === 'AssignmentExpression') {
			// This means it's a state assignment in the constructor (this.foo = $state('bar'))
			// which means the state field needs to have no default value so that the initial
			// value can be assigned in the constructor.
			value = null;
		} else if (field.kind !== '$derived' && field.kind !== '$derived.by') {
			return [/** @type {PropertyDefinition} */ (context.visit(node))];
		} else {
			const init = /** @type {Expression} **/ (context.visit(node.value.arguments[0]));
			value =
				field.kind === '$derived.by' ? b.call('$.once', init) : b.call('$.once', b.thunk(init));
		}

		if (is_private) {
			return [b.prop_def(field.id, value)];
		}
		// #foo;
		const member = b.member(b.this, field.id);

		/** @type {Array<MethodDefinition | PropertyDefinition>} */
		const defs = [
			// #foo;
			b.prop_def(field.id, value)
		];

		// get foo() { return this.#foo; }
		if (field.kind === '$state' || field.kind === '$state.raw') {
			defs.push(b.method('get', original_id, [], [b.return(member)]));
		} else {
			defs.push(b.method('get', original_id, [], [b.return(b.call(member))]));
		}

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
		return {
			...node,
			left: {
				...node.left,
				// ...swap out the assignment to go directly against the private field
				property: field.id,
				computed: false
			},
			// ...and swap out the assignment's value for the state field init
			right: build_init_value(field.kind, node.right.arguments[0], context)
		};
	}

	return create_class_transformer(body, build_state_field, build_assignment);
}

/**
 *
 * @param {StateCreationRuneName} kind
 * @param {Expression | SpreadElement} arg
 * @param {Context} context
 */
function build_init_value(kind, arg, context) {
	const init = arg ? /** @type {Expression} **/ (context.visit(arg)) : b.void0;

	switch (kind) {
		case '$state':
		case '$state.raw':
			return init;
		case '$derived':
			return b.call('$.once', b.thunk(init));
		case '$derived.by':
			return b.call('$.once', init);
	}
}
