/** @import { AST } from '#compiler' */
/** @import { Context } from '../../types' */
import { get_attribute_expression } from '../../../../utils/ast.js';
import * as e from '../../../../errors.js';
import * as w from '../../../../warnings.js';

/**
 * Warns when an event attribute uses the shorthand form (`{onclick}`) but the
 * referenced name isn't declared, so it silently resolves to the global handler.
 * @param {AST.Attribute} attribute
 * @param {Context} context
 */
export function check_global_event_reference(attribute, context) {
	const value = get_attribute_expression(
		/** @type {AST.Attribute & { value: [AST.ExpressionTag] | AST.ExpressionTag }} */ (attribute)
	);

	if (
		value.type === 'Identifier' &&
		value.name === attribute.name &&
		!context.state.scope.get(value.name)
	) {
		w.attribute_global_event_reference(attribute, attribute.name);
	}
}

/**
 * @param {AST.SvelteBody | AST.SvelteDocument | AST.SvelteOptionsRaw | AST.SvelteWindow} node
 */
export function disallow_children(node) {
	const { nodes } = node.fragment;

	if (nodes.length > 0) {
		const first = nodes[0];
		const last = nodes[nodes.length - 1];

		e.svelte_meta_invalid_content({ start: first.start, end: last.end }, node.name);
	}
}
