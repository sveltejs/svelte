/** @import { ExpressionStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { is_dom_property, normalize_attribute } from '../../../../../utils.js';
import { is_ignored } from '../../../../state.js';
import { is_event_attribute } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { build_attribute_value } from './shared/element.js';
import { visit_event_attribute } from './shared/events.js';

/**
 * @param {AST.SvelteHTML} element
 * @param {ComponentContext} context
 */
export function SvelteHTML(element, context) {
	const node_id = b.id('$.document.documentElement');

	for (const attribute of element.attributes) {
		if (attribute.type === 'Attribute') {
			if (is_event_attribute(attribute)) {
				visit_event_attribute(attribute, context);
			} else {
				const name = normalize_attribute(attribute.name);
				const { value, has_state } = build_attribute_value(attribute.value, context);

				/** @type {ExpressionStatement} */
				let update;

				if (name === 'class') {
					update = b.stmt(b.call('$.set_class', node_id, value));
				} else if (is_dom_property(name)) {
					update = b.stmt(b.assignment('=', b.member(node_id, name), value));
				} else {
					update = b.stmt(
						b.call(
							'$.set_attribute',
							node_id,
							b.literal(name),
							value,
							is_ignored(element, 'hydration_attribute_changed') && b.true
						)
					);
				}

				if (has_state) {
					context.state.update.push(update);
				} else {
					context.state.init.push(update);
				}

				if (context.state.options.dev) {
					context.state.init.push(
						b.stmt(b.call('$.validate_svelte_html_attribute', b.literal(name)))
					);
				}
			}
		}
	}
}
