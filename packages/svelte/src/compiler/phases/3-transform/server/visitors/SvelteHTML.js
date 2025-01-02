/** @import { Property } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { normalize_attribute } from '../../../../../utils.js';
import { is_event_attribute } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { build_attribute_value } from './shared/utils.js';

/**
 * @param {AST.SvelteHTML} element
 * @param {ComponentContext} context
 */
export function SvelteHTML(element, context) {
	/** @type {Property[]} */
	const attributes = [];

	for (const attribute of element.attributes) {
		if (attribute.type === 'Attribute' && !is_event_attribute(attribute)) {
			const name = normalize_attribute(attribute.name);
			const value = build_attribute_value(attribute.value, context);
			attributes.push(b.init(name, value));
		}
	}

	context.state.template.push(
		b.stmt(b.call('$.svelte_html', b.id('$$payload'), b.object(attributes)))
	);
}
