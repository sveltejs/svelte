/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_attribute_value } from './shared/element.js';

/**
 * @param {AST.SveltePortal} node
 * @param {ComponentContext} context
 */
export function SveltePortal(node, context) {
	const _for = node.attributes.find((attr) => attr.type === 'Attribute' && attr.name === 'for');
	const target = node.attributes.find(
		(attr) => attr.type === 'Attribute' && attr.name === 'target'
	);

	context.state.template.push('<!>');

	if (target) {
		// TODO handle reactive targets? Doesn't really make sense IMHO
		const value = build_attribute_value(/** @type {AST.Attribute} */ (target).value, context);
		const body = /** @type {BlockStatement} */ (
			context.visit(node.fragment, { ...context.state, transform: { ...context.state.transform } })
		);
		context.state.init.push(
			b.stmt(b.call('$.portal', value.value, b.arrow([b.id('$$anchor')], body)))
		);
	} else {
		// TODO reactive sources? Doesn't really make sense IMHO
		const value = build_attribute_value(/** @type {AST.Attribute} */ (_for).value, context);
		context.state.init.push(b.stmt(b.call('$.portal_outlet', context.state.node, value.value)));
	}
}
