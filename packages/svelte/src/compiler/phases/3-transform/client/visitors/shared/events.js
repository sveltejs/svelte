/** @import { Expression } from 'estree' */
/** @import { Attribute, ExpressionMetadata, ExpressionTag, SvelteNode } from '#compiler' */
/** @import { ComponentContext } from '../../types' */
import { is_capture_event, is_passive_event } from '../../../../../../utils.js';
import { dev, locator } from '../../../../../state.js';
import * as b from '../../../../../utils/builders.js';

/**
 * @param {Attribute} node
 * @param {ComponentContext} context
 */
export function visit_event_attribute(node, context) {
	let capture = false;

	let event_name = node.name.slice(2);
	if (is_capture_event(event_name)) {
		event_name = event_name.slice(0, -7);
		capture = true;
	}

	// we still need to support the weird `onclick="{() => {...}}" form
	const tag = Array.isArray(node.value)
		? /** @type {ExpressionTag} */ (node.value[0])
		: /** @type {ExpressionTag} */ (node.value);

	let handler = build_event_handler(tag.expression, tag.metadata.expression, context);

	if (node.metadata.delegated) {
		let delegated_assignment;

		if (!context.state.events.has(event_name)) {
			context.state.events.add(event_name);
		}

		// Hoist function if we can, otherwise we leave the function as is
		if (node.metadata.delegated.hoisted) {
			if (node.metadata.delegated.function === tag.expression) {
				const func_name = context.state.scope.root.unique('on_' + event_name);
				context.state.hoisted.push(b.var(func_name, handler));
				handler = func_name;
			}

			const hoisted_params = /** @type {Expression[]} */ (
				node.metadata.delegated.function.metadata.hoisted_params
			);

			// When we hoist a function we assign an array with the function and all
			// hoisted closure params.
			const args = [handler, ...hoisted_params];
			delegated_assignment = b.array(args);
		} else {
			delegated_assignment = handler;
		}

		context.state.init.push(
			b.stmt(
				b.assignment('=', b.member(context.state.node, '__' + event_name), delegated_assignment)
			)
		);
	} else {
		const statement = b.stmt(
			build_event(
				event_name,
				context.state.node,
				handler,
				capture,
				is_passive_event(event_name) ? true : undefined
			)
		);

		const type = /** @type {SvelteNode} */ (context.path.at(-1)).type;

		if (type === 'SvelteDocument' || type === 'SvelteWindow' || type === 'SvelteBody') {
			// These nodes are above the component tree, and its events should run parent first
			context.state.init.push(statement);
		} else {
			context.state.after_update.push(statement);
		}
	}
}

/**
 * Creates a `$.event(...)` call for non-delegated event handlers
 * @param {string} event_name
 * @param {Expression} node
 * @param {Expression} handler
 * @param {boolean} capture
 * @param {boolean | undefined} passive
 */
export function build_event(event_name, node, handler, capture, passive) {
	return b.call(
		'$.event',
		b.literal(event_name),
		node,
		handler,
		capture && b.true,
		passive === undefined ? undefined : b.literal(passive)
	);
}

/**
 * Creates an event handler
 * @param {Expression | null} node
 * @param {ExpressionMetadata} metadata
 * @param {ComponentContext} context
 * @returns {Expression}
 */
export function build_event_handler(node, metadata, context) {
	if (node === null) {
		// bubble event
		return b.function(
			null,
			[b.id('$$arg')],
			b.block([b.stmt(b.call('$.bubble_event.call', b.this, b.id('$$props'), b.id('$$arg')))])
		);
	}

	let handler = /** @type {Expression} */ (context.visit(node));

	// inline handler
	if (handler.type === 'ArrowFunctionExpression' || handler.type === 'FunctionExpression') {
		return handler;
	}

	// function declared in the script
	if (
		handler.type === 'Identifier' &&
		context.state.scope.get(handler.name)?.declaration_kind !== 'import'
	) {
		return handler;
	}

	if (metadata.has_call) {
		// memoize where necessary
		const id = b.id(context.state.scope.generate('event_handler'));

		context.state.init.push(b.var(id, b.call('$.derived', b.thunk(handler))));
		handler = b.call('$.get', id);
	}

	// wrap the handler in a function, so the expression is re-evaluated for each event
	let call = b.call(b.member(handler, 'apply', false, true), b.this, b.id('$$args'));

	if (dev) {
		const loc = locator(/** @type {number} */ (node.start));

		const remove_parens =
			node.type === 'CallExpression' &&
			node.arguments.length === 0 &&
			node.callee.type === 'Identifier';

		call = b.call(
			'$.apply',
			b.thunk(handler),
			b.this,
			b.id('$$args'),
			b.id(context.state.analysis.name),
			loc && b.array([b.literal(loc.line), b.literal(loc.column)]),
			has_side_effects(node) && b.true,
			remove_parens && b.true
		);
	}

	return b.function(null, [b.rest(b.id('$$args'))], b.block([b.stmt(call)]));
}

/**
 * @param {Expression} node
 */
function has_side_effects(node) {
	if (
		node.type === 'CallExpression' ||
		node.type === 'NewExpression' ||
		node.type === 'AssignmentExpression' ||
		node.type === 'UpdateExpression'
	) {
		return true;
	}

	if (node.type === 'SequenceExpression') {
		return node.expressions.some(has_side_effects);
	}

	return false;
}
