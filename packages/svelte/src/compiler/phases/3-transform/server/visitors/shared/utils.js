/** @import {  AssignmentExpression, AssignmentOperator, BinaryOperator, Expression, Identifier, Node, Pattern, Statement, TemplateElement } from 'estree' */
/** @import { Attribute, Comment, ExpressionTag, SvelteNode, Text } from '#compiler' */
/** @import { ComponentContext, ServerTransformState } from '../../types.js' */
import { extract_paths } from '../../../../../utils/ast.js';
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

/**
 *
 * @param {Attribute['value']} value
 * @param {ComponentContext} context
 * @param {boolean} trim_whitespace
 * @param {boolean} is_component
 * @returns {Expression}
 */
export function serialize_attribute_value(
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
export function serialize_get_binding(node, state) {
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
			serialize_get_binding(store_id, state)
		);
	}

	return node;
}

/**
 * @param {AssignmentExpression} node
 * @param {import('zimmerframe').Context<SvelteNode, ServerTransformState>} context
 * @param {() => any} fallback
 * @returns {Expression}
 */
export function serialize_set_binding(node, context, fallback) {
	const { state, visit } = context;

	if (
		node.left.type === 'ArrayPattern' ||
		node.left.type === 'ObjectPattern' ||
		node.left.type === 'RestElement'
	) {
		// Turn assignment into an IIFE, so that `$.set` calls etc don't produce invalid code
		const tmp_id = context.state.scope.generate('tmp');

		/** @type {AssignmentExpression[]} */
		const original_assignments = [];

		/** @type {Expression[]} */
		const assignments = [];

		const paths = extract_paths(node.left);

		for (const path of paths) {
			const value = path.expression?.(b.id(tmp_id));
			const assignment = b.assignment('=', path.node, value);
			original_assignments.push(assignment);
			assignments.push(serialize_set_binding(assignment, context, () => assignment));
		}

		if (assignments.every((assignment, i) => assignment === original_assignments[i])) {
			// No change to output -> nothing to transform -> we can keep the original assignment
			return fallback();
		}

		return b.call(
			b.thunk(
				b.block([
					b.const(tmp_id, /** @type {Expression} */ (visit(node.right))),
					b.stmt(b.sequence(assignments)),
					b.return(b.id(tmp_id))
				])
			)
		);
	}

	if (node.left.type !== 'Identifier' && node.left.type !== 'MemberExpression') {
		throw new Error(`Unexpected assignment type ${node.left.type}`);
	}

	let left = node.left;

	while (left.type === 'MemberExpression') {
		// @ts-expect-error
		left = left.object;
	}

	if (left.type !== 'Identifier') {
		return fallback();
	}

	const is_store = is_store_name(left.name);
	const left_name = is_store ? left.name.slice(1) : left.name;
	const binding = state.scope.get(left_name);

	if (!binding) return fallback();

	if (binding.mutation !== null) {
		return binding.mutation(node, context);
	}

	if (
		binding.kind !== 'state' &&
		binding.kind !== 'frozen_state' &&
		binding.kind !== 'prop' &&
		binding.kind !== 'bindable_prop' &&
		binding.kind !== 'each' &&
		binding.kind !== 'legacy_reactive' &&
		!is_store
	) {
		// TODO error if it's a computed (or rest prop)? or does that already happen elsewhere?
		return fallback();
	}

	const value = get_assignment_value(node, context);
	if (left === node.left) {
		if (is_store) {
			return b.call('$.store_set', b.id(left_name), /** @type {Expression} */ (visit(node.right)));
		}
		return fallback();
	} else if (is_store) {
		return b.call(
			'$.mutate_store',
			b.assignment('??=', b.id('$$store_subs'), b.object([])),
			b.literal(left.name),
			b.id(left_name),
			b.assignment(node.operator, /** @type {Pattern} */ (visit(node.left)), value)
		);
	}
	return fallback();
}

/**
 * @param {AssignmentExpression} node
 * @param {Pick<import('zimmerframe').Context<SvelteNode, ServerTransformState>, 'visit' | 'state'>} context
 */
function get_assignment_value(node, { state, visit }) {
	if (node.left.type === 'Identifier') {
		const operator = node.operator;
		return operator === '='
			? /** @type {Expression} */ (visit(node.right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {BinaryOperator} */ (operator.slice(0, -1)),
					serialize_get_binding(node.left, state),
					/** @type {Expression} */ (visit(node.right))
				);
	}

	return /** @type {Expression} */ (visit(node.right));
}

/**
 * @param {string} name
 */
function is_store_name(name) {
	return name[0] === '$' && /[A-Za-z_]/.test(name[1]);
}
