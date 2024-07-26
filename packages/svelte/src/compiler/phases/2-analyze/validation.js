/** @import { AssignmentExpression, CallExpression, Expression, Identifier, Node, Pattern, PrivateIdentifier, Super, UpdateExpression, VariableDeclarator } from 'estree' */
/** @import { Attribute, Component, ElementLike, Fragment, RegularElement, SvelteComponent, SvelteElement, SvelteNode, SvelteSelf, TransitionDirective } from '#compiler' */
/** @import { NodeLike } from '../../errors.js' */
/** @import { AnalysisState, Context, Visitors } from './types.js' */
import is_reference from 'is-reference';
import * as e from '../../errors.js';
import {
	extract_identifiers,
	get_attribute_expression,
	get_parent,
	is_expression_attribute,
	is_text_attribute,
	object,
	unwrap_optional
} from '../../utils/ast.js';
import * as w from '../../warnings.js';
import fuzzymatch from '../1-parse/utils/fuzzymatch.js';
import { binding_properties } from '../bindings.js';
import {
	ContentEditableBindings,
	EventModifiers,
	Runes,
	SVGElements,
	VoidElements
} from '../constants.js';
import { is_custom_element_node } from '../nodes.js';
import {
	regex_illegal_attribute_character,
	regex_not_whitespace,
	regex_only_whitespaces
} from '../patterns.js';
import { Scope, get_rune } from '../scope.js';
import { merge } from '../visitors.js';
import { a11y_validators } from './a11y.js';
import {
	is_tag_valid_with_ancestor,
	is_tag_valid_with_parent
} from '../../../html-tree-validation.js';

/**
 * @param {Attribute} attribute
 * @param {ElementLike} parent
 */
function validate_attribute(attribute, parent) {
	if (
		Array.isArray(attribute.value) &&
		attribute.value.length === 1 &&
		attribute.value[0].type === 'ExpressionTag' &&
		(parent.type === 'Component' ||
			parent.type === 'SvelteComponent' ||
			parent.type === 'SvelteSelf' ||
			(parent.type === 'RegularElement' && is_custom_element_node(parent)))
	) {
		w.attribute_quoted(attribute);
	}

	if (attribute.value === true || !Array.isArray(attribute.value) || attribute.value.length === 1) {
		return;
	}

	const is_quoted = attribute.value.at(-1)?.end !== attribute.end;

	if (!is_quoted) {
		e.attribute_unquoted_sequence(attribute);
	}
}

/**
 * @param {Component | SvelteComponent | SvelteSelf} node
 * @param {Context} context
 */
function validate_component(node, context) {
	for (const attribute of node.attributes) {
		if (
			attribute.type !== 'Attribute' &&
			attribute.type !== 'SpreadAttribute' &&
			attribute.type !== 'LetDirective' &&
			attribute.type !== 'OnDirective' &&
			attribute.type !== 'BindDirective'
		) {
			e.component_invalid_directive(attribute);
		}

		if (
			attribute.type === 'OnDirective' &&
			(attribute.modifiers.length > 1 || attribute.modifiers.some((m) => m !== 'once'))
		) {
			e.event_handler_invalid_component_modifier(attribute);
		}

		if (attribute.type === 'Attribute') {
			if (context.state.analysis.runes) {
				validate_attribute(attribute, node);

				if (is_expression_attribute(attribute)) {
					const expression = get_attribute_expression(attribute);
					if (expression.type === 'SequenceExpression') {
						let i = /** @type {number} */ (expression.start);
						while (--i > 0) {
							const char = context.state.analysis.source[i];
							if (char === '(') break; // parenthesized sequence expressions are ok
							if (char === '{') e.attribute_invalid_sequence_expression(expression);
						}
					}
				}
			}

			validate_attribute_name(attribute);

			if (attribute.name === 'slot') {
				validate_slot_attribute(context, attribute, true);
			}
		}
	}

	context.next({
		...context.state,
		parent_element: null,
		component_slots: new Set()
	});
}

const react_attributes = new Map([
	['className', 'class'],
	['htmlFor', 'for']
]);

/**
 * @param {RegularElement | SvelteElement} node
 * @param {Context} context
 */
function validate_element(node, context) {
	let has_animate_directive = false;

	/** @type {TransitionDirective | null} */
	let in_transition = null;

	/** @type {TransitionDirective | null} */
	let out_transition = null;

	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute') {
			const is_expression = is_expression_attribute(attribute);

			if (context.state.analysis.runes) {
				validate_attribute(attribute, node);

				if (is_expression) {
					const expression = get_attribute_expression(attribute);
					if (expression.type === 'SequenceExpression') {
						let i = /** @type {number} */ (expression.start);
						while (--i > 0) {
							const char = context.state.analysis.source[i];
							if (char === '(') break; // parenthesized sequence expressions are ok
							if (char === '{') e.attribute_invalid_sequence_expression(expression);
						}
					}
				}
			}

			if (regex_illegal_attribute_character.test(attribute.name)) {
				e.attribute_invalid_name(attribute, attribute.name);
			}

			if (attribute.name.startsWith('on') && attribute.name.length > 2) {
				if (!is_expression) {
					e.attribute_invalid_event_handler(attribute);
				}

				const value = get_attribute_expression(attribute);
				if (
					value.type === 'Identifier' &&
					value.name === attribute.name &&
					!context.state.scope.get(value.name)
				) {
					w.attribute_global_event_reference(attribute, attribute.name);
				}
			}

			if (attribute.name === 'slot') {
				/** @type {RegularElement | SvelteElement | Component | SvelteComponent | SvelteSelf | undefined} */
				validate_slot_attribute(context, attribute);
			}

			if (attribute.name === 'is' && context.state.options.namespace !== 'foreign') {
				w.attribute_avoid_is(attribute);
			}

			const correct_name = react_attributes.get(attribute.name);
			if (correct_name) {
				w.attribute_invalid_property_name(attribute, attribute.name, correct_name);
			}

			validate_attribute_name(attribute);
		} else if (attribute.type === 'AnimateDirective') {
			const parent = context.path.at(-2);
			if (parent?.type !== 'EachBlock') {
				e.animation_invalid_placement(attribute);
			} else if (!parent.key) {
				e.animation_missing_key(attribute);
			} else if (
				parent.body.nodes.filter(
					(n) =>
						n.type !== 'Comment' &&
						n.type !== 'ConstTag' &&
						(n.type !== 'Text' || n.data.trim() !== '')
				).length > 1
			) {
				e.animation_invalid_placement(attribute);
			}

			if (has_animate_directive) {
				e.animation_duplicate(attribute);
			} else {
				has_animate_directive = true;
			}
		} else if (attribute.type === 'TransitionDirective') {
			const existing = /** @type {TransitionDirective | null} */ (
				(attribute.intro && in_transition) || (attribute.outro && out_transition)
			);

			if (existing) {
				const a = existing.intro ? (existing.outro ? 'transition' : 'in') : 'out';
				const b = attribute.intro ? (attribute.outro ? 'transition' : 'in') : 'out';

				if (a === b) {
					e.transition_duplicate(attribute, a);
				} else {
					e.transition_conflict(attribute, a, b);
				}
			}

			if (attribute.intro) in_transition = attribute;
			if (attribute.outro) out_transition = attribute;
		} else if (attribute.type === 'OnDirective') {
			let has_passive_modifier = false;
			let conflicting_passive_modifier = '';
			for (const modifier of attribute.modifiers) {
				if (!EventModifiers.includes(modifier)) {
					const list = `${EventModifiers.slice(0, -1).join(', ')} or ${EventModifiers.at(-1)}`;
					e.event_handler_invalid_modifier(attribute, list);
				}
				if (modifier === 'passive') {
					has_passive_modifier = true;
				} else if (modifier === 'nonpassive' || modifier === 'preventDefault') {
					conflicting_passive_modifier = modifier;
				}
				if (has_passive_modifier && conflicting_passive_modifier) {
					e.event_handler_invalid_modifier_combination(
						attribute,
						'passive',
						conflicting_passive_modifier
					);
				}
			}
		}
	}
}

/**
 * @param {Attribute} attribute
 */
function validate_attribute_name(attribute) {
	if (
		attribute.name.includes(':') &&
		!attribute.name.startsWith('xmlns:') &&
		!attribute.name.startsWith('xlink:') &&
		!attribute.name.startsWith('xml:')
	) {
		w.attribute_illegal_colon(attribute);
	}
}

/**
 * @param {Context} context
 * @param {Attribute} attribute
 * @param {boolean} is_component
 */
function validate_slot_attribute(context, attribute, is_component = false) {
	const parent = context.path.at(-2);
	let owner = undefined;

	if (parent?.type === 'SnippetBlock') {
		if (!is_text_attribute(attribute)) {
			e.slot_attribute_invalid(attribute);
		}
		return;
	}

	let i = context.path.length;
	while (i--) {
		const ancestor = context.path[i];
		if (
			!owner &&
			(ancestor.type === 'Component' ||
				ancestor.type === 'SvelteComponent' ||
				ancestor.type === 'SvelteSelf' ||
				ancestor.type === 'SvelteElement' ||
				(ancestor.type === 'RegularElement' && is_custom_element_node(ancestor)))
		) {
			owner = ancestor;
		}
	}

	if (owner) {
		if (!is_text_attribute(attribute)) {
			e.slot_attribute_invalid(attribute);
		}

		if (
			owner.type === 'Component' ||
			owner.type === 'SvelteComponent' ||
			owner.type === 'SvelteSelf'
		) {
			if (owner !== parent) {
				e.slot_attribute_invalid_placement(attribute);
			}

			const name = attribute.value[0].data;

			if (context.state.component_slots.has(name)) {
				e.slot_attribute_duplicate(attribute, name, owner.name);
			}

			context.state.component_slots.add(name);

			if (name === 'default') {
				for (const node of owner.fragment.nodes) {
					if (node.type === 'Text' && regex_only_whitespaces.test(node.data)) {
						continue;
					}

					if (node.type === 'RegularElement' || node.type === 'SvelteFragment') {
						if (node.attributes.some((a) => a.type === 'Attribute' && a.name === 'slot')) {
							continue;
						}
					}

					e.slot_default_duplicate(node);
				}
			}
		}
	} else if (!is_component) {
		e.slot_attribute_invalid_placement(attribute);
	}
}

/**
 * @param {Fragment | null | undefined} node
 * @param {Context} context
 */
function validate_block_not_empty(node, context) {
	if (!node) return;
	// Assumption: If the block has zero elements, someone's in the middle of typing it out,
	// so don't warn in that case because it would be distracting.
	if (node.nodes.length === 1 && node.nodes[0].type === 'Text' && !node.nodes[0].raw.trim()) {
		w.block_empty(node.nodes[0]);
	}
}

/**
 * @type {Visitors}
 */
const validation = {
	MemberExpression(node, context) {
		if (node.object.type === 'Identifier' && node.property.type === 'Identifier') {
			const binding = context.state.scope.get(node.object.name);
			if (binding?.kind === 'rest_prop' && node.property.name.startsWith('$$')) {
				e.props_illegal_name(node.property);
			}
		}
	},
	AssignmentExpression(node, context) {
		validate_assignment(node, node.left, context.state);
	},
	BindDirective(node, context) {
		validate_no_const_assignment(node, node.expression, context.state.scope, true);

		const assignee = node.expression;
		const left = object(assignee);

		if (left === null) {
			e.bind_invalid_expression(node);
		}

		const binding = context.state.scope.get(left.name);

		if (
			assignee.type === 'Identifier' &&
			node.name !== 'this' // bind:this also works for regular variables
		) {
			// reassignment
			if (
				!binding ||
				(binding.kind !== 'state' &&
					binding.kind !== 'frozen_state' &&
					binding.kind !== 'prop' &&
					binding.kind !== 'bindable_prop' &&
					binding.kind !== 'each' &&
					binding.kind !== 'store_sub' &&
					!binding.mutated)
			) {
				e.bind_invalid_value(node.expression);
			}

			if (binding.kind === 'derived') {
				e.constant_binding(node.expression, 'derived state');
			}

			if (context.state.analysis.runes && binding.kind === 'each') {
				e.each_item_invalid_assignment(node);
			}

			if (binding.kind === 'snippet') {
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
	},
	ExportDefaultDeclaration(node) {
		e.module_illegal_default_export(node);
	},
	ConstTag(node, context) {
		const parent = context.path.at(-1);
		const grand_parent = context.path.at(-2);
		if (
			parent?.type !== 'Fragment' ||
			(grand_parent?.type !== 'IfBlock' &&
				grand_parent?.type !== 'SvelteFragment' &&
				grand_parent?.type !== 'Component' &&
				grand_parent?.type !== 'SvelteComponent' &&
				grand_parent?.type !== 'EachBlock' &&
				grand_parent?.type !== 'AwaitBlock' &&
				grand_parent?.type !== 'SnippetBlock' &&
				((grand_parent?.type !== 'RegularElement' && grand_parent?.type !== 'SvelteElement') ||
					!grand_parent.attributes.some((a) => a.type === 'Attribute' && a.name === 'slot')))
		) {
			e.const_tag_invalid_placement(node);
		}
	},
	ImportDeclaration(node, context) {
		if (node.source.value === 'svelte' && context.state.analysis.runes) {
			for (const specifier of node.specifiers) {
				if (specifier.type === 'ImportSpecifier') {
					if (
						specifier.imported.name === 'beforeUpdate' ||
						specifier.imported.name === 'afterUpdate'
					) {
						e.runes_mode_invalid_import(specifier, specifier.imported.name);
					}
				}
			}
		}
	},
	LetDirective(node, context) {
		const parent = context.path.at(-1);
		if (
			parent === undefined ||
			(parent.type !== 'Component' &&
				parent.type !== 'RegularElement' &&
				parent.type !== 'SlotElement' &&
				parent.type !== 'SvelteElement' &&
				parent.type !== 'SvelteComponent' &&
				parent.type !== 'SvelteSelf' &&
				parent.type !== 'SvelteFragment')
		) {
			e.let_directive_invalid_placement(node);
		}
	},
	RegularElement(node, context) {
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
					if (
						ancestor.type === 'RegularElement' &&
						ancestor.name === context.state.parent_element
					) {
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
	},
	RenderTag(node, context) {
		const callee = unwrap_optional(node.expression).callee;

		node.metadata.dynamic =
			callee.type !== 'Identifier' || context.state.scope.get(callee.name)?.kind !== 'normal';

		context.state.analysis.uses_render_tags = true;

		const raw_args = unwrap_optional(node.expression).arguments;
		for (const arg of raw_args) {
			if (arg.type === 'SpreadElement') {
				e.render_tag_invalid_spread_argument(arg);
			}
		}

		if (
			callee.type === 'MemberExpression' &&
			callee.property.type === 'Identifier' &&
			['bind', 'apply', 'call'].includes(callee.property.name)
		) {
			e.render_tag_invalid_call_expression(node);
		}
	},
	IfBlock(node, context) {
		validate_block_not_empty(node.consequent, context);
		validate_block_not_empty(node.alternate, context);
	},
	EachBlock(node, context) {
		validate_block_not_empty(node.body, context);
		validate_block_not_empty(node.fallback, context);
	},
	AwaitBlock(node, context) {
		validate_block_not_empty(node.pending, context);
		validate_block_not_empty(node.then, context);
		validate_block_not_empty(node.catch, context);
	},
	KeyBlock(node, context) {
		validate_block_not_empty(node.fragment, context);
	},
	SnippetBlock(node, context) {
		validate_block_not_empty(node.body, context);

		for (const arg of node.parameters) {
			if (arg.type === 'RestElement') {
				e.snippet_invalid_rest_parameter(arg);
			}
		}

		context.next({ ...context.state, parent_element: null });

		const { path } = context;
		const parent = path.at(-2);
		if (!parent) return;

		if (
			parent.type === 'Component' &&
			parent.attributes.some(
				(attribute) =>
					(attribute.type === 'Attribute' || attribute.type === 'BindDirective') &&
					attribute.name === node.expression.name
			)
		) {
			e.snippet_shadowing_prop(node, node.expression.name);
		}

		if (node.expression.name !== 'children') return;

		if (
			parent.type === 'Component' ||
			parent.type === 'SvelteComponent' ||
			parent.type === 'SvelteSelf'
		) {
			if (
				parent.fragment.nodes.some(
					(node) => node.type !== 'SnippetBlock' && (node.type !== 'Text' || node.data.trim())
				)
			) {
				e.snippet_conflict(node);
			}
		}
	},
	StyleDirective(node) {
		if (node.modifiers.length > 1 || (node.modifiers.length && node.modifiers[0] !== 'important')) {
			e.style_directive_invalid_modifier(node);
		}
	},
	SvelteHead(node) {
		const attribute = node.attributes[0];
		if (attribute) {
			e.svelte_head_illegal_attribute(attribute);
		}
	},
	SvelteElement(node, context) {
		validate_element(node, context);
		context.next({
			...context.state,
			parent_element: null
		});
	},
	SvelteFragment(node, context) {
		const parent = context.path.at(-2);
		if (parent?.type !== 'Component' && parent?.type !== 'SvelteComponent') {
			e.svelte_fragment_invalid_placement(node);
		}

		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute') {
				if (attribute.name === 'slot') {
					validate_slot_attribute(context, attribute);
				}
			} else if (attribute.type !== 'LetDirective') {
				e.svelte_fragment_invalid_attribute(attribute);
			}
		}
	},
	SlotElement(node) {
		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute') {
				if (attribute.name === 'name') {
					if (!is_text_attribute(attribute)) {
						e.slot_element_invalid_name(attribute);
					}
					const slot_name = attribute.value[0].data;
					if (slot_name === 'default') {
						e.slot_element_invalid_name_default(attribute);
					}
				}
			} else if (attribute.type !== 'SpreadAttribute' && attribute.type !== 'LetDirective') {
				e.slot_element_invalid_attribute(attribute);
			}
		}
	},
	Component: validate_component,
	SvelteComponent: validate_component,
	SvelteSelf: validate_component,
	Text(node, context) {
		if (!node.parent) return;
		if (context.state.parent_element && regex_not_whitespace.test(node.data)) {
			if (!is_tag_valid_with_parent('#text', context.state.parent_element)) {
				e.node_invalid_placement(node, 'Text node', context.state.parent_element);
			}
		}
	},
	TitleElement(node) {
		const attribute = node.attributes[0];
		if (attribute) {
			e.title_illegal_attribute(attribute);
		}

		const child = node.fragment.nodes.find((n) => n.type !== 'Text' && n.type !== 'ExpressionTag');
		if (child) {
			e.title_invalid_content(child);
		}
	},
	UpdateExpression(node, context) {
		validate_assignment(node, node.argument, context.state);
	},
	ExpressionTag(node, context) {
		if (!node.parent) return;
		if (context.state.parent_element) {
			if (!is_tag_valid_with_parent('#text', context.state.parent_element)) {
				e.node_invalid_placement(node, '`{expression}`', context.state.parent_element);
			}
		}
	}
};

export const validation_legacy = merge(validation, a11y_validators, {
	VariableDeclarator(node, { state }) {
		ensure_no_module_import_conflict(node, state);

		if (node.init?.type !== 'CallExpression') return;

		const callee = node.init.callee;
		if (
			callee.type !== 'Identifier' ||
			(callee.name !== '$state' && callee.name !== '$derived' && callee.name !== '$props')
		) {
			return;
		}

		if (state.scope.get(callee.name)?.kind !== 'store_sub') {
			e.rune_invalid_usage(node.init, callee.name);
		}
	},
	AssignmentExpression(node, { state, path }) {
		const parent = path.at(-1);
		if (parent && parent.type === 'ConstTag') return;
		validate_assignment(node, node.left, state);
	},
	LabeledStatement(node, { path, state }) {
		if (
			node.label.name === '$' &&
			(state.ast_type !== 'instance' || /** @type {SvelteNode} */ (path.at(-1)).type !== 'Program')
		) {
			w.reactive_declaration_invalid_placement(node);
		}
	},
	UpdateExpression(node, { state }) {
		validate_assignment(node, node.argument, state);
	}
});

/**
 *
 * @param {Node} node
 * @param {Scope} scope
 * @param {string} name
 */
function validate_export(node, scope, name) {
	const binding = scope.get(name);
	if (!binding) return;

	if (binding.kind === 'derived') {
		e.derived_invalid_export(node);
	}

	if ((binding.kind === 'state' || binding.kind === 'frozen_state') && binding.reassigned) {
		e.state_invalid_export(node);
	}
}

/**
 * @param {CallExpression} node
 * @param {Scope} scope
 * @param {SvelteNode[]} path
 * @returns
 */
function validate_call_expression(node, scope, path) {
	const rune = get_rune(node, scope);
	if (rune === null) return;

	const parent = /** @type {SvelteNode} */ (get_parent(path, -1));

	if (rune === '$props') {
		if (parent.type === 'VariableDeclarator') return;
		e.props_invalid_placement(node);
	}

	if (rune === '$bindable') {
		if (parent.type === 'AssignmentPattern' && path.at(-3)?.type === 'ObjectPattern') {
			const declarator = path.at(-4);
			if (
				declarator?.type === 'VariableDeclarator' &&
				get_rune(declarator.init, scope) === '$props'
			) {
				return;
			}
		}
		e.bindable_invalid_location(node);
	}

	if (
		rune === '$state' ||
		rune === '$state.frozen' ||
		rune === '$derived' ||
		rune === '$derived.by'
	) {
		if (parent.type === 'VariableDeclarator') return;
		if (parent.type === 'PropertyDefinition' && !parent.static && !parent.computed) return;
		e.state_invalid_placement(node, rune);
	}

	if (rune === '$effect' || rune === '$effect.pre') {
		if (parent.type !== 'ExpressionStatement') {
			e.effect_invalid_placement(node);
		}

		if (node.arguments.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		}
	}

	if (rune === '$effect.tracking') {
		if (node.arguments.length !== 0) {
			e.rune_invalid_arguments(node, rune);
		}
	}

	if (rune === '$effect.root') {
		if (node.arguments.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		}
	}

	if (rune === '$inspect') {
		if (node.arguments.length < 1) {
			e.rune_invalid_arguments_length(node, rune, 'one or more arguments');
		}
	}

	if (rune === '$inspect().with') {
		if (node.arguments.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		}
	}

	if (rune === '$state.snapshot') {
		if (node.arguments.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		}
	}

	if (rune === '$state.is') {
		if (node.arguments.length !== 2) {
			e.rune_invalid_arguments_length(node, rune, 'exactly two arguments');
		}
	}
}

/**
 * @param {VariableDeclarator} node
 * @param {AnalysisState} state
 */
function ensure_no_module_import_conflict(node, state) {
	const ids = extract_identifiers(node.id);
	for (const id of ids) {
		if (
			state.scope === state.analysis.instance.scope &&
			state.analysis.module.scope.get(id.name)?.declaration_kind === 'import'
		) {
			e.declaration_duplicate_module_import(node.id);
		}
	}
}

/**
 * @type {Visitors}
 */
export const validation_runes_js = {
	ImportDeclaration(node) {
		if (typeof node.source.value === 'string' && node.source.value.startsWith('svelte/internal')) {
			e.import_svelte_internal_forbidden(node);
		}
	},
	ExportSpecifier(node, { state }) {
		validate_export(node, state.scope, node.local.name);
	},
	ExportNamedDeclaration(node, { state, next }) {
		if (node.declaration?.type !== 'VariableDeclaration') return;

		// visit children, so bindings are correctly initialised
		next();

		for (const declarator of node.declaration.declarations) {
			for (const id of extract_identifiers(declarator.id)) {
				validate_export(node, state.scope, id.name);
			}
		}
	},
	CallExpression(node, { state, path }) {
		if (get_rune(node, state.scope) === '$host') {
			e.host_invalid_placement(node);
		}
		validate_call_expression(node, state.scope, path);
	},
	VariableDeclarator(node, { state }) {
		const init = node.init;
		const rune = get_rune(init, state.scope);

		if (rune === null) return;

		const args = /** @type {CallExpression} */ (init).arguments;

		if ((rune === '$derived' || rune === '$derived.by') && args.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		} else if (rune === '$state' && args.length > 1) {
			e.rune_invalid_arguments_length(node, rune, 'zero or one arguments');
		} else if (rune === '$props') {
			e.props_invalid_placement(node);
		} else if (rune === '$bindable') {
			e.bindable_invalid_location(node);
		}
	},
	AssignmentExpression(node, { state }) {
		validate_assignment(node, node.left, state);
	},
	UpdateExpression(node, { state }) {
		validate_assignment(node, node.argument, state);
	},
	ClassBody(node, context) {
		/** @type {string[]} */
		const private_derived_state = [];

		for (const definition of node.body) {
			if (
				definition.type === 'PropertyDefinition' &&
				definition.key.type === 'PrivateIdentifier' &&
				definition.value?.type === 'CallExpression'
			) {
				const rune = get_rune(definition.value, context.state.scope);
				if (rune === '$derived' || rune === '$derived.by') {
					private_derived_state.push(definition.key.name);
				}
			}
		}

		context.next({
			...context.state,
			private_derived_state
		});
	},
	ClassDeclaration(node, context) {
		// In modules, we allow top-level module scope only, in components, we allow the component scope,
		// which is function_depth of 1. With the exception of `new class` which is also not allowed at
		// component scope level either.
		const allowed_depth = context.state.ast_type === 'module' ? 0 : 1;

		if (context.state.scope.function_depth > allowed_depth) {
			w.perf_avoid_nested_class(node);
		}
	},
	NewExpression(node, context) {
		if (node.callee.type === 'ClassExpression' && context.state.scope.function_depth > 0) {
			w.perf_avoid_inline_class(node);
		}
	},
	Identifier(node, { path, state }) {
		let i = path.length;
		let parent = /** @type {Expression} */ (path[--i]);

		if (
			Runes.includes(/** @type {Runes[number]} */ (node.name)) &&
			is_reference(node, parent) &&
			state.scope.get(node.name) === null &&
			state.scope.get(node.name.slice(1)) === null
		) {
			/** @type {Expression} */
			let current = node;
			let name = node.name;

			while (parent.type === 'MemberExpression') {
				if (parent.computed) e.rune_invalid_computed_property(parent);
				name += `.${/** @type {Identifier} */ (parent.property).name}`;

				current = parent;
				parent = /** @type {Expression} */ (path[--i]);

				if (!Runes.includes(/** @type {Runes[number]} */ (name))) {
					if (name === '$effect.active') {
						e.rune_renamed(parent, '$effect.active', '$effect.tracking');
					}

					e.rune_invalid_name(parent, name);
				}
			}

			if (parent.type !== 'CallExpression') {
				e.rune_missing_parentheses(current);
			}
		}
	}
};

/**
 * @param {NodeLike} node
 * @param {Pattern | Expression} argument
 * @param {Scope} scope
 * @param {boolean} is_binding
 */
function validate_no_const_assignment(node, argument, scope, is_binding) {
	if (argument.type === 'ArrayPattern') {
		for (const element of argument.elements) {
			if (element) {
				validate_no_const_assignment(node, element, scope, is_binding);
			}
		}
	} else if (argument.type === 'ObjectPattern') {
		for (const element of argument.properties) {
			if (element.type === 'Property') {
				validate_no_const_assignment(node, element.value, scope, is_binding);
			}
		}
	} else if (argument.type === 'Identifier') {
		const binding = scope.get(argument.name);
		if (binding?.declaration_kind === 'const' && binding.kind !== 'each') {
			// e.invalid_const_assignment(
			// 	node,
			// 	is_binding,
			// 	// This takes advantage of the fact that we don't assign initial for let directives and then/catch variables.
			// 	// If we start doing that, we need another property on the binding to differentiate, or give up on the more precise error message.
			// 	binding.kind !== 'state' &&
			// 		binding.kind !== 'frozen_state' &&
			// 		(binding.kind !== 'normal' || !binding.initial)
			// );

			// TODO have a more specific error message for assignments to things like `{:then foo}`
			const thing = 'constant';

			if (is_binding) {
				e.constant_binding(node, thing);
			} else {
				e.constant_assignment(node, thing);
			}
		}
	}
}

/**
 * Validates that the opening of a control flow block is `{` immediately followed by the expected character.
 * In legacy mode whitespace is allowed inbetween. TODO remove once legacy mode is gone and move this into parser instead.
 * @param {{start: number; end: number}} node
 * @param {AnalysisState} state
 * @param {string} expected
 */
function validate_opening_tag(node, state, expected) {
	if (state.analysis.source[node.start + 1] !== expected) {
		// avoid a sea of red and only mark the first few characters
		e.block_unexpected_character({ start: node.start, end: node.start + 5 }, expected);
	}
}

/**
 * @param {AssignmentExpression | UpdateExpression} node
 * @param {Pattern | Expression} argument
 * @param {AnalysisState} state
 */
function validate_assignment(node, argument, state) {
	validate_no_const_assignment(node, argument, state.scope, false);

	if (argument.type === 'Identifier') {
		const binding = state.scope.get(argument.name);

		if (state.analysis.runes) {
			if (binding?.kind === 'derived') {
				e.constant_assignment(node, 'derived state');
			}

			if (binding?.kind === 'each') {
				e.each_item_invalid_assignment(node);
			}
		}

		if (binding?.kind === 'snippet') {
			e.snippet_parameter_assignment(node);
		}
	}

	let object = /** @type {Expression | Super} */ (argument);

	/** @type {Expression | PrivateIdentifier | null} */
	let property = null;

	while (object.type === 'MemberExpression') {
		property = object.property;
		object = object.object;
	}

	if (object.type === 'ThisExpression' && property?.type === 'PrivateIdentifier') {
		if (state.private_derived_state.includes(property.name)) {
			e.constant_assignment(node, 'derived state');
		}
	}
}

export const validation_runes = merge(validation, a11y_validators, {
	ImportDeclaration(node) {
		if (typeof node.source.value === 'string' && node.source.value.startsWith('svelte/internal')) {
			e.import_svelte_internal_forbidden(node);
		}
	},
	LabeledStatement(node, { path }) {
		if (node.label.name !== '$' || path.at(-1)?.type !== 'Program') return;
		e.legacy_reactive_statement_invalid(node);
	},
	ExportNamedDeclaration(node, { state, next }) {
		if (state.ast_type === 'module') {
			if (node.declaration?.type !== 'VariableDeclaration') return;

			// visit children, so bindings are correctly initialised
			next();

			for (const declarator of node.declaration.declarations) {
				for (const id of extract_identifiers(declarator.id)) {
					validate_export(node, state.scope, id.name);
				}
			}
		} else {
			if (node.declaration?.type !== 'VariableDeclaration') return;
			if (node.declaration.kind !== 'let') return;
			if (state.analysis.instance.scope !== state.scope) return;
			e.legacy_export_invalid(node);
		}
	},
	ExportSpecifier(node, { state }) {
		if (state.ast_type === 'module') {
			validate_export(node, state.scope, node.local.name);
		}
	},
	CallExpression(node, { state, path }) {
		const rune = get_rune(node, state.scope);
		if (rune === '$bindable' && node.arguments.length > 1) {
			e.rune_invalid_arguments_length(node, '$bindable', 'zero or one arguments');
		} else if (rune === '$host') {
			if (node.arguments.length > 0) {
				e.rune_invalid_arguments(node, '$host');
			} else if (state.ast_type === 'module' || !state.analysis.custom_element) {
				e.host_invalid_placement(node);
			}
		}

		validate_call_expression(node, state.scope, path);
	},
	EachBlock(node, { next, state }) {
		validate_opening_tag(node, state, '#');

		const context = node.context;
		if (
			context.type === 'Identifier' &&
			(context.name === '$state' || context.name === '$derived')
		) {
			e.state_invalid_placement(node, context.name);
		}
		next({ ...state });
	},
	IfBlock(node, { state, path }) {
		const parent = path.at(-1);
		const expected =
			path.at(-2)?.type === 'IfBlock' && parent?.type === 'Fragment' && parent.nodes.length === 1
				? ':'
				: '#';
		validate_opening_tag(node, state, expected);
	},
	AwaitBlock(node, { state }) {
		validate_opening_tag(node, state, '#');

		if (node.value) {
			const start = /** @type {number} */ (node.value.start);
			const match = state.analysis.source.substring(start - 10, start).match(/{(\s*):then\s+$/);
			if (match && match[1] !== '') {
				e.block_unexpected_character({ start: start - 10, end: start }, ':');
			}
		}

		if (node.error) {
			const start = /** @type {number} */ (node.error.start);
			const match = state.analysis.source.substring(start - 10, start).match(/{(\s*):catch\s+$/);
			if (match && match[1] !== '') {
				e.block_unexpected_character({ start: start - 10, end: start }, ':');
			}
		}
	},
	KeyBlock(node, { state }) {
		validate_opening_tag(node, state, '#');
	},
	SnippetBlock(node, { state }) {
		validate_opening_tag(node, state, '#');
	},
	ConstTag(node, { state }) {
		validate_opening_tag(node, state, '@');
	},
	HtmlTag(node, { state }) {
		validate_opening_tag(node, state, '@');
	},
	DebugTag(node, { state }) {
		validate_opening_tag(node, state, '@');
	},
	RenderTag(node, { state }) {
		validate_opening_tag(node, state, '@');
	},
	VariableDeclarator(node, { state }) {
		ensure_no_module_import_conflict(node, state);

		const init = node.init;
		const rune = get_rune(init, state.scope);

		if (rune === null) return;

		const args = /** @type {CallExpression} */ (init).arguments;

		// TODO some of this is duplicated with above, seems off
		if ((rune === '$derived' || rune === '$derived.by') && args.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		} else if (rune === '$state' && args.length > 1) {
			e.rune_invalid_arguments_length(node, rune, 'zero or one arguments');
		} else if (rune === '$props') {
			if (state.has_props_rune) {
				e.props_duplicate(node);
			}

			state.has_props_rune = true;

			if (args.length > 0) {
				e.rune_invalid_arguments(node, rune);
			}

			if (node.id.type !== 'ObjectPattern' && node.id.type !== 'Identifier') {
				e.props_invalid_identifier(node);
			}

			if (state.scope !== state.analysis.instance.scope) {
				e.props_invalid_placement(node);
			}

			if (node.id.type === 'ObjectPattern') {
				for (const property of node.id.properties) {
					if (property.type === 'Property') {
						if (property.computed) {
							e.props_invalid_pattern(property);
						}

						if (property.key.type === 'Identifier' && property.key.name.startsWith('$$')) {
							e.props_illegal_name(property);
						}

						const value =
							property.value.type === 'AssignmentPattern' ? property.value.left : property.value;

						if (value.type !== 'Identifier') {
							e.props_invalid_pattern(property);
						}
					}
				}
			}
		}

		if (rune === '$derived') {
			const arg = args[0];
			if (
				arg.type === 'CallExpression' &&
				(arg.callee.type === 'ArrowFunctionExpression' || arg.callee.type === 'FunctionExpression')
			) {
				w.derived_iife(node);
			}
		}
	},
	SlotElement(node, { state }) {
		if (!state.analysis.custom_element) {
			w.slot_element_deprecated(node);
		}
	},
	OnDirective(node, { path }) {
		const parent_type = path.at(-1)?.type;
		// Don't warn on component events; these might not be under the author's control so the warning would be unactionable
		if (parent_type === 'RegularElement' || parent_type === 'SvelteElement') {
			w.event_directive_deprecated(node, node.name);
		}
	},
	// TODO this is a code smell. need to refactor this stuff
	ClassBody: validation_runes_js.ClassBody,
	ClassDeclaration: validation_runes_js.ClassDeclaration,
	Identifier: validation_runes_js.Identifier,
	NewExpression: validation_runes_js.NewExpression
});
