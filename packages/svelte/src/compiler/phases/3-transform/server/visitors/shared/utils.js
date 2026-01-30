/** @import { Expression, Identifier, Node, Statement, BlockStatement, ArrayExpression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext, ServerTransformState } from '../../types.js' */

import { escape_html } from '../../../../../../escaping.js';
import {
	BLOCK_CLOSE,
	BLOCK_OPEN,
	BLOCK_OPEN_ELSE,
	EMPTY_COMMENT
} from '../../../../../../internal/server/hydration.js';
import * as b from '#compiler/builders';
import { sanitize_template_string } from '../../../../../utils/sanitize_template_string.js';
import { regex_whitespaces_strict } from '../../../../patterns.js';
import { has_await_expression } from '../../../../../utils/ast.js';
import { ExpressionMetadata } from '../../../../nodes.js';

/** Opens an if/each block, so that we can remove nodes in the case of a mismatch */
export const block_open = b.literal(BLOCK_OPEN);

/** Opens an if/each block, so that we can remove nodes in the case of a mismatch */
export const block_open_else = b.literal(BLOCK_OPEN_ELSE);

/** Closes an if/each block, so that we can remove nodes in the case of a mismatch. Also serves as an anchor for these blocks */
export const block_close = b.literal(BLOCK_CLOSE);

/** Empty comment to keep text nodes separate, or provide an anchor node for blocks */
export const empty_comment = b.literal(EMPTY_COMMENT);

/**
 * Processes an array of template nodes, joining sibling text/expression nodes and
 * recursing into child nodes.
 * @param {Array<AST.SvelteNode>} nodes
 * @param {ComponentContext} context
 */
export function process_children(nodes, { visit, state }) {
	/** @type {Array<AST.Text | AST.Comment | AST.ExpressionTag>} */
	let sequence = [];

	function flush() {
		if (sequence.length === 0) {
			return;
		}

		let quasi = b.quasi('', false);
		const quasis = [quasi];

		/** @type {Expression[]} */
		const expressions = [];

		for (let i = 0; i < sequence.length; i++) {
			const node = sequence[i];

			if (node.type === 'Text' || node.type === 'Comment') {
				quasi.value.cooked +=
					node.type === 'Comment' ? `<!--${node.data}-->` : escape_html(node.data);
			} else {
				const evaluated = state.scope.evaluate(node.expression);

				if (evaluated.is_known) {
					quasi.value.cooked += escape_html((evaluated.value ?? '') + '');
				} else {
					expressions.push(b.call('$.escape', /** @type {Expression} */ (visit(node.expression))));

					quasi = b.quasi('', i + 1 === sequence.length);
					quasis.push(quasi);
				}
			}
		}

		for (const quasi of quasis) {
			quasi.value.raw = sanitize_template_string(/** @type {string} */ (quasi.value.cooked));
		}

		state.template.push(b.template(quasis, expressions));
		sequence = [];
	}

	for (const node of nodes) {
		if (node.type === 'ExpressionTag' && node.metadata.expression.is_async()) {
			flush();

			const expression = /** @type {Expression} */ (visit(node.expression));
			state.template.push(create_push(b.call('$.escape', expression), node.metadata.expression));
		} else if (node.type === 'Text' || node.type === 'Comment' || node.type === 'ExpressionTag') {
			sequence.push(node);
		} else {
			flush();
			visit(node, { ...state });
		}
	}

	flush();
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
 * @returns {Statement[]}
 */
export function build_template(template) {
	/** @type {string[]} */
	let strings = [];

	/** @type {Expression[]} */
	let expressions = [];

	/** @type {Statement[]} */
	const statements = [];

	const flush = () => {
		statements.push(
			b.stmt(
				b.call(
					b.id('$$renderer.push'),
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
 * @param {(expression: Expression, metadata: ExpressionMetadata) => Expression} transform
 * @param {boolean} trim_whitespace
 * @param {boolean} is_component
 * @returns {Expression}
 */
export function build_attribute_value(
	value,
	context,
	transform,
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

		return transform(
			/** @type {Expression} */ (context.visit(chunk.expression)),
			chunk.metadata.expression
		);
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
				b.call(
					'$.stringify',
					transform(
						/** @type {Expression} */ (context.visit(node.expression)),
						node.metadata.expression
					)
				)
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

/**
 * Creates a `$$renderer.child(...)` expression statement
 * @param {BlockStatement | Expression} body
 * @returns {Statement}
 */
export function create_child_block(body) {
	return b.stmt(b.call('$$renderer.child', b.arrow([b.id('$$renderer')], body, true)));
}

/**
 * Creates a `$$renderer.async(...)` expression statement
 * @param {BlockStatement | Expression} body
 * @param {ArrayExpression} blockers
 * @param {boolean} has_await
 * @param {boolean} needs_hydration_markers
 */
export function create_async_block(
	body,
	blockers = b.array([]),
	has_await = true,
	needs_hydration_markers = true
) {
	return b.stmt(
		b.call(
			needs_hydration_markers ? '$$renderer.async_block' : '$$renderer.async',
			blockers,
			b.arrow([b.id('$$renderer')], body, has_await)
		)
	);
}

/**
 * @param {Expression} expression
 * @param {ExpressionMetadata} metadata
 * @param {boolean} needs_hydration_markers
 * @returns {Expression | Statement}
 */
export function create_push(expression, metadata, needs_hydration_markers = false) {
	if (metadata.is_async()) {
		let statement = b.stmt(b.call('$$renderer.push', b.thunk(expression, metadata.has_await)));

		const blockers = metadata.blockers();

		if (blockers.elements.length > 0) {
			statement = create_async_block(
				b.block([statement]),
				blockers,
				false,
				needs_hydration_markers
			);
		}

		return statement;
	}

	return expression;
}

/**
 * @param {BlockStatement | Expression} body
 * @param {Identifier | false} component_fn_id
 * @returns {Statement}
 */
export function call_component_renderer(body, component_fn_id) {
	return b.stmt(
		b.call('$$renderer.component', b.arrow([b.id('$$renderer')], body, false), component_fn_id)
	);
}

/**
 * A utility for optimising promises in templates. Without it code like
 * `<Component foo={await fetch()} bar={await other()} />` would be transformed
 * into two blocking promises, with it it's using `Promise.all` to await them.
 * It also keeps track of blocking promises, i.e. those that need to be resolved before continuing.
 */
export class PromiseOptimiser {
	/** @type {Expression[]} */
	expressions = [];

	has_await = false;

	/** @type {Set<Expression>} */
	#blockers = new Set();

	/**
	 * @param {Expression} expression
	 * @param {ExpressionMetadata} metadata
	 */
	transform = (expression, metadata) => {
		this.check_blockers(metadata);

		if (metadata.has_await) {
			this.has_await = true;

			const length = this.expressions.push(expression);
			return b.id(`$$${length - 1}`);
		}

		return expression;
	};

	/**
	 * @param {ExpressionMetadata} metadata
	 */
	check_blockers(metadata) {
		for (const binding of metadata.dependencies) {
			if (binding.blocker) {
				this.#blockers.add(binding.blocker);
			}
		}
	}

	apply() {
		if (this.expressions.length === 0) {
			return b.empty;
		}

		if (this.expressions.length === 1) {
			return b.const('$$0', this.expressions[0]);
		}

		const promises = b.array(
			this.expressions.map((expression) => {
				return expression.type === 'AwaitExpression' && !has_await_expression(expression.argument)
					? expression.argument
					: b.call(b.thunk(expression, true));
			})
		);

		return b.const(
			b.array_pattern(this.expressions.map((_, i) => b.id(`$$${i}`))),
			b.await(b.call('Promise.all', promises))
		);
	}

	blockers() {
		return b.array([...this.#blockers]);
	}

	is_async() {
		return this.expressions.length > 0 || this.#blockers.size > 0;
	}
}
