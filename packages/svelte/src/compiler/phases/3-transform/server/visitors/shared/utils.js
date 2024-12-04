/** @import { AssignmentOperator, Expression, Identifier, Node, Statement, TemplateElement } from 'estree' */
/** @import { AST, SvelteNode } from '#compiler' */
/** @import { ComponentContext, ServerTransformState } from '../../types.js' */

import { escape_html } from '../../../../../../escaping.js';
import {
	BLOCK_CLOSE,
	BLOCK_OPEN,
	EMPTY_COMMENT
} from '../../../../../../internal/server/hydration.js';
import * as b from '../../../../../utils/builders.js';
import { sanitize_template_string } from '../../../../../utils/sanitize_template_string.js';
import { regex_whitespaces_strict } from '../../../../patterns.js';

/** Opens an if/each block, so that we can remove nodes in the case of a mismatch */
export const block_open = b.literal(BLOCK_OPEN);

/** Closes an if/each block, so that we can remove nodes in the case of a mismatch. Also serves as an anchor for these blocks */
export const block_close = b.literal(BLOCK_CLOSE);

/** Empty comment to keep text nodes separate, or provide an anchor node for blocks */
export const empty_comment = b.literal(EMPTY_COMMENT);

/**
 * Processes an array of template nodes, joining sibling text/expression nodes and
 * recursing into child nodes.
 * @param {Array<SvelteNode>} nodes
 * @param {ComponentContext} context
 */
export function process_children(nodes, { visit, state }) {
	/** @type {Array<AST.Text | AST.Comment | AST.ExpressionTag>} */
	let sequence = [];

	function flush() {
		let quasi = b.quasi('', false);
		const quasis = [quasi];

		/** @type {Expression[]} */
		const expressions = [];

		for (let i = 0; i < sequence.length; i++) {
			const node = sequence[i];

			if (node.type === 'Text' || node.type === 'Comment') {
				quasi.value.cooked +=
					node.type === 'Comment' ? `<!--${node.data}-->` : escape_html(node.data);
			} else if (node.type === 'ExpressionTag' && node.expression.type === 'Literal') {
				if (node.expression.value != null) {
					quasi.value.cooked += escape_html(node.expression.value + '');
				}
			} else {
				expressions.push(b.call('$.escape', /** @type {Expression} */ (visit(node.expression))));

				quasi = b.quasi('', i + 1 === sequence.length);
				quasis.push(quasi);
			}
		}

		for (const quasi of quasis) {
			quasi.value.raw = sanitize_template_string(/** @type {string} */ (quasi.value.cooked));
		}

		state.template.push(b.template(quasis, expressions));
	}

	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];

		if (node.type === 'Text' || node.type === 'Comment' || node.type === 'ExpressionTag') {
			sequence.push(node);
		} else {
			if (sequence.length > 0) {
				flush();
				sequence = [];
			}

			visit(node, { ...state });
		}
	}

	if (sequence.length > 0) {
		flush();
	}
}

/**
 * @param {Node} node
 * @returns {node is Statement}
 */
function is_statement(node) {
	return node.type.endsWith('Statement') || node.type.endsWith('Declaration');
}

/**
 * @param {Array<Statement | Expression>} template
 * @param {Identifier} out
 * @param {AssignmentOperator} operator
 * @returns {Statement[]}
 */
export function build_template(template, out = b.id('$$payload.out'), operator = '+=') {
	/** @type {string[]} */
	let strings = [];

	/** @type {Expression[]} */
	let expressions = [];

	/** @type {Statement[]} */
	const statements = [];

	const flush = () => {
		statements.push(
			b.stmt(
				b.assignment(
					operator,
					out,
					b.template(
						strings.map((cooked, i) => b.quasi(cooked, i === strings.length - 1)),
						expressions
					)
				)
			)
		);
		strings = [];
		expressions = [];
	};

	for (let i = 0; i < template.length; i++) {
		const node = template[i];

		if (is_statement(node)) {
			if (strings.length !== 0) {
				flush();
			}

			statements.push(node);
		} else {
			if (strings.length === 0) {
				strings.push('');
			}

			if (node.type === 'Literal') {
				strings[strings.length - 1] += node.value;
			} else if (node.type === 'TemplateLiteral') {
				strings[strings.length - 1] += node.quasis[0].value.cooked;
				strings.push(...node.quasis.slice(1).map((q) => /** @type {string} */ (q.value.cooked)));
				expressions.push(...node.expressions);
			} else {
				expressions.push(node);
				strings.push('');
			}
		}
	}

	if (strings.length !== 0) {
		flush();
	}

	return statements;
}

/**
 *
 * @param {AST.Attribute['value']} value
 * @param {ComponentContext} context
 * @param {boolean} trim_whitespace
 * @param {boolean} is_component
 * @returns {Expression}
 */
export function build_attribute_value(
	value,
	context,
	trim_whitespace = false,
	is_component = false
) {
	if (value === true) {
		return b.true;
	}

	if (!Array.isArray(value) || value.length === 1) {
		const chunk = Array.isArray(value) ? value[0] : value;

		if (chunk.type === 'Text') {
			const data = trim_whitespace
				? chunk.data.replace(regex_whitespaces_strict, ' ').trim()
				: chunk.data;

			return b.literal(is_component ? data : escape_html(data, true));
		}

		return /** @type {Expression} */ (context.visit(chunk.expression));
	}

	let quasi = b.quasi('', false);
	const quasis = [quasi];

	/** @type {Expression[]} */
	const expressions = [];

	for (let i = 0; i < value.length; i++) {
		const node = value[i];

		if (node.type === 'Text') {
			quasi.value.raw += trim_whitespace
				? node.data.replace(regex_whitespaces_strict, ' ')
				: node.data;
		} else {
			expressions.push(
				b.call('$.stringify', /** @type {Expression} */ (context.visit(node.expression)))
			);

			quasi = b.quasi('', i + 1 === value.length);
			quasis.push(quasi);
		}
	}

	return b.template(quasis, expressions);
}

/**
 * @param {Identifier} node
 * @param {ServerTransformState} state
 * @returns {Expression}
 */
export function build_getter(node, state) {
	const binding = state.scope.get(node.name);

	if (binding === null || node === binding.node) {
		// No associated binding or the declaration itself which shouldn't be transformed
		return node;
	}

	if (binding.kind === 'store_sub') {
		const store_id = b.id(node.name.slice(1));
		return b.call(
			'$.store_get',
			b.assignment('??=', b.id('$$store_subs'), b.object([])),
			b.literal(node.name),
			build_getter(store_id, state)
		);
	}

	return node;
}
