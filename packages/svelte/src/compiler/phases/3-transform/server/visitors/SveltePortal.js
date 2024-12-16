/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { build_attribute_value } from './shared/utils.js';

/**
 * @param {AST.SveltePortal} node
 * @param {ComponentContext} context
 */
export function SveltePortal(node, context) {
	const _for = node.attributes.find((attr) => attr.type === 'Attribute' && attr.name === 'for');
	const target = node.attributes.find(
		(attr) => attr.type === 'Attribute' && attr.name === 'target'
	);

	if (target) {
		const value = build_attribute_value(/** @type {AST.Attribute} */ (target).value, context);
		const body = /** @type {BlockStatement} */ (context.visit(node.fragment, context.state));
		context.state.template.push(
			b.stmt(b.call('$.portal', b.id('$$payload'), value, b.arrow([b.id('$$payload')], body)))
		);
	} else {
		const value = build_attribute_value(/** @type {AST.Attribute} */ (_for).value, context);
		context.state.template.push(b.stmt(b.call('$.portal_outlet', b.id('$$payload'), value)));
	}
}
