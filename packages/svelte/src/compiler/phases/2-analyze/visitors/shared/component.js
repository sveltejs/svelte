/** @import { AST } from '#compiler' */
/** @import { AnalysisState, Context } from '../../types' */
import * as e from '../../../../errors.js';
import { get_attribute_expression, is_expression_attribute } from '../../../../utils/ast.js';
import { determine_slot } from '../../../../utils/slot.js';
import {
	validate_attribute,
	validate_attribute_name,
	validate_slot_attribute
} from './attribute.js';
import { mark_subtree_dynamic } from './fragment.js';
import { is_resolved_snippet } from './snippets.js';

/**
 * @param {AST.Component | AST.SvelteComponent | AST.SvelteSelf} node
 * @param {Context} context
 */
export function visit_component(node, context) {
	node.metadata.path = [...context.path];

	// link this node to all the snippets that it could render, so that we can prune CSS correctly
	node.metadata.snippets = new Set();

	// 'resolved' means we know which snippets this component might render. if it is `false`,
	// then `node.metadata.snippets` is populated with every locally defined snippet
	// once analysis is complete
	let resolved = true;

	for (const attribute of node.attributes) {
		if (attribute.type === 'SpreadAttribute' || attribute.type === 'BindDirective') {
			resolved = false;
			continue;
		}

		if (attribute.type !== 'Attribute' || !is_expression_attribute(attribute)) {
			continue;
		}

		const expression = get_attribute_expression(attribute);

		// given an attribute like `foo={bar}`, if `bar` resolves to an import or a prop
		// then we know it doesn't reference a locally defined snippet. if it resolves
		// to a `{#snippet bar()}` then we know _which_ snippet it resolves to. in all
		// other cases, we can't know (without much more complex static analysis) which
		// snippets the component might render, so we treat the component as unresolved
		if (expression.type === 'Identifier') {
			const binding = context.state.scope.get(expression.name);

			resolved &&= is_resolved_snippet(binding);

			if (binding?.initial?.type === 'SnippetBlock') {
				node.metadata.snippets.add(binding.initial);
			}
		} else if (expression.type !== 'Literal') {
			resolved = false;
		}
	}

	if (resolved) {
		for (const child of node.fragment.nodes) {
			if (child.type === 'SnippetBlock') {
				node.metadata.snippets.add(child);
			}
		}
	}

	context.state.analysis.snippet_renderers.set(node, resolved);

	mark_subtree_dynamic(context.path);

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

		if (attribute.type === 'BindDirective' && attribute.name !== 'this') {
			context.state.analysis.uses_component_bindings = true;
		}
	}

	// If the component has a slot attribute — `<Foo slot="whatever" .../>` —
	// then `let:` directives apply to other attributes, instead of just the
	// top-level contents of the component. Yes, this is very weird.
	const default_state = determine_slot(node)
		? context.state
		: { ...context.state, scope: node.metadata.scopes.default };

	for (const attribute of node.attributes) {
		context.visit(attribute, attribute.type === 'LetDirective' ? default_state : context.state);
	}

	/** @type {AST.Comment[]} */
	let comments = [];

	/** @type {Record<string, AST.Fragment['nodes']>} */
	const nodes = { default: [] };

	for (const child of node.fragment.nodes) {
		if (child.type === 'Comment') {
			comments.push(child);
			continue;
		}

		const slot_name = determine_slot(child) ?? 'default';
		(nodes[slot_name] ??= []).push(...comments, child);

		if (slot_name !== 'default') comments = [];
	}

	const component_slots = new Set();

	for (const slot_name in nodes) {
		/** @type {AnalysisState} */
		const state = {
			...context.state,
			scope: node.metadata.scopes[slot_name],
			parent_element: null,
			component_slots
		};

		context.visit({ ...node.fragment, nodes: nodes[slot_name] }, state);
	}
}
