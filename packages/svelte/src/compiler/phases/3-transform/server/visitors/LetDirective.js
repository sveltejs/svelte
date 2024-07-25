/** @import { LetDirective } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {LetDirective} node
 * @param {ComponentContext} context
 */
export function LetDirective(node, context) {
	return b.empty;

	if (node.expression === null || node.expression.type === 'Identifier') {
		const name = node.expression === null ? node.name : node.expression.name;
		return b.const(name, b.member(b.id('$$slotProps'), b.id(node.name)));
	}

	const name = context.state.scope.generate(node.name);
	const bindings = context.state.scope.get_bindings(node);

	for (const binding of bindings) {
		context.state.getters[binding.node.name] = b.member(b.id(name), b.id(binding.node.name));
	}

	return b.const(
		name,
		b.call(
			b.thunk(
				b.block([
					b.let(
						node.expression.type === 'ObjectExpression'
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
}
