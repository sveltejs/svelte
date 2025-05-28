/** @import { AssignmentExpression, Expression, ExpressionStatement, Identifier, MemberExpression, SequenceExpression, Literal, Super, UpdateExpression } from 'estree' */
/** @import { AST, ExpressionMetadata } from '#compiler' */
/** @import { ComponentClientTransformState, Context } from '../../types' */
import { walk } from 'zimmerframe';
import { object } from '../../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { sanitize_template_string } from '../../../../../utils/sanitize_template_string.js';
import { regex_is_valid_identifier } from '../../../../patterns.js';
import is_reference from 'is-reference';
import { dev, is_ignored, locator } from '../../../../../state.js';
import { create_derived } from '../../utils.js';

/**
 * @param {ComponentClientTransformState} state
 * @param {Expression} value
 */
export function memoize_expression(state, value) {
	const id = b.id(state.scope.generate('expression'));
	state.init.push(b.const(id, create_derived(state, b.thunk(value))));
	return b.call('$.get', id);
}

/**
 * Pushes `value` into `expressions` and returns a new id
 * @param {Expression[]} expressions
 * @param {Expression} value
 */
export function get_expression_id(expressions, value) {
	return b.id(`$${expressions.push(value) - 1}`);
}

/**
 * @param {Array<AST.Text | AST.ExpressionTag>} values
 * @param {(node: AST.SvelteNode, state: any) => any} visit
 * @param {ComponentClientTransformState} state
 * @param {(value: Expression, metadata: ExpressionMetadata) => Expression} memoize
 * @returns {{ value: Expression, has_state: boolean }}
 */
export function build_template_chunk(
	values,
	visit,
	state,
	memoize = (value, metadata) =>
		metadata.has_call ? get_expression_id(state.expressions, value) : value
) {
	/** @type {Expression[]} */
	const expressions = [];

	let quasi = b.quasi('');
	const quasis = [quasi];

	let has_state = false;

	for (let i = 0; i < values.length; i++) {
		const node = values[i];

		if (node.type === 'Text') {
			quasi.value.cooked += node.data;
		} else if (node.expression.type === 'Literal') {
			if (node.expression.value != null) {
				quasi.value.cooked += node.expression.value + '';
			}
		} else if (
			node.expression.type !== 'Identifier' ||
			node.expression.name !== 'undefined' ||
			state.scope.get('undefined')
		) {
			let value = memoize(
				/** @type {Expression} */ (visit(node.expression, state)),
				node.metadata.expression
			);

			const evaluated = state.scope.evaluate(value);

			has_state ||= node.metadata.expression.has_state && !evaluated.is_known;

			if (values.length === 1) {
				// If we have a single expression, then pass that in directly to possibly avoid doing
				// extra work in the template_effect (instead we do the work in set_text).
				if (evaluated.is_known) {
					value = b.literal((evaluated.value ?? '') + '');
				}

				return { value, has_state };
			}

			if (
				value.type === 'LogicalExpression' &&
				value.right.type === 'Literal' &&
				(value.operator === '??' || value.operator === '||')
			) {
				// `foo ?? null` -=> `foo ?? ''`
				// otherwise leave the expression untouched
				if (value.right.value === null) {
					value = { ...value, right: b.literal('') };
				}
			}

			if (evaluated.is_known) {
				quasi.value.cooked += (evaluated.value ?? '') + '';
			} else {
				if (!evaluated.is_defined) {
					// add `?? ''` where necessary
					value = b.logical('??', value, b.literal(''));
				}

				expressions.push(value);

				quasi = b.quasi('', i + 1 === values.length);
				quasis.push(quasi);
			}
		}
	}

	for (const quasi of quasis) {
		quasi.value.raw = sanitize_template_string(/** @type {string} */ (quasi.value.cooked));
	}

	const value =
		expressions.length > 0
			? b.template(quasis, expressions)
			: b.literal(/** @type {string} */ (quasi.value.cooked));

	return { value, has_state };
}

/**
 * @param {ComponentClientTransformState} state
 */
export function build_render_statement(state) {
	return b.stmt(
		b.call(
			'$.template_effect',
			b.arrow(
				state.expressions.map((_, i) => b.id(`$${i}`)),
				state.update.length === 1 && state.update[0].type === 'ExpressionStatement'
					? state.update[0].expression
					: b.block(state.update)
			),
			state.expressions.length > 0 &&
				b.array(state.expressions.map((expression) => b.thunk(expression))),
			state.expressions.length > 0 && !state.analysis.runes && b.id('$.derived_safe_equal')
		)
	);
}

/**
 * For unfortunate legacy reasons, directive names can look like this `use:a.b-c`
 * This turns that string into a member expression
 * @param {string} name
 */
export function parse_directive_name(name) {
	// this allow for accessing members of an object
	const parts = name.split('.');
	let part = /** @type {string} */ (parts.shift());

	/** @type {Identifier | MemberExpression} */
	let expression = b.id(part);

	while ((part = /** @type {string} */ (parts.shift()))) {
		const computed = !regex_is_valid_identifier.test(part);
		expression = b.member(expression, computed ? b.literal(part) : b.id(part), computed);
	}

	return expression;
}

/**
 * @param {ComponentClientTransformState} state
 * @param {string} id
 * @param {Expression | undefined} init
 * @param {Expression} value
 * @param {ExpressionStatement} update
 */
export function build_update_assignment(state, id, init, value, update) {
	state.init.push(b.var(id, init));
	state.update.push(
		b.if(b.binary('!==', b.id(id), b.assignment('=', b.id(id), value)), b.block([update]))
	);
}

/**
 * Serializes `bind:this` for components and elements.
 * @param {Identifier | MemberExpression | SequenceExpression} expression
 * @param {Expression} value
 * @param {import('zimmerframe').Context<AST.SvelteNode, ComponentClientTransformState>} context
 */
export function build_bind_this(expression, value, { state, visit }) {
	if (expression.type === 'SequenceExpression') {
		const [get, set] = /** @type {SequenceExpression} */ (visit(expression)).expressions;
		return b.call('$.bind_this', value, set, get);
	}

	/** @type {Identifier[]} */
	const ids = [];

	/** @type {Expression[]} */
	const values = [];

	/** @type {string[]} */
	const seen = [];

	const transform = { ...state.transform };

	// Pass in each context variables to the get/set functions, so that we can null out old values on teardown.
	// Note that we only do this for each context variables, the consequence is that the value might be stale in
	// some scenarios where the value is a member expression with changing computed parts or using a combination of multiple
	// variables, but that was the same case in Svelte 4, too. Once legacy mode is gone completely, we can revisit this.
	walk(expression, null, {
		Identifier(node, { path }) {
			if (seen.includes(node.name)) return;
			seen.push(node.name);

			const parent = /** @type {Expression} */ (path.at(-1));
			if (!is_reference(node, parent)) return;

			const binding = state.scope.get(node.name);
			if (!binding) return;

			for (const [owner, scope] of state.scopes) {
				if (owner.type === 'EachBlock' && scope === binding.scope) {
					ids.push(node);
					values.push(/** @type {Expression} */ (visit(node)));

					if (transform[node.name]) {
						transform[node.name] = {
							...transform[node.name],
							read: (node) => node
						};
					}

					break;
				}
			}
		}
	});

	const child_state = { ...state, transform };

	const get = /** @type {Expression} */ (visit(expression, child_state));
	const set = /** @type {Expression} */ (
		visit(b.assignment('=', expression, b.id('$$value')), child_state)
	);

	// If we're mutating a property, then it might already be non-existent.
	// If we make all the object nodes optional, then it avoids any runtime exceptions.
	/** @type {Expression | Super} */
	let node = get;

	while (node.type === 'MemberExpression') {
		node.optional = true;
		node = node.object;
	}

	return b.call(
		'$.bind_this',
		value,
		b.arrow([b.id('$$value'), ...ids], set),
		b.arrow([...ids], get),
		values.length > 0 && b.thunk(b.array(values))
	);
}

/**
 * @param {ComponentClientTransformState} state
 * @param {AST.BindDirective} binding
 * @param {MemberExpression} expression
 */
export function validate_binding(state, binding, expression) {
	if (binding.expression.type === 'SequenceExpression') {
		return;
	}
	// If we are referencing a $store.foo then we don't need to add validation
	const left = object(binding.expression);
	const left_binding = left && state.scope.get(left.name);
	if (left_binding?.kind === 'store_sub') return;

	const loc = locator(binding.start);

	const obj = /** @type {Expression} */ (expression.object);

	state.init.push(
		b.stmt(
			b.call(
				'$.validate_binding',
				b.literal(state.analysis.source.slice(binding.start, binding.end)),
				b.thunk(
					state.store_to_invalidate ? b.sequence([b.call('$.mark_store_binding'), obj]) : obj
				),
				b.thunk(
					/** @type {Expression} */ (
						expression.computed
							? expression.property
							: b.literal(/** @type {Identifier} */ (expression.property).name)
					)
				),
				loc && b.literal(loc.line),
				loc && b.literal(loc.column)
			)
		)
	);
}

/**
 * In dev mode validate mutations to props
 * @param {AssignmentExpression | UpdateExpression} node
 * @param {Context} context
 * @param {Expression} expression
 */
export function validate_mutation(node, context, expression) {
	let left = /** @type {Expression | Super} */ (
		node.type === 'AssignmentExpression' ? node.left : node.argument
	);

	if (!dev || left.type !== 'MemberExpression' || is_ignored(node, 'ownership_invalid_mutation')) {
		return expression;
	}

	const name = object(left);
	if (!name) return expression;

	const binding = context.state.scope.get(name.name);
	if (binding?.kind !== 'prop' && binding?.kind !== 'bindable_prop') return expression;

	const state = /** @type {ComponentClientTransformState} */ (context.state);
	state.analysis.needs_mutation_validation = true;

	/** @type {Array<Identifier | Literal | Expression>} */
	const path = [];

	while (left.type === 'MemberExpression') {
		if (left.property.type === 'Literal') {
			path.unshift(left.property);
		} else if (left.property.type === 'Identifier') {
			const transform = Object.hasOwn(context.state.transform, left.property.name)
				? context.state.transform[left.property.name]
				: null;
			if (left.computed) {
				path.unshift(transform?.read ? transform.read(left.property) : left.property);
			} else {
				path.unshift(b.literal(left.property.name));
			}
		} else {
			return expression;
		}

		left = left.object;
	}

	path.unshift(b.literal(name.name));

	const loc = locator(/** @type {number} */ (left.start));

	return b.call(
		'$$ownership_validator.mutation',
		b.literal(binding.prop_alias),
		b.array(path),
		expression,
		loc && b.literal(loc.line),
		loc && b.literal(loc.column)
	);
}
