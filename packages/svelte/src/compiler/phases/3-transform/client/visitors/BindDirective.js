/** @import { CallExpression, Expression, MemberExpression } from 'estree' */
/** @import { Attribute, BindDirective } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import { is_text_attribute } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { binding_properties } from '../../../bindings.js';
import { build_setter } from '../utils.js';
import { build_attribute_value } from './shared/element.js';
import { build_bind_this, validate_binding } from './shared/utils.js';

/**
 * @param {BindDirective} node
 * @param {ComponentContext} context
 */
export function BindDirective(node, context) {
	const expression = node.expression;
	const property = binding_properties[node.name];

	const parent = /** @type {import('#compiler').SvelteNode} */ (context.path.at(-1));

	if (
		dev &&
		context.state.analysis.runes &&
		expression.type === 'MemberExpression' &&
		(node.name !== 'this' ||
			context.path.some(
				({ type }) =>
					type === 'IfBlock' || type === 'EachBlock' || type === 'AwaitBlock' || type === 'KeyBlock'
			)) &&
		!is_ignored(node, 'binding_property_non_reactive')
	) {
		validate_binding(
			context.state,
			node,
			/**@type {MemberExpression} */ (context.visit(expression))
		);
	}

	const getter = b.thunk(/** @type {Expression} */ (context.visit(expression)));
	const assignment = b.assignment('=', expression, b.id('$$value'));
	const setter = b.arrow(
		[b.id('$$value')],
		build_setter(
			assignment,
			context,
			() => /** @type {Expression} */ (context.visit(assignment)),
			null,
			{
				skip_proxy_and_freeze: true
			}
		)
	);

	/** @type {CallExpression} */
	let call;

	if (property?.event) {
		call = b.call(
			'$.bind_property',
			b.literal(node.name),
			b.literal(property.event),
			context.state.node,
			setter,
			property.bidirectional && getter
		);
	} else {
		// special cases
		switch (node.name) {
			// window
			case 'online':
				call = b.call(`$.bind_online`, setter);
				break;

			case 'scrollX':
			case 'scrollY':
				call = b.call(
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
				call = b.call('$.bind_window_size', b.literal(node.name), setter);
				break;

			// document
			case 'activeElement':
				call = b.call('$.bind_active_element', setter);
				break;

			// media
			case 'muted':
				call = b.call(`$.bind_muted`, context.state.node, getter, setter);
				break;
			case 'paused':
				call = b.call(`$.bind_paused`, context.state.node, getter, setter);
				break;
			case 'volume':
				call = b.call(`$.bind_volume`, context.state.node, getter, setter);
				break;
			case 'playbackRate':
				call = b.call(`$.bind_playback_rate`, context.state.node, getter, setter);
				break;
			case 'currentTime':
				call = b.call(`$.bind_current_time`, context.state.node, getter, setter);
				break;
			case 'buffered':
				call = b.call(`$.bind_buffered`, context.state.node, setter);
				break;
			case 'played':
				call = b.call(`$.bind_played`, context.state.node, setter);
				break;
			case 'seekable':
				call = b.call(`$.bind_seekable`, context.state.node, setter);
				break;
			case 'seeking':
				call = b.call(`$.bind_seeking`, context.state.node, setter);
				break;
			case 'ended':
				call = b.call(`$.bind_ended`, context.state.node, setter);
				break;
			case 'readyState':
				call = b.call(`$.bind_ready_state`, context.state.node, setter);
				break;

			// dimensions
			case 'contentRect':
			case 'contentBoxSize':
			case 'borderBoxSize':
			case 'devicePixelContentBoxSize':
				call = b.call('$.bind_resize_observer', context.state.node, b.literal(node.name), setter);
				break;

			case 'clientWidth':
			case 'clientHeight':
			case 'offsetWidth':
			case 'offsetHeight':
				call = b.call('$.bind_element_size', context.state.node, b.literal(node.name), setter);
				break;

			// various
			case 'value': {
				if (parent?.type === 'RegularElement' && parent.name === 'select') {
					call = b.call(`$.bind_select_value`, context.state.node, getter, setter);
				} else {
					call = b.call(`$.bind_value`, context.state.node, getter, setter);
				}
				break;
			}

			case 'files':
				call = b.call(`$.bind_files`, context.state.node, getter, setter);
				break;

			case 'this':
				call = build_bind_this(expression, context.state.node, context);
				break;

			case 'textContent':
			case 'innerHTML':
			case 'innerText':
				call = b.call(
					'$.bind_content_editable',
					b.literal(node.name),
					context.state.node,
					getter,
					setter
				);
				break;

			// checkbox/radio
			case 'checked':
				call = b.call(`$.bind_checked`, context.state.node, getter, setter);
				break;

			case 'focused':
				call = b.call(`$.bind_focused`, context.state.node, setter);
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
								b.stmt(build_attribute_value(value, context).value),
								b.return(/** @type {Expression} */ (context.visit(expression)))
							])
						);
					}
				}

				call = b.call(
					'$.bind_group',
					node.metadata.binding_group_name,
					b.array(indexes),
					context.state.node,
					group_getter,
					setter
				);
				break;
			}

			default:
				throw new Error('unknown binding ' + node.name);
		}
	}

	// Bindings need to happen after attribute updates, therefore after the render effect, and in order with events/actions.
	// bind:this is a special case as it's one-way and could influence the render effect.
	if (node.name === 'this') {
		context.state.init.push(b.stmt(call));
	} else {
		const has_action_directive =
			parent.type === 'RegularElement' && parent.attributes.find((a) => a.type === 'UseDirective');

		context.state.after_update.push(
			b.stmt(has_action_directive ? b.call('$.effect', b.thunk(call)) : call)
		);
	}
}
