/** @import { Expression } from 'estree' */
/** @import { ExpressionTag, SvelteNode, Text } from '#compiler' */
/** @import { ComponentClientTransformState, ComponentContext } from '../../types' */
import * as b from '../../../../../utils/builders.js';
import { build_template_literal, build_update } from './utils.js';

/**
 * Processes an array of template nodes, joining sibling text/expression nodes
 * (e.g. `{a} b {c}`) into a single update function. Along the way it creates
 * corresponding template node references these updates are applied to.
 * @param {SvelteNode[]} nodes
 * @param {(is_text: boolean) => Expression} expression
 * @param {boolean} is_element
 * @param {ComponentContext} context
 */
export function process_children(nodes, expression, is_element, { visit, state }) {
	const within_bound_contenteditable = state.metadata.bound_contenteditable;

	/** @typedef {Array<Text | ExpressionTag>} Sequence */

	/** @type {Sequence} */
	let sequence = [];

	/**
	 * @param {Sequence} sequence
	 */
	function flush_sequence(sequence) {
		if (sequence.length === 1) {
			const node = sequence[0];

			if (node.type === 'Text') {
				let prev = expression;
				expression = () => b.call('$.sibling', prev(true));
				state.template.push(node.raw);
				return;
			}
		}

		const id = get_node_id(expression(true), state, 'text');

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

		expression = (is_text) => b.call('$.sibling', id, is_text && b.true);
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
			} else {
				if (node.type === 'EachBlock' && nodes.length === 1 && is_element) {
					node.metadata.is_controlled = true;
					visit(node, state);
				} else {
					const id = get_node_id(
						expression(false),
						state,
						node.type === 'RegularElement' ? node.name : 'node'
					);

					expression = (is_text) => b.call('$.sibling', id, is_text && b.true);

					visit(node, {
						...state,
						node: id
					});
				}
			}
		}
	}

	if (sequence.length > 0) {
		// if the final item in a fragment is static text,
		// we need to force `hydrate_node` to advance
		if (sequence.length === 1 && sequence[0].type === 'Text' && nodes.length > 1) {
			state.init.push(b.stmt(b.call('$.next')));
		}

		flush_sequence(sequence);
	}
}

/**
 * @param {Expression} expression
 * @param {ComponentClientTransformState} state
 * @param {string} name
 */
function get_node_id(expression, state, name) {
	let id = expression;

	if (id.type !== 'Identifier') {
		id = b.id(state.scope.generate(name));

		state.init.push(b.var(id, expression));
	}
	return id;
}
