/** @import { ExpressionStatement, Property } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { normalize_attribute } from '../../../../../utils.js';
import { is_event_attribute } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { build_attribute_value } from './shared/element.js';
import { visit_event_attribute } from './shared/events.js';

/**
 * @param {AST.SvelteHTML} element
 * @param {ComponentContext} context
 */
export function SvelteHTML(element, context) {
	/** @type {Property[]} */
	const attributes = [];

	for (const attribute of element.attributes) {
		if (attribute.type === 'Attribute') {
			if (is_event_attribute(attribute)) {
				visit_event_attribute(attribute, context);
			} else {
				const name = normalize_attribute(attribute.name);
				const { value } = build_attribute_value(attribute.value, context);

				attributes.push(b.init(name, value));

				if (context.state.options.dev) {
					context.state.init.push(
						b.stmt(b.call('$.validate_svelte_html_attribute', b.literal(name)))
					);
				}
			}
		}
	}

	if (attributes.length > 0) {
		context.state.init.push(b.stmt(b.call('$.svelte_html', b.arrow([], b.object(attributes)))));
	}
}
