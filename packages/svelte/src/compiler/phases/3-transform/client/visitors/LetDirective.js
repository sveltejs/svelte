/** @import { Expression } from 'estree' */
/** @import { LetDirective } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { create_derived } from '../utils.js';

/**
 * @param {LetDirective} node
 * @param {ComponentContext} context
 */
export function LetDirective(node, context) {
	// let:x        -->  const x = $.derived(() => $$slotProps.x);
	// let:x={{y, z}}  -->  const derived_x = $.derived(() => { const { y, z } = $$slotProps.x; return { y, z }));
	if (node.expression && node.expression.type !== 'Identifier') {
		const name = context.state.scope.generate(node.name);
		const bindings = context.state.scope.get_bindings(node);

		for (const binding of bindings) {
			context.state.transform[binding.node.name] = {
				read: (node) => b.member(b.call('$.get', b.id(name)), node)
			};
		}

		return b.const(
			name,
			b.call(
				'$.derived',
				b.thunk(
					b.block([
						b.let(
							/** @type {Expression} */ (node.expression).type === 'ObjectExpression'
								? // @ts-expect-error types don't match, but it can't contain spread elements and the structure is otherwise fine
									b.object_pattern(node.expression.properties)
								: // @ts-expect-error types don't match, but it can't contain spread elements and the structure is otherwise fine
									b.array_pattern(node.expression.elements),
							b.member(b.id('$$slotProps'), b.id(node.name))
						),
						b.return(b.object(bindings.map((binding) => b.init(binding.node.name, binding.node))))
					])
				)
			)
		);
	} else {
		const name = node.expression === null ? node.name : node.expression.name;
		context.state.transform[name] = {
			read: (node) => b.call('$.get', node)
		};

		return b.const(
			name,
			create_derived(context.state, b.thunk(b.member(b.id('$$slotProps'), b.id(node.name))))
		);
	}
}
