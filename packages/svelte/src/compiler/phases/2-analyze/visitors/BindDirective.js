/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import {
	extract_all_identifiers_from_expression,
	is_text_attribute,
	object
} from '../../../utils/ast.js';
import { validate_assignment } from './shared/utils.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { binding_properties } from '../../bindings.js';
import fuzzymatch from '../../1-parse/utils/fuzzymatch.js';
import { is_content_editable_binding, is_svg } from '../../../../utils.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.BindDirective} node
 * @param {Context} context
 */
export function BindDirective(node, context) {
	const parent = context.path.at(-1);

	if (
		parent?.type === 'RegularElement' ||
		parent?.type === 'SvelteElement' ||
		parent?.type === 'SvelteWindow' ||
		parent?.type === 'SvelteDocument' ||
		parent?.type === 'SvelteBody'
	) {
		if (node.name in binding_properties) {
			const property = binding_properties[node.name];
			if (property.valid_elements && !property.valid_elements.includes(parent.name)) {
				e.bind_invalid_target(
					node,
					node.name,
					property.valid_elements.map((valid_element) => `\`<${valid_element}>\``).join(', ')
				);
			}

			if (property.invalid_elements && property.invalid_elements.includes(parent.name)) {
				const valid_bindings = Object.entries(binding_properties)
					.filter(([_, binding_property]) => {
						return (
							binding_property.valid_elements?.includes(parent.name) ||
							(!binding_property.valid_elements &&
								!binding_property.invalid_elements?.includes(parent.name))
						);
					})
					.map(([property_name]) => property_name)
					.sort();

				e.bind_invalid_name(
					node,
					node.name,
					`Possible bindings for <${parent.name}> are ${valid_bindings.join(', ')}`
				);
			}

			if (parent.name === 'input' && node.name !== 'this') {
				const type = /** @type {AST.Attribute | undefined} */ (
					parent.attributes.find((a) => a.type === 'Attribute' && a.name === 'type')
				);

				if (type && !is_text_attribute(type)) {
					if (node.name !== 'value' || type.value === true) {
						e.attribute_invalid_type(type);
					}
				} else {
					if (node.name === 'checked' && type?.value[0].data !== 'checkbox') {
						e.bind_invalid_target(
							node,
							node.name,
							`\`<input type="checkbox">\`${type?.value[0].data === 'radio' ? ` — for \`<input type="radio">\`, use \`bind:group\`` : ''}`
						);
					}

					if (node.name === 'files' && type?.value[0].data !== 'file') {
						e.bind_invalid_target(node, node.name, '`<input type="file">`');
					}
				}
			}

			if (parent.name === 'select' && node.name !== 'this') {
				const multiple = parent.attributes.find(
					(a) =>
						a.type === 'Attribute' &&
						a.name === 'multiple' &&
						!is_text_attribute(a) &&
						a.value !== true
				);

				if (multiple) {
					e.attribute_invalid_multiple(multiple);
				}
			}

			if (node.name === 'offsetWidth' && is_svg(parent.name)) {
				e.bind_invalid_target(
					node,
					node.name,
					`non-\`<svg>\` elements. Use \`bind:clientWidth\` for \`<svg>\` instead`
				);
			}

			if (is_content_editable_binding(node.name)) {
				const contenteditable = /** @type {AST.Attribute} */ (
					parent.attributes.find((a) => a.type === 'Attribute' && a.name === 'contenteditable')
				);

				if (!contenteditable) {
					e.attribute_contenteditable_missing(node);
				} else if (!is_text_attribute(contenteditable) && contenteditable.value !== true) {
					e.attribute_contenteditable_dynamic(contenteditable);
				}
			}
		} else {
			const match = fuzzymatch(node.name, Object.keys(binding_properties));

			if (match) {
				const property = binding_properties[match];
				if (!property.valid_elements || property.valid_elements.includes(parent.name)) {
					e.bind_invalid_name(node, node.name, `Did you mean '${match}'?`);
				}
			}

			e.bind_invalid_name(node, node.name);
		}
	}

	// When dealing with bind getters/setters skip the specific binding validation
	// Group bindings aren't supported for getter/setters so we don't need to handle
	// the metadata
	if (node.expression.type === 'SequenceExpression') {
		if (node.name === 'group') {
			e.bind_group_invalid_expression(node);
		}

		let i = /** @type {number} */ (node.expression.start);
		let leading_comments_start = /**@type {any}*/ (node.expression.leadingComments?.at(0))?.start;
		let leading_comments_end = /**@type {any}*/ (node.expression.leadingComments?.at(-1))?.end;
		while (context.state.analysis.source[--i] !== '{') {
			if (
				context.state.analysis.source[i] === '(' &&
				// if the parenthesis is in a leading comment we don't need to throw the error
				!(
					leading_comments_start &&
					leading_comments_end &&
					i <= leading_comments_end &&
					i >= leading_comments_start
				)
			) {
				e.bind_invalid_parens(node, node.name);
			}
		}

		if (node.expression.expressions.length !== 2) {
			e.bind_invalid_expression(node);
		}

		mark_subtree_dynamic(context.path);

		const [get, set] = node.expression.expressions;
		// We gotta jump across the getter/setter functions to avoid the expression metadata field being reset to null
		context.visit(get.type === 'ArrowFunctionExpression' ? get.body : get, {
			...context.state,
			expression: node.metadata.expression
		});
		context.visit(set.type === 'ArrowFunctionExpression' ? set.body : set, {
			...context.state,
			expression: node.metadata.expression
		});
		return;
	}

	validate_assignment(node, node.expression, context);

	const assignee = node.expression;
	const left = object(assignee);

	if (left === null) {
		e.bind_invalid_expression(node);
	}

	const binding = context.state.scope.get(left.name);
	node.metadata.binding = binding;

	if (assignee.type === 'Identifier') {
		// reassignment
		if (
			node.name !== 'this' && // bind:this also works for regular variables
			(!binding ||
				(binding.kind !== 'state' &&
					binding.kind !== 'raw_state' &&
					binding.kind !== 'prop' &&
					binding.kind !== 'bindable_prop' &&
					binding.kind !== 'each' &&
					binding.kind !== 'store_sub' &&
					!binding.updated)) // TODO wut?
		) {
			e.bind_invalid_value(node.expression);
		}
	}

	if (node.name === 'group') {
		if (!binding) {
			throw new Error('Cannot find declaration for bind:group');
		}

		if (binding.kind === 'snippet') {
			e.bind_group_invalid_snippet_parameter(node);
		}

		// Traverse the path upwards and find all EachBlocks who are (indirectly) contributing to bind:group,
		// i.e. one of their declarations is referenced in the binding. This allows group bindings to work
		// correctly when referencing a variable declared in an EachBlock by using the index of the each block
		// entries as keys.
		const each_blocks = [];
		const [keypath, expression_ids] = extract_all_identifiers_from_expression(node.expression);
		let ids = expression_ids;

		let i = context.path.length;
		while (i--) {
			const parent = context.path[i];

			if (parent.type === 'EachBlock') {
				const references = ids.filter((id) => parent.metadata.declarations.has(id.name));

				if (references.length > 0) {
					parent.metadata.contains_group_binding = true;

					each_blocks.push(parent);
					ids = ids.filter((id) => !references.includes(id));
					ids.push(...extract_all_identifiers_from_expression(parent.expression)[1]);
				}
			}
		}

		// The identifiers that make up the binding expression form they key for the binding group.
		// If the same identifiers in the same order are used in another bind:group, they will be in the same group.
		// (there's an edge case where `bind:group={a[i]}` will be in a different group than `bind:group={a[j]}` even when i == j,
		//  but this is a limitation of the current static analysis we do; it also never worked in Svelte 4)
		const bindings = expression_ids.map((id) => context.state.scope.get(id.name));
		let group_name;

		outer: for (const [[key, b], group] of context.state.analysis.binding_groups) {
			if (b.length !== bindings.length || key !== keypath) continue;
			for (let i = 0; i < bindings.length; i++) {
				if (bindings[i] !== b[i]) continue outer;
			}
			group_name = group;
		}

		if (!group_name) {
			group_name = context.state.scope.root.unique('binding_group');
			context.state.analysis.binding_groups.set([keypath, bindings], group_name);
		}

		node.metadata = {
			binding_group_name: group_name,
			parent_each_blocks: each_blocks,
			expression: node.metadata.expression
		};
	}

	if (binding?.kind === 'each' && binding.metadata?.inside_rest) {
		w.bind_invalid_each_rest(binding.node, binding.node.name);
	}

	context.next({ ...context.state, expression: node.metadata.expression });
}
