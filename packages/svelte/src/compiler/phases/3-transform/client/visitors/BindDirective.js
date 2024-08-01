/** @import { CallExpression, Expression, MemberExpression } from 'estree' */
/** @import { Attribute, BindDirective } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import { is_text_attribute } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { binding_properties } from '../../../bindings.js';
import { serialize_set_binding } from '../utils.js';
import { serialize_attribute_value } from './shared/element.js';
import { serialize_bind_this, serialize_validate_binding } from './shared/utils.js';

/**
 * @param {BindDirective} node
 * @param {ComponentContext} context
 */
export function BindDirective(node, context) {
	const { state, path, visit } = context;
	const expression = node.expression;
	const property = binding_properties[node.name];

	if (
		expression.type === 'MemberExpression' &&
		(node.name !== 'this' ||
			path.some(
				({ type }) =>
					type === 'IfBlock' || type === 'EachBlock' || type === 'AwaitBlock' || type === 'KeyBlock'
			)) &&
		dev &&
		context.state.analysis.runes &&
		!is_ignored(node, 'binding_property_non_reactive')
	) {
		context.state.init.push(
			serialize_validate_binding(
				context.state,
				node,
				/**@type {MemberExpression} */ (visit(expression))
			)
		);
	}

	const getter = b.thunk(/** @type {Expression} */ (visit(expression)));
	const assignment = b.assignment('=', expression, b.id('$$value'));
	const setter = b.arrow(
		[b.id('$$value')],
		serialize_set_binding(
			assignment,
			context,
			() => /** @type {Expression} */ (visit(assignment)),
			null,
			{
				skip_proxy_and_freeze: true
			}
		)
	);

	/** @type {CallExpression} */
	let call_expr;

	if (property?.event) {
		call_expr = b.call(
			'$.bind_property',
			b.literal(node.name),
			b.literal(property.event),
			state.node,
			setter,
			property.bidirectional && getter
		);
	} else {
		// special cases
		switch (node.name) {
			// window
			case 'online':
				call_expr = b.call(`$.bind_online`, setter);
				break;

			case 'scrollX':
			case 'scrollY':
				call_expr = b.call(
					'$.bind_window_scroll',
					b.literal(node.name === 'scrollX' ? 'x' : 'y'),
					getter,
					setter
				);
				break;

			case 'innerWidth':
			case 'innerHeight':
			case 'outerWidth':
			case 'outerHeight':
				call_expr = b.call('$.bind_window_size', b.literal(node.name), setter);
				break;

			// document
			case 'activeElement':
				call_expr = b.call('$.bind_active_element', setter);
				break;

			// media
			case 'muted':
				call_expr = b.call(`$.bind_muted`, state.node, getter, setter);
				break;
			case 'paused':
				call_expr = b.call(`$.bind_paused`, state.node, getter, setter);
				break;
			case 'volume':
				call_expr = b.call(`$.bind_volume`, state.node, getter, setter);
				break;
			case 'playbackRate':
				call_expr = b.call(`$.bind_playback_rate`, state.node, getter, setter);
				break;
			case 'currentTime':
				call_expr = b.call(`$.bind_current_time`, state.node, getter, setter);
				break;
			case 'buffered':
				call_expr = b.call(`$.bind_buffered`, state.node, setter);
				break;
			case 'played':
				call_expr = b.call(`$.bind_played`, state.node, setter);
				break;
			case 'seekable':
				call_expr = b.call(`$.bind_seekable`, state.node, setter);
				break;
			case 'seeking':
				call_expr = b.call(`$.bind_seeking`, state.node, setter);
				break;
			case 'ended':
				call_expr = b.call(`$.bind_ended`, state.node, setter);
				break;
			case 'readyState':
				call_expr = b.call(`$.bind_ready_state`, state.node, setter);
				break;

			// dimensions
			case 'contentRect':
			case 'contentBoxSize':
			case 'borderBoxSize':
			case 'devicePixelContentBoxSize':
				call_expr = b.call('$.bind_resize_observer', state.node, b.literal(node.name), setter);
				break;

			case 'clientWidth':
			case 'clientHeight':
			case 'offsetWidth':
			case 'offsetHeight':
				call_expr = b.call('$.bind_element_size', state.node, b.literal(node.name), setter);
				break;

			// various
			case 'value': {
				const parent = path.at(-1);
				if (parent?.type === 'RegularElement' && parent.name === 'select') {
					call_expr = b.call(`$.bind_select_value`, state.node, getter, setter);
				} else {
					call_expr = b.call(`$.bind_value`, state.node, getter, setter);
				}
				break;
			}

			case 'files':
				call_expr = b.call(`$.bind_files`, state.node, getter, setter);
				break;

			case 'this':
				call_expr = serialize_bind_this(node.expression, state.node, context);
				break;
			case 'textContent':
			case 'innerHTML':
			case 'innerText':
				call_expr = b.call(
					'$.bind_content_editable',
					b.literal(node.name),
					state.node,
					getter,
					setter
				);
				break;

			// checkbox/radio
			case 'checked':
				call_expr = b.call(`$.bind_checked`, state.node, getter, setter);
				break;
			case 'focused':
				call_expr = b.call(`$.bind_focused`, state.node, setter);
				break;
			case 'group': {
				const indexes = node.metadata.parent_each_blocks.map((each) => {
					// if we have a keyed block with an index, the index is wrapped in a source
					return each.metadata.keyed && each.index
						? b.call('$.get', each.metadata.index)
						: each.metadata.index;
				});

				// We need to additionally invoke the value attribute signal to register it as a dependency,
				// so that when the value is updated, the group binding is updated
				let group_getter = getter;
				const parent = path.at(-1);
				if (parent?.type === 'RegularElement') {
					const value = /** @type {any[]} */ (
						/** @type {Attribute} */ (
							parent.attributes.find(
								(a) =>
									a.type === 'Attribute' &&
									a.name === 'value' &&
									!is_text_attribute(a) &&
									a.value !== true
							)
						)?.value
					);
					if (value !== undefined) {
						group_getter = b.thunk(
							b.block([
								b.stmt(serialize_attribute_value(value, context)[1]),
								b.return(/** @type {Expression} */ (visit(expression)))
							])
						);
					}
				}

				call_expr = b.call(
					'$.bind_group',
					node.metadata.binding_group_name,
					b.array(indexes),
					state.node,
					group_getter,
					setter
				);
				break;
			}

			default:
				throw new Error('unknown binding ' + node.name);
		}
	}

	const parent = /** @type {import('#compiler').SvelteNode} */ (context.path.at(-1));

	// Bindings need to happen after attribute updates, therefore after the render effect, and in order with events/actions.
	// bind:this is a special case as it's one-way and could influence the render effect.
	if (node.name === 'this') {
		state.init.push(b.stmt(call_expr));
	} else {
		const has_action_directive =
			parent.type === 'RegularElement' && parent.attributes.find((a) => a.type === 'UseDirective');
		state.after_update.push(
			b.stmt(has_action_directive ? b.call('$.effect', b.thunk(call_expr)) : call_expr)
		);
	}
}
