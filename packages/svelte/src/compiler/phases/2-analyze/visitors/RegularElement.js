/** @import { RegularElement } from '#compiler' */
/** @import { Context } from '../types' */
import { is_mathml, is_svg, is_void } from '../../../../utils.js';
import {
	is_tag_valid_with_ancestor,
	is_tag_valid_with_parent
} from '../../../../html-tree-validation.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { create_attribute, is_custom_element_node } from '../../nodes.js';
import { regex_starts_with_newline } from '../../patterns.js';
import { check_element } from './shared/a11y.js';
import { validate_element } from './shared/element.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {RegularElement} node
 * @param {Context} context
 */
export function RegularElement(node, context) {
	validate_element(node, context);

	check_element(node, context.state);

	context.state.analysis.elements.push(node);

	// Special case: Move the children of <textarea> into a value attribute if they are dynamic
	if (node.name === 'textarea' && node.fragment.nodes.length > 0) {
		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute' && attribute.name === 'value') {
				e.textarea_invalid_content(node);
			}
		}

		if (node.fragment.nodes.length > 1 || node.fragment.nodes[0].type !== 'Text') {
			const first = node.fragment.nodes[0];
			if (first.type === 'Text') {
				// The leading newline character needs to be stripped because of a qirk:
				// It is ignored by browsers if the tag and its contents are set through
				// innerHTML, but we're now setting it through the value property at which
				// point it is _not_ ignored, so we need to strip it ourselves.
				// see https://html.spec.whatwg.org/multipage/syntax.html#element-restrictions
				// see https://html.spec.whatwg.org/multipage/grouping-content.html#the-pre-element
				first.data = first.data.replace(regex_starts_with_newline, '');
				first.raw = first.raw.replace(regex_starts_with_newline, '');
			}

			node.attributes.push(
				create_attribute(
					'value',
					/** @type {import('#compiler').Text} */ (node.fragment.nodes.at(0)).start,
					/** @type {import('#compiler').Text} */ (node.fragment.nodes.at(-1)).end,
					// @ts-ignore
					node.fragment.nodes
				)
			);

			node.fragment.nodes = [];
		}
	}

	// Special case: single expression tag child of option element -> add "fake" attribute
	// to ensure that value types are the same (else for example numbers would be strings)
	if (
		node.name === 'option' &&
		node.fragment.nodes?.length === 1 &&
		node.fragment.nodes[0].type === 'ExpressionTag' &&
		!node.attributes.some(
			(attribute) => attribute.type === 'Attribute' && attribute.name === 'value'
		)
	) {
		const child = node.fragment.nodes[0];
		node.attributes.push(create_attribute('value', child.start, child.end, [child]));
	}

	const binding = context.state.scope.get(node.name);
	if (
		binding !== null &&
		binding.declaration_kind === 'import' &&
		binding.references.length === 0
	) {
		w.component_name_lowercase(node, node.name);
	}

	node.metadata.has_spread = node.attributes.some(
		(attribute) => attribute.type === 'SpreadAttribute'
	);

	node.metadata.svg = is_svg(node.name);
	node.metadata.mathml = is_mathml(node.name);

	if (is_custom_element_node(node) && node.attributes.length > 0) {
		// we're setting all attributes on custom elements through properties
		mark_subtree_dynamic(context.path);
	}

	if (context.state.parent_element) {
		let past_parent = false;
		let only_warn = false;
		const ancestors = [context.state.parent_element];

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
				ancestors.push(ancestor.name);

				if (!is_tag_valid_with_ancestor(node.name, ancestors)) {
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
		!is_void(node_name) &&
		!is_svg(node_name)
	) {
		w.element_invalid_self_closing_tag(node, node.name);
	}

	context.next({ ...context.state, parent_element: node.name });
}
