/** @import { Expression } from 'estree' */
/** @import { Attribute, ExpressionMetadata, ExpressionTag, OnDirective, SvelteNode } from '#compiler' */
/** @import { ComponentContext } from '../../types' */
import { is_capture_event, is_passive_event } from '../../../../../../utils.js';
import * as b from '../../../../../utils/builders.js';

/**
 * @param {Attribute} node
 * @param {ComponentContext} context
 */
export function build_event_attribute(node, context) {
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
		if (node.metadata.delegated.hoistable) {
			if (node.metadata.delegated.function === tag.expression) {
				const func_name = context.state.scope.root.unique('on_' + event_name);
				context.state.hoisted.push(b.var(func_name, handler));
				handler = func_name;
			}

			const hoistable_params = /** @type {Expression[]} */ (
				node.metadata.delegated.function.metadata.hoistable_params
			);
			// When we hoist a function we assign an array with the function and all
			// hoisted closure params.
			const args = [handler, ...hoistable_params];
			delegated_assignment = b.array(args);
		} else {
			delegated_assignment = handler;
		}

		context.state.init.push(
			b.stmt(
				b.assignment(
					'=',
					b.member(context.state.node, b.id('__' + event_name)),
					delegated_assignment
				)
			)
		);
	} else {
		const expression = build_event(event_name, handler, capture, undefined, context);

		// TODO this is duplicated with OnDirective
		const parent = /** @type {SvelteNode} */ (context.path.at(-1));
		const has_action_directive =
			parent.type === 'RegularElement' && parent.attributes.find((a) => a.type === 'UseDirective');
		const statement = b.stmt(
			has_action_directive ? b.call('$.effect', b.thunk(expression)) : expression
		);

		// TODO put this logic in the parent visitor?
		if (
			parent.type === 'SvelteDocument' ||
			parent.type === 'SvelteWindow' ||
			parent.type === 'SvelteBody'
		) {
			// These nodes are above the component tree, and its events should run parent first
			context.state.before_init.push(statement);
		} else {
			context.state.after_update.push(statement);
		}
	}
}

/**
 * Serializes an event handler function of the `on:` directive or an attribute starting with `on`
 * @param {string} event_name
 * @param {Expression} handler
 * @param {boolean} capture
 * @param {boolean | undefined} passive
 * @param {ComponentContext} context
 */
export function build_event(event_name, handler, capture, passive, context) {
	const args = [
		b.literal(event_name),
		context.state.node,
		handler,
		capture && b.true,
		passive === undefined ? undefined : b.literal(passive)
	];

	// Events need to run in order with bindings/actions
	return b.call('$.event', ...args);
}

/**
 * Serializes the event handler function of the `on:` directive
 * @param {Expression | null} expression
 * @param {null | ExpressionMetadata} metadata
 * @param {ComponentContext} context
 */
export function build_event_handler(expression, metadata, context) {
	if (!expression) {
		return b.function(
			null,
			[b.id('$$arg')],
			b.block([b.stmt(b.call('$.bubble_event.call', b.this, b.id('$$props'), b.id('$$arg')))])
		);
	}

	let handler = expression;

	// Event handlers can be dynamic (source/store/prop/conditional etc)
	const dynamic_handler = () =>
		b.function(
			null,
			[b.rest(b.id('$$args'))],
			b.block([
				b.return(
					b.call(
						b.member(
							/** @type {Expression} */ (context.visit(handler)),
							b.id('apply'),
							false,
							true
						),
						b.this,
						b.id('$$args')
					)
				)
			])
		);

	if (
		metadata?.has_call &&
		!(
			(handler.type === 'ArrowFunctionExpression' || handler.type === 'FunctionExpression') &&
			handler.metadata.hoistable
		)
	) {
		// Create a derived dynamic event handler
		const id = b.id(context.state.scope.generate('event_handler'));

		context.state.init.push(
			b.var(id, b.call('$.derived', b.thunk(/** @type {Expression} */ (context.visit(handler)))))
		);

		handler = b.function(
			null,
			[b.rest(b.id('$$args'))],
			b.block([
				b.return(
					b.call(b.member(b.call('$.get', id), b.id('apply'), false, true), b.this, b.id('$$args'))
				)
			])
		);
	} else if (handler.type === 'Identifier') {
		const binding = context.state.scope.get(handler.name);

		if (binding !== null && (binding.kind !== 'normal' || binding.declaration_kind === 'import')) {
			handler = dynamic_handler();
		} else {
			handler = /** @type {Expression} */ (context.visit(handler));
		}
	} else {
		handler = dynamic_handler();
	}

	return handler;
}
