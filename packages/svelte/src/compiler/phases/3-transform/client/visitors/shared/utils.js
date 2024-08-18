/** @import { Expression, ExpressionStatement, Identifier, MemberExpression, Statement, Super, TemplateElement, TemplateLiteral } from 'estree' */
/** @import { BindDirective, DelegatedEvent, ExpressionMetadata, ExpressionTag, OnDirective, SvelteNode, Text } from '#compiler' */
/** @import { ComponentClientTransformState, ComponentContext } from '../../types' */
import { walk } from 'zimmerframe';
import { object } from '../../../../../utils/ast.js';
import * as b from '../../../../../utils/builders.js';
import { sanitize_template_string } from '../../../../../utils/sanitize_template_string.js';
import { regex_is_valid_identifier } from '../../../../patterns.js';
import { create_derived } from '../../utils.js';
import is_reference from 'is-reference';
import { locator } from '../../../../../state.js';

/**
 * @param {Array<Text | ExpressionTag>} values
 * @param {(node: SvelteNode, state: any) => any} visit
 * @param {ComponentClientTransformState} state
 */
export function build_template_literal(values, visit, state) {
	/** @type {Expression[]} */
	const expressions = [];

	let quasi = b.quasi('');
	const quasis = [quasi];

	let has_call = false;
	let has_state = false;
	let contains_multiple_call_expression = false;

	for (let i = 0; i < values.length; i++) {
		const node = values[i];

		if (node.type === 'ExpressionTag') {
			if (node.metadata.expression.has_call) {
				if (has_call) {
					contains_multiple_call_expression = true;
				}
				has_call = true;
			}

			has_state ||= node.metadata.expression.has_state;
		}
	}

	for (let i = 0; i < values.length; i++) {
		const node = values[i];

		if (node.type === 'Text') {
			quasi.value.raw += sanitize_template_string(node.data);
		} else if (node.type === 'ExpressionTag' && node.expression.type === 'Literal') {
			if (node.expression.value != null) {
				quasi.value.raw += sanitize_template_string(node.expression.value + '');
			}
		} else {
			if (contains_multiple_call_expression) {
				const id = b.id(state.scope.generate('stringified_text'));

				state.init.push(
					b.const(
						id,
						create_derived(
							state,
							b.thunk(
								b.logical(
									'??',
									/** @type {Expression} */ (visit(node.expression, state)),
									b.literal('')
								)
							)
						)
					)
				);
				expressions.push(b.call('$.get', id));
			} else if (values.length === 1) {
				// If we have a single expression, then pass that in directly to possibly avoid doing
				// extra work in the template_effect (instead we do the work in set_text).
				return { value: visit(node.expression, state), has_state, has_call };
			} else {
				expressions.push(b.logical('??', visit(node.expression, state), b.literal('')));
			}

			quasi = b.quasi('', i + 1 === values.length);
			quasis.push(quasi);
		}
	}

	const value = b.template(quasis, expressions);

	return { value, has_state, has_call };
}

/**
 * @param {Statement} statement
 */
export function build_update(statement) {
	const body =
		statement.type === 'ExpressionStatement' ? statement.expression : b.block([statement]);

	return b.stmt(b.call('$.template_effect', b.thunk(body)));
}

/**
 * @param {Statement[]} update
 */
export function build_render_statement(update) {
	return update.length === 1
		? build_update(update[0])
		: b.stmt(b.call('$.template_effect', b.thunk(b.block(update))));
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
 * @param {Identifier | MemberExpression} expression
 * @param {Expression} value
 * @param {import('zimmerframe').Context<SvelteNode, ComponentClientTransformState>} context
 */
export function build_bind_this(expression, value, { state, visit }) {
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
 * @param {BindDirective} binding
 * @param {MemberExpression} expression
 */
export function validate_binding(state, binding, expression) {
	// If we are referencing a $store.foo then we don't need to add validation
	const left = object(binding.expression);
	const left_binding = left && state.scope.get(left.name);
	if (left_binding?.kind === 'store_sub') return;

	const loc = locator(binding.start);

	state.init.push(
		b.stmt(
			b.call(
				'$.validate_binding',
				b.literal(state.analysis.source.slice(binding.start, binding.end)),
				b.thunk(/** @type {Expression} */ (expression.object)),
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
