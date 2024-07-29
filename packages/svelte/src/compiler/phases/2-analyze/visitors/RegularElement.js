/** @import { RegularElement } from '#compiler' */
/** @import { Context } from '../types' */
import {
	is_tag_valid_with_ancestor,
	is_tag_valid_with_parent
} from '../../../../html-tree-validation.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { SVGElements, VoidElements } from '../../constants.js';
import { validate_element } from './shared/element.js';

/**
 * @param {RegularElement} node
 * @param {Context} context
 */
export function RegularElement(node, context) {
	if (node.name === 'textarea' && node.fragment.nodes.length > 0) {
		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute' && attribute.name === 'value') {
				e.textarea_invalid_content(node);
			}
		}
	}

	const binding = context.state.scope.get(node.name);
	if (
		binding !== null &&
		binding.declaration_kind === 'import' &&
		binding.references.length === 0
	) {
		w.component_name_lowercase(node, node.name);
	}

	validate_element(node, context);

	if (context.state.parent_element) {
		let past_parent = false;
		let only_warn = false;

		for (let i = context.path.length - 1; i >= 0; i--) {
			const ancestor = context.path[i];

			if (
				ancestor.type === 'IfBlock' ||
				ancestor.type === 'EachBlock' ||
				ancestor.type === 'AwaitBlock' ||
				ancestor.type === 'KeyBlock'
			) {
				// We're creating a separate template string inside blocks, which means client-side this would work
				only_warn = true;
			}

			if (!past_parent) {
				if (ancestor.type === 'RegularElement' && ancestor.name === context.state.parent_element) {
					if (!is_tag_valid_with_parent(node.name, context.state.parent_element)) {
						if (only_warn) {
							w.node_invalid_placement_ssr(
								node,
								`\`<${node.name}>\``,
								context.state.parent_element
							);
						} else {
							e.node_invalid_placement(node, `\`<${node.name}>\``, context.state.parent_element);
						}
					}

					past_parent = true;
				}
			} else if (ancestor.type === 'RegularElement') {
				if (!is_tag_valid_with_ancestor(node.name, ancestor.name)) {
					if (only_warn) {
						w.node_invalid_placement_ssr(node, `\`<${node.name}>\``, ancestor.name);
					} else {
						e.node_invalid_placement(node, `\`<${node.name}>\``, ancestor.name);
					}
				}
			} else if (
				ancestor.type === 'Component' ||
				ancestor.type === 'SvelteComponent' ||
				ancestor.type === 'SvelteElement' ||
				ancestor.type === 'SvelteSelf' ||
				ancestor.type === 'SnippetBlock'
			) {
				break;
			}
		}
	}

	// Strip off any namespace from the beginning of the node name.
	const node_name = node.name.replace(/[a-zA-Z-]*:/g, '');

	if (
		context.state.analysis.source[node.end - 2] === '/' &&
		context.state.options.namespace !== 'foreign' &&
		!VoidElements.includes(node_name) &&
		!SVGElements.includes(node_name)
	) {
		w.element_invalid_self_closing_tag(node, node.name);
	}

	context.next({
		...context.state,
		parent_element: node.name
	});
}
