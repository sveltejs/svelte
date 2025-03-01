/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */

/**
 * @param {AST.Fragment} node
 * @return {AST.RegularElement | null}
 */
function search_first_elem(node) {
	for (const child of node.nodes) {
		if (
			child.type === 'SvelteOptions' ||
			child.type === 'SvelteWindow' ||
			child.type === 'SvelteBody' ||
			child.type === 'SvelteHead' ||
			child.type === 'SvelteDocument' ||
			child.type === 'SnippetBlock' ||
			(child.type === 'Text' && child.raw.trim().length === 0)
		) {
			continue;
		} else if (child.type === 'RegularElement') {
			return child;
		}
		break;
	}
	return null;
}

/**
 * @param {AST.Fragment} node
 * @param {Context} context
 */
export function Fragment(node, context) {
	const props_id = context.state.analysis.props_id;

	// If the component has a $props.id(),
	// We check if the root fragment starts with a RegularElement
	if (context.path.length === 0 && props_id && props_id.metadata === null) {
		let first_elem = search_first_elem(node);

		/** @type {string | null} */
		let attr = null;
		/** @type {string | null} */
		let suffix = null;

		if (first_elem) {
			// If the fragment starts with a RegularElement
			// We look for an attribute that starts with the $props.id()
			// so we can remove the hydration comment, and read the attribute.
			// (note that this cannot be done on <svelte:element>, as it use an extra hydration comment)
			for (const attribute of first_elem.attributes) {
				if (attribute.type === 'SpreadAttribute') {
					// reset
					attr = null;
					suffix = null;
				} else if (
					attribute.type === 'Attribute' &&
					attribute.name.toLowerCase() !== 'class' &&
					attribute.name.toLowerCase() !== 'style' &&
					attribute.value !== true &&
					(attr === null || attr.length > attribute.name.length)
				) {
					if (Array.isArray(attribute.value)) {
						const attr0 = attribute.value[0];
						if (
							attr0.type === 'ExpressionTag' &&
							attr0.expression.type === 'Identifier' &&
							attr0.expression.name === props_id.name
						) {
							if (attribute.value.length === 1) {
								attr = attribute.name;
								suffix = null;
							} else if (
								attribute.value[1].type === 'Text' &&
								!'0123456789'.includes(attribute.value[1].data[0])
							) {
								attr = attribute.name;
								suffix = attribute.value[1].data[0];
							}
						}
					} else if (
						attribute.value.expression.type === 'Identifier' &&
						attribute.value.expression.name === props_id.name
					) {
						attr = attribute.name;
						suffix = null;
					}
				}
			}
		}
		props_id.metadata = { attr, suffix };
	}

	node.nodes.forEach((node) => context.visit(node, { ...context.state }));
}
