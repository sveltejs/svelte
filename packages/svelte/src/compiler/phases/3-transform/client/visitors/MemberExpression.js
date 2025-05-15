/** @import { MemberExpression } from 'estree' */
/** @import { Context } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {MemberExpression} node
 * @param {Context} context
 */
export function MemberExpression(node, context) {
	// rewrite `this.#foo` as `this.#foo.v` inside a constructor
	if (node.property.type === 'PrivateIdentifier') {
		const field = context.state.class_transformer?.get_field(node.property.name, true);
		if (field) {
			return context.state.in_constructor &&
				(field.kind === '$state.raw' || field.kind === '$state')
				? b.member(node, 'v')
				: b.call('$.get', node);
		}
	}

	context.next();
}
