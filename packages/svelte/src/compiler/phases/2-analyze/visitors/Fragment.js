/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */

/**
 * @param {AST.Fragment} node
 * @param {Context} context
 */
export function Fragment(node, context) {
	const props_id = context.state.analysis.props_id;

	if (context.path.length === 0 && props_id && props_id.metadata === null) {
		const parent = context.path[0];
		/** @type {AST.RegularElement | null} */
		let first_elem = null;
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
				first_elem = child;
			}
			break;
		}
		/** @type {string | null} */
		let attr = null;
		/** @type {string | null} */
		let suffix = null;
		let empty_comment = false;

		if (first_elem) {
			for (const attribute of first_elem.attributes) {
				if (
					attribute.type === 'Attribute' &&
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
		} else {
			empty_comment = true;
		}
		props_id.metadata = { attr, suffix, empty_comment };
	}

	node.nodes.forEach((node) => context.visit(node, { ...context.state }));
}
