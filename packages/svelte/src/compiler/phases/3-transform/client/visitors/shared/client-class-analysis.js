/** @import { Context } from '../../types.js' */
/** @import { MethodDefinition, PropertyDefinition, Expression, StaticBlock, SpreadElement } from 'estree' */
/** @import { StateCreationRuneName } from '../../../../../../utils.js' */
/** @import { AssignmentBuilder, ClassAnalysis, StateFieldBuilder } from '../../../shared/types.js' */
import * as b from '#compiler/builders';
import { create_class_analysis } from '../../../shared/class_analysis.js';
import { should_proxy } from '../../utils.js';

/**
 * @param {Array<MethodDefinition | PropertyDefinition | StaticBlock>} body
 * @returns {ClassAnalysis<Context>}
 */
export function create_client_class_analysis(body) {
	/** @type {StateFieldBuilder<Context>} */
	function build_state_field({ is_private, field, node, context }) {
		let original_id = node.type === 'AssignmentExpression' ? node.left : node.key;
		let value;
		if (node.type === 'AssignmentExpression') {
			// if there's no call expression, this is state that's created in the constructor.
			// it's guaranteed to be the very first assignment to this field, so we initialize
			// the field but don't assign to it.
			value = null;
		} else if (node.value.arguments.length > 0) {
			value = build_init_value(field.kind, node.value.arguments[0], context);
		} else {
			// if no arguments, we know it's state as `$derived()` is a compile error
			value = b.call('$.state');
		}

		if (is_private) {
			return [b.prop_def(field.id, value)];
		}

		const member = b.member(b.this, field.id);
		const val = b.id('value');

		return [
			// #foo;
			b.prop_def(field.id, value),
			// get foo() { return this.#foo; }
			b.method('get', original_id, [], [b.return(b.call('$.get', member))]),
			// set foo(value) { this.#foo = value; }
			b.method(
				'set',
				original_id,
				[val],
				[b.stmt(b.call('$.set', member, val, field.kind === '$state' && b.true))]
			)
		];
	}

	/** @type {AssignmentBuilder<Context>} */
	function build_assignment({ field, node, context }) {
		// ...swap out the assignment to go directly against the private field
		node.left.property = field.id;
		// ...and swap out the assignment's value for the state field init
		node.right = build_init_value(field.kind, node.right.arguments[0], context);
	}

	return create_class_analysis(body, build_state_field, build_assignment);
}

/**
 *
 * @param {StateCreationRuneName} kind
 * @param {Expression | SpreadElement} arg
 * @param {Context} context
 */
function build_init_value(kind, arg, context) {
	const init = /** @type {Expression} **/ (context.visit(arg, context.state));

	switch (kind) {
		case '$state':
			return b.call(
				'$.state',
				should_proxy(init, context.state.scope) ? b.call('$.proxy', init) : init
			);
		case '$state.raw':
			return b.call('$.state', init);
		case '$derived':
			return b.call('$.derived', b.thunk(init));
		case '$derived.by':
			return b.call('$.derived', init);
	}
}
