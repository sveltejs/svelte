/** @import { Expression } from 'estree' */
/** @import { ExpressionTag, SvelteNode, Text } from '#compiler' */
/** @import { ComponentClientTransformState, ComponentContext } from '../../types' */
import { is_event_attribute, is_text_attribute } from '../../../../../utils/ast.js';
import * as b from '../../../../../utils/builders.js';
import { build_template_literal, build_update } from './utils.js';

/**
 * Processes an array of template nodes, joining sibling text/expression nodes
 * (e.g. `{a} b {c}`) into a single update function. Along the way it creates
 * corresponding template node references these updates are applied to.
 * @param {SvelteNode[]} nodes
 * @param {(is_text: boolean) => Expression} initial
 * @param {boolean} is_element
 * @param {ComponentContext} context
 */
export function process_children(nodes, initial, is_element, { visit, state }) {
	const within_bound_contenteditable = state.metadata.bound_contenteditable;

	/** @typedef {Array<Text | ExpressionTag>} Sequence */

	/** @type {Sequence} */
	let sequence = [];

	let skipped = 0;

	/** @param {boolean} check */
	let expression = (check) => {
		if (skipped === 0) return initial(check);
		return b.call(
			'$.sibling',
			initial(false),
			(check || skipped !== 1) && b.literal(skipped),
			check && b.true
		);
	};

	/**
	 * @param {boolean} check
	 * @param {string} name
	 */
	function flush_node(check, name) {
		let init = expression(check);
		let id = init;

		if (id.type !== 'Identifier') {
			id = b.id(state.scope.generate(name));
			state.init.push(b.var(id, init));
		}

		expression = (check) => {
			return b.call(
				'$.sibling',
				id,
				(check || skipped !== 1) && b.literal(skipped),
				check && b.true
			);
		};

		skipped = 1;

		return id;
	}

	/**
	 * @param {Sequence} sequence
	 */
	function flush_sequence(sequence) {
		if (sequence.length === 1) {
			const node = sequence[0];

			if (node.type === 'Text') {
				skipped += 1;
				state.template.push(node.raw);
				return;
			}
		}

		// if this is a standalone `{expression}`, make sure we handle the case where
		// no text node was created because the expression was empty during SSR
		const needs_hydration_check = sequence.length === 1;
		const id = flush_node(needs_hydration_check, 'text');

		state.template.push(' ');

		const { has_state, has_call, value } = build_template_literal(sequence, visit, state);

		const update = b.stmt(b.call('$.set_text', id, value));

		if (has_call && !within_bound_contenteditable) {
			state.init.push(build_update(update));
		} else if (has_state && !within_bound_contenteditable) {
			state.update.push(update);
		} else {
			state.init.push(b.stmt(b.assignment('=', b.member(id, 'nodeValue'), value)));
		}
	}

	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];

		if (node.type === 'Text' || node.type === 'ExpressionTag') {
			sequence.push(node);
		} else {
			if (sequence.length > 0) {
				flush_sequence(sequence);
				sequence = [];
			}

			if (
				node.type === 'SvelteHead' ||
				node.type === 'TitleElement' ||
				node.type === 'SnippetBlock'
			) {
				// These nodes do not contribute to the sibling/child tree
				// TODO what about e.g. ConstTag and all the other things that
				// get hoisted inside clean_nodes?
				visit(node, state);
			} else if (is_static_element(node)) {
				visit(node, state);
				skipped += 1;
			} else {
				if (node.type === 'EachBlock' && nodes.length === 1 && is_element) {
					node.metadata.is_controlled = true;
					visit(node, state);
				} else {
					const id = flush_node(false, node.type === 'RegularElement' ? node.name : 'node');

					visit(node, { ...state, node: id });
				}
			}
		}
	}

	if (sequence.length > 0) {
		// // if the final item in a fragment is static text,
		// // we need to force `hydrate_node` to advance
		// if (sequence.length === 1 && sequence[0].type === 'Text' && nodes.length > 1) {
		// 	state.init.push(b.stmt(b.call('$.next')));
		// }

		flush_sequence(sequence);
	}

	skipped -= 1;

	if (skipped > 0) {
		state.init.push(b.stmt(expression(false)));
	}
}

/**
 *
 * @param {SvelteNode} node
 */
function is_static_element(node) {
	if (node.type !== 'RegularElement') return false;
	if (node.fragment.metadata.dynamic) return false;

	for (const attribute of node.attributes) {
		if (attribute.type !== 'Attribute') {
			return false;
		}

		if (is_event_attribute(attribute)) {
			return false;
		}

		if (attribute.value !== true && !is_text_attribute(attribute)) {
			return false;
		}

		if (node.name === 'option' && attribute.name === 'value') {
			return false;
		}

		if (node.name.includes('-')) {
			return false; // TODO this feels unnecessary, but tests break
		}
	}

	return true;
}
