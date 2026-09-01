/** @import { MemberExpression } from 'estree' */
/** @import { Context } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {MemberExpression} node
 * @param {Context} context
 */
export function MemberExpression(node, context) {
	if (
		context.state.analysis.runes &&
		node.object.type === 'Identifier' &&
		node.property.type === 'Identifier' &&
		!node.computed
	) {
		const binding = context.state.scope.get(node.object.name);
		const parent = context.path.at(-1);

		if (
			binding?.kind === 'rest_prop' &&
			node.object !== binding.node &&
			parent?.type !== 'AssignmentExpression' &&
			parent?.type !== 'UpdateExpression' &&
			!binding.metadata?.exclude_props?.includes(node.property.name)
		) {
			return context.state.is_instance
				? b.call('$.get_prop_value', b.id('$$props'), b.literal(node.property.name))
				: b.member(b.id('$$props'), node.property);
		}
	}

	// rewrite `this.#foo` as `this.#foo.v` inside a constructor
	if (node.property.type === 'PrivateIdentifier') {
		const field = context.state.state_fields.get('#' + node.property.name);

		if (field) {
			return context.state.in_constructor &&
				(field.type === '$state.raw' || field.type === '$state')
				? b.member(node, 'v')
				: b.call('$.get', node);
		}
	}

	context.next();
}
