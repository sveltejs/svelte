/** @import { AssignmentExpression, Expression, Identifier, MemberExpression, SequenceExpression, Literal, Super, UpdateExpression, ExpressionStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentClientTransformState, ComponentContext, Context } from '../../types' */
import { walk } from 'zimmerframe';
import { object } from '../../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { sanitize_template_string } from '../../../../../utils/sanitize_template_string.js';
import { regex_is_valid_identifier } from '../../../../patterns.js';
import is_reference from 'is-reference';
import { dev, is_ignored, locator, component_name } from '../../../../../state.js';
import { build_getter } from '../../utils.js';
import { ExpressionMetadata } from '../../../../nodes.js';

/**
 * A utility for extracting complex expressions (such as call expressions)
 * from templates and replacing them with `$0`, `$1` etc
 */
export class Memoizer {
	/** @type {Array<{ id: Identifier, expression: Expression }>} */
	#sync = [];

	/** @type {Array<{ id: Identifier, expression: Expression }>} */
	#async = [];

	/** @type {Set<Expression>} */
	#blockers = new Set();

	/**
	 * @param {Expression} expression
	 * @param {ExpressionMetadata} metadata
	 * @param {boolean} memoize_if_state
	 */
	add(expression, metadata, memoize_if_state = false) {
		this.check_blockers(metadata);

		const should_memoize =
			metadata.has_call || metadata.has_await || (memoize_if_state && metadata.has_state);

		if (!should_memoize) {
			// no memoization required
			return expression;
		}

		const id = b.id('#'); // filled in later

		(metadata.has_await ? this.#async : this.#sync).push({ id, expression });

		return id;
	}

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
		return [...this.#sync, ...this.#async].map((memo, i) => {
			memo.id.name = `$${i}`;
			return memo.id;
		});
	}

	blockers() {
		return this.#blockers.size > 0 ? b.array([...this.#blockers]) : undefined;
	}

	deriveds(runes = true) {
		return this.#sync.map((memo) =>
			b.let(memo.id, b.call(runes ? '$.derived' : '$.derived_safe_equal', b.thunk(memo.expression)))
		);
	}

	async_ids() {
		return this.#async.map((memo) => memo.id);
	}

	async_values() {
		if (this.#async.length === 0) return;
		return b.array(this.#async.map((memo) => b.thunk(memo.expression, true)));
	}

	sync_values() {
		if (this.#sync.length === 0) return;
		return b.array(this.#sync.map((memo) => b.thunk(memo.expression)));
	}
}

/**
 * @param {Array<AST.Text | AST.ExpressionTag>} values
 * @param {ComponentContext} context
 * @param {ComponentClientTransformState} state
 * @param {(value: Expression, metadata: ExpressionMetadata) => Expression} memoize
 * @returns {{ value: Expression, has_state: boolean }}
 */
export function build_template_chunk(
	values,
	context,
	state = context.state,
	memoize = (value, metadata) => state.memoizer.add(value, metadata)
) {
	/** @type {Expression[]} */
	const expressions = [];

	let quasi = b.quasi('');
	const quasis = [quasi];

	let has_state = false;
	let has_await = false;

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
				build_expression(context, node.expression, node.metadata.expression, state),
				node.metadata.expression
			);

			const evaluated = state.scope.evaluate(value);

			has_await ||= node.metadata.expression.has_await || node.metadata.expression.has_blockers();
			has_state ||= has_await || (node.metadata.expression.has_state && !evaluated.is_known);

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
	const { memoizer } = state;

	const ids = memoizer.apply();

	return b.stmt(
		b.call(
			'$.template_effect',
			b.arrow(
				ids,
				state.update.length === 1 && state.update[0].type === 'ExpressionStatement'
					? state.update[0].expression
					: b.block(state.update)
			),
			memoizer.sync_values(),
			memoizer.async_values(),
			memoizer.blockers()
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
 * Serializes `bind:this` for components and elements.
 * @param {Identifier | MemberExpression | SequenceExpression} expression
 * @param {Expression} value
 * @param {import('zimmerframe').Context<AST.SvelteNode, ComponentClientTransformState>} context
 */
export function build_bind_this(expression, value, { state, visit }) {
	const [getter, setter] =
		expression.type === 'SequenceExpression' ? expression.expressions : [null, null];

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
	walk(getter ?? expression, null, {
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

	let get = /** @type {Expression} */ (visit(getter ?? expression, child_state));
	let set = /** @type {Expression} */ (
		visit(
			setter ??
				b.assignment(
					'=',
					/** @type {Identifier | MemberExpression} */ (expression),
					b.id('$$value')
				),
			child_state
		)
	);

	// If we're mutating a property, then it might already be non-existent.
	// If we make all the object nodes optional, then it avoids any runtime exceptions.
	/** @type {Expression | Super} */
	let node = get;

	while (node.type === 'MemberExpression') {
		node.optional = true;
		node = node.object;
	}

	get =
		get.type === 'ArrowFunctionExpression'
			? b.arrow([...ids], get.body)
			: get.type === 'FunctionExpression'
				? b.function(null, [...ids], get.body)
				: getter
					? get
					: b.arrow([...ids], get);

	set =
		set.type === 'ArrowFunctionExpression'
			? b.arrow([set.params[0] ?? b.id('_'), ...ids], set.body)
			: set.type === 'FunctionExpression'
				? b.function(null, [set.params[0] ?? b.id('_'), ...ids], set.body)
				: setter
					? set
					: b.arrow([b.id('$$value'), ...ids], set);

	return b.call('$.bind_this', value, set, get, values.length > 0 && b.thunk(b.array(values)));
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
				binding.metadata.expression.blockers(),
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
				b.literal(loc.line),
				b.literal(loc.column)
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

/**
 *
 * @param {ComponentContext} context
 * @param {Expression} expression
 * @param {ExpressionMetadata} metadata
 */
export function build_expression(context, expression, metadata, state = context.state) {
	const value = /** @type {Expression} */ (context.visit(expression, state));

	// Components not explicitly in legacy mode might be expected to be in runes mode (especially since we didn't
	// adjust this behavior until recently, which broke people's existing components), so we also bail in this case.
	// Kind of an in-between-mode.
	if (context.state.analysis.runes || context.state.analysis.maybe_runes) {
		return value;
	}

	if (!metadata.has_call && !metadata.has_member_expression && !metadata.has_assignment) {
		return value;
	}

	// Legacy reactivity is coarse-grained, looking at the statically visible dependencies. Replicate that here
	const sequence = b.sequence([]);

	for (const binding of metadata.references) {
		if (binding.kind === 'normal' && binding.declaration_kind !== 'import') {
			continue;
		}

		var getter = build_getter({ ...binding.node }, state);

		if (
			binding.kind === 'bindable_prop' ||
			binding.kind === 'template' ||
			binding.declaration_kind === 'import' ||
			binding.node.name === '$$props' ||
			binding.node.name === '$$restProps'
		) {
			getter = b.call('$.deep_read_state', getter);
		}

		sequence.expressions.push(getter);
	}

	sequence.expressions.push(b.call('$.untrack', b.thunk(value)));

	return sequence;
}

/**
 * Wraps a statement/expression with dev stack tracking in dev mode
 * @param {Expression} expression - The function call to wrap (e.g., $.if, $.each, etc.)
 * @param {{ start?: number }} node - AST node for location info
 * @param {'component' | 'if' | 'each' | 'await' | 'key' | 'render'} type - Type of block/component
 * @param {Record<string, number | string>} [additional] - Any additional properties to add to the dev stack entry
 * @returns {ExpressionStatement} - Statement with or without dev stack wrapping
 */
export function add_svelte_meta(expression, node, type, additional) {
	if (!dev) {
		return b.stmt(expression);
	}

	const location = node.start !== undefined && locator(node.start);
	if (!location) {
		return b.stmt(expression);
	}

	return b.stmt(
		b.call(
			'$.add_svelte_meta',
			b.arrow([], expression),
			b.literal(type),
			b.id(component_name),
			b.literal(location.line),
			b.literal(location.column),
			additional && b.object(Object.entries(additional).map(([k, v]) => b.init(k, b.literal(v))))
		)
	);
}
