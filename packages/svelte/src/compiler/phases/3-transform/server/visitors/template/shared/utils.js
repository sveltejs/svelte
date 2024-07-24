/** @import { AssignmentOperator, Expression, Identifier, Node, Statement, TemplateElement } from 'estree' */
/** @import { Comment, ExpressionTag, SvelteNode, Text } from '#compiler' */
/** @import { ComponentContext } from '../../../types.js' */
import { escape_html } from '../../../../../../../escaping.js';
import {
	BLOCK_CLOSE,
	BLOCK_OPEN,
	EMPTY_COMMENT
} from '../../../../../../../internal/server/hydration.js';
import * as b from '../../../../../../utils/builders.js';
import { sanitize_template_string } from '../../../../../../utils/sanitize_template_string.js';

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
	/** @type {Array<Text | Comment | ExpressionTag>} */
	let sequence = [];

	function flush() {
		let quasi = b.quasi('', false);
		const quasis = [quasi];

		/** @type {Expression[]} */
		const expressions = [];

		for (let i = 0; i < sequence.length; i++) {
			const node = sequence[i];

			if (node.type === 'Text' || node.type === 'Comment') {
				quasi.value.raw += sanitize_template_string(
					node.type === 'Comment' ? `<!--${node.data}-->` : escape_html(node.data)
				);
			} else if (node.type === 'ExpressionTag' && node.expression.type === 'Literal') {
				if (node.expression.value != null) {
					quasi.value.raw += sanitize_template_string(escape_html(node.expression.value + ''));
				}
			} else {
				expressions.push(b.call('$.escape', /** @type {Expression} */ (visit(node.expression))));

				quasi = b.quasi('', i + 1 === sequence.length);
				quasis.push(quasi);
			}
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
export function serialize_template(template, out = b.id('$$payload.out'), operator = '+=') {
	/** @type {TemplateElement[]} */
	let quasis = [];

	/** @type {Expression[]} */
	let expressions = [];

	/** @type {Statement[]} */
	const statements = [];

	const flush = () => {
		statements.push(b.stmt(b.assignment(operator, out, b.template(quasis, expressions))));
		quasis = [];
		expressions = [];
	};

	for (let i = 0; i < template.length; i++) {
		const node = template[i];

		if (is_statement(node)) {
			if (quasis.length !== 0) {
				flush();
			}

			statements.push(node);
		} else {
			let last = quasis.at(-1);
			if (!last) quasis.push((last = b.quasi('', false)));

			if (node.type === 'Literal') {
				last.value.raw +=
					typeof node.value === 'string' ? sanitize_template_string(node.value) : node.value;
			} else if (node.type === 'TemplateLiteral') {
				last.value.raw += node.quasis[0].value.raw;
				quasis.push(...node.quasis.slice(1));
				expressions.push(...node.expressions);
			} else {
				expressions.push(node);
				quasis.push(b.quasi('', i + 1 === template.length || is_statement(template[i + 1])));
			}
		}
	}

	if (quasis.length !== 0) {
		flush();
	}

	return statements;
}
