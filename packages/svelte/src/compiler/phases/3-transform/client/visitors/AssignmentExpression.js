/** @import { Location } from 'locate-character' */
/** @import { AssignmentExpression, AssignmentOperator, Expression, Identifier, Literal, MemberExpression, Pattern } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Context } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import {
	build_assignment_value,
	get_attribute_expression,
	is_event_attribute
} from '../../../../utils/ast.js';
import { dev, filename, is_ignored, locator } from '../../../../state.js';
import { build_proxy_reassignment, should_proxy } from '../utils.js';
import { visit_assignment_expression } from '../../shared/assignments.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	const expression = /** @type {Expression} */ (
		visit_assignment_expression(node, context, build_assignment) ?? context.next()
	);

	return is_ignored(node, 'ownership_invalid_mutation')
		? b.call('$.skip_ownership_validation', b.thunk(expression))
		: expression;
}

/**
 * Determines whether the value will be coerced on assignment (as with e.g. `+=`).
 * If not, we may need to proxify the value, or warn that the value will not be
 * proxified in time
 * @param {AssignmentOperator} operator
 */
function is_non_coercive_operator(operator) {
	return ['=', '||=', '&&=', '??='].includes(operator);
}

/** @type {Record<string, string>} */
const callees = {
	'=': '$.assign',
	'&&=': '$.assign_and',
	'||=': '$.assign_or',
	'??=': '$.assign_nullish'
};

/**
 * @param {AssignmentOperator} operator
 * @param {Pattern} left
 * @param {Expression} right
 * @param {Context} context
 * @returns {Expression | null}
 */
function build_assignment(operator, left, right, context) {
	// Handle class private/public state assignment cases
	if (
		context.state.analysis.runes &&
		left.type === 'MemberExpression' &&
		left.property.type === 'PrivateIdentifier'
	) {
		const private_state = context.state.private_state.get(left.property.name);

		if (private_state !== undefined) {
			let value = /** @type {Expression} */ (
				context.visit(build_assignment_value(operator, left, right))
			);

			if (
				private_state.kind === 'state' &&
				is_non_coercive_operator(operator) &&
				should_proxy(value, context.state.scope)
			) {
				value = build_proxy_reassignment(value, b.member(b.this, private_state.id));
			}

			if (context.state.in_constructor) {
				// inside the constructor, we can assign to `this.#foo.v` rather than using `$.set`,
				// since nothing is tracking the signal at this point
				return b.assignment(operator, /** @type {Pattern} */ (context.visit(left)), value);
			}

			return b.call('$.set', left, value);
		}
	}

	let object = left;

	while (object.type === 'MemberExpression') {
		// @ts-expect-error
		object = object.object;
	}

	if (object.type !== 'Identifier') {
		return null;
	}

	const binding = context.state.scope.get(object.name);
	if (!binding) return null;

	const transform = Object.hasOwn(context.state.transform, object.name)
		? context.state.transform[object.name]
		: null;

	const path = context.path.map((node) => node.type);

	// reassignment
	if (object === left && transform?.assign) {
		// special case — if an element binding, we know it's a primitive

		const is_primitive = path.at(-1) === 'BindDirective' && path.at(-2) === 'RegularElement';

		let value = /** @type {Expression} */ (
			context.visit(build_assignment_value(operator, left, right))
		);

		if (
			!is_primitive &&
			binding.kind !== 'prop' &&
			binding.kind !== 'bindable_prop' &&
			binding.kind !== 'raw_state' &&
			context.state.analysis.runes &&
			should_proxy(right, context.state.scope) &&
			is_non_coercive_operator(operator)
		) {
			value = build_proxy_reassignment(value, object);
		}

		return transform.assign(object, value);
	}

	// mutation
	if (transform?.mutate) {
		return transform.mutate(
			object,
			b.assignment(
				operator,
				/** @type {Pattern} */ (context.visit(left)),
				/** @type {Expression} */ (context.visit(right))
			)
		);
	}

	// in cases like `(object.items ??= []).push(value)`, we may need to warn
	// if the value gets proxified, since the proxy _isn't_ the thing that
	// will be pushed to. we do this by transforming it to something like
	// `$.assign_nullish(object, 'items', [])`
	let should_transform =
		dev && path.at(-1) !== 'ExpressionStatement' && is_non_coercive_operator(operator);

	// special case — ignore `onclick={() => (...)}`
	if (
		path.at(-1) === 'ArrowFunctionExpression' &&
		(path.at(-2) === 'RegularElement' || path.at(-2) === 'SvelteElement')
	) {
		const element = /** @type {AST.RegularElement} */ (context.path.at(-2));

		const attribute = element.attributes.find((attribute) => {
			if (attribute.type !== 'Attribute' || !is_event_attribute(attribute)) {
				return false;
			}

			const expression = get_attribute_expression(attribute);

			return expression === context.path.at(-1);
		});

		if (attribute) {
			should_transform = false;
		}
	}

	// special case — ignore `bind:prop={getter, (v) => (...)}` / `bind:value={x.y}`
	if (
		path.at(-1) === 'Component' ||
		path.at(-1) === 'SvelteComponent' ||
		(path.at(-1) === 'ArrowFunctionExpression' &&
			path.at(-2) === 'SequenceExpression' &&
			(path.at(-3) === 'Component' || path.at(-3) === 'SvelteComponent'))
	) {
		should_transform = false;
	}

	if (left.type === 'MemberExpression' && should_transform) {
		const callee = callees[operator];

		const loc = /** @type {Location} */ (locator(/** @type {number} */ (left.start)));
		const location = `${filename}:${loc.line}:${loc.column}`;

		return /** @type {Expression} */ (
			context.visit(
				b.call(
					callee,
					/** @type {Expression} */ (left.object),
					/** @type {Expression} */ (
						left.computed
							? left.property
							: b.literal(/** @type {Identifier} */ (left.property).name)
					),
					right,
					b.literal(location)
				)
			)
		);
	}

	return null;
}
