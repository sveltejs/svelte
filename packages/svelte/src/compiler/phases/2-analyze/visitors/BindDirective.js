/** @import { Attribute, BindDirective } from '#compiler' */
/** @import { Context } from '../types' */
import { is_text_attribute, object } from '../../../utils/ast.js';
import { validate_no_const_assignment } from './shared/utils.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { binding_properties } from '../../bindings.js';
import { ContentEditableBindings, SVGElements } from '../../constants.js';
import fuzzymatch from '../../1-parse/utils/fuzzymatch.js';

/**
 * @param {BindDirective} node
 * @param {Context} context
 */
export function BindDirective(node, context) {
	validate_no_const_assignment(node, node.expression, context.state.scope, true);

	const assignee = node.expression;
	const left = object(assignee);

	if (left === null) {
		e.bind_invalid_expression(node);
	}

	const binding = context.state.scope.get(left.name);

	if (assignee.type === 'Identifier') {
		// reassignment
		if (
			node.name !== 'this' && // bind:this also works for regular variables
			(!binding ||
				(binding.kind !== 'state' &&
					binding.kind !== 'frozen_state' &&
					binding.kind !== 'prop' &&
					binding.kind !== 'bindable_prop' &&
					binding.kind !== 'each' &&
					binding.kind !== 'store_sub' &&
					!binding.mutated))
		) {
			e.bind_invalid_value(node.expression);
		}

		if (binding?.kind === 'derived') {
			e.constant_binding(node.expression, 'derived state');
		}

		if (context.state.analysis.runes && binding?.kind === 'each') {
			e.each_item_invalid_assignment(node);
		}

		if (binding?.kind === 'snippet') {
			e.snippet_parameter_assignment(node);
		}
	}

	if (node.name === 'group') {
		if (!binding) {
			throw new Error('Cannot find declaration for bind:group');
		}
	}

	if (binding?.kind === 'each' && binding.metadata?.inside_rest) {
		w.bind_invalid_each_rest(binding.node, binding.node.name);
	}

	const parent = context.path.at(-1);

	if (
		parent?.type === 'RegularElement' ||
		parent?.type === 'SvelteElement' ||
		parent?.type === 'SvelteWindow' ||
		parent?.type === 'SvelteDocument' ||
		parent?.type === 'SvelteBody'
	) {
		if (context.state.options.namespace === 'foreign' && node.name !== 'this') {
			e.bind_invalid_name(node, node.name, 'Foreign elements only support `bind:this`');
		}

		if (node.name in binding_properties) {
			const property = binding_properties[node.name];
			if (property.valid_elements && !property.valid_elements.includes(parent.name)) {
				e.bind_invalid_target(
					node,
					node.name,
					property.valid_elements.map((valid_element) => `<${valid_element}>`).join(', ')
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
				const type = /** @type {Attribute | undefined} */ (
					parent.attributes.find((a) => a.type === 'Attribute' && a.name === 'type')
				);
				if (type && !is_text_attribute(type)) {
					if (node.name !== 'value' || type.value === true) {
						e.attribute_invalid_type(type);
					}
					return; // bind:value can handle dynamic `type` attributes
				}

				if (node.name === 'checked' && type?.value[0].data !== 'checkbox') {
					e.bind_invalid_target(node, node.name, '<input type="checkbox">');
				}

				if (node.name === 'files' && type?.value[0].data !== 'file') {
					e.bind_invalid_target(node, node.name, '<input type="file">');
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

			if (node.name === 'offsetWidth' && SVGElements.includes(parent.name)) {
				e.bind_invalid_target(
					node,
					node.name,
					`non-<svg> elements. Use 'clientWidth' for <svg> instead`
				);
			}

			if (ContentEditableBindings.includes(node.name)) {
				const contenteditable = /** @type {Attribute} */ (
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
}
