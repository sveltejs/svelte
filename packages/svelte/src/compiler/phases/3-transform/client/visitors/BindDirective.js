/** @import { CallExpression, Expression, Pattern } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import { is_text_attribute } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { binding_properties } from '../../../bindings.js';
import { build_attribute_value } from './shared/element.js';
import { build_bind_this, validate_binding } from './shared/utils.js';

/**
 * @param {AST.BindDirective} node
 * @param {ComponentContext} context
 */
export function BindDirective(node, context) {
	const expression = /** @type {Expression} */ (context.visit(node.expression));
	const property = binding_properties[node.name];

	const parent = /** @type {AST.SvelteNode} */ (context.path.at(-1));

	let get, set;

	if (expression.type === 'SequenceExpression') {
		[get, set] = expression.expressions;
	} else {
		if (
			dev &&
			context.state.analysis.runes &&
			expression.type === 'MemberExpression' &&
			(node.name !== 'this' ||
				context.path.some(
					({ type }) =>
						type === 'IfBlock' ||
						type === 'EachBlock' ||
						type === 'AwaitBlock' ||
						type === 'KeyBlock'
				)) &&
			!is_ignored(node, 'binding_property_non_reactive')
		) {
			validate_binding(context.state, node, expression);
		}

		get = b.thunk(expression);

		/** @type {Expression | undefined} */
		set = b.unthunk(
			b.arrow(
				[b.id('$$value')],
				/** @type {Expression} */ (
					context.visit(
						b.assignment('=', /** @type {Pattern} */ (node.expression), b.id('$$value'))
					)
				)
			)
		);

		if (get === set) {
			set = undefined;
		}
	}

	/** @type {CallExpression} */
	let call;

	if (property?.event) {
		call = b.call(
			'$.bind_property',
			b.literal(node.name),
			b.literal(property.event),
			context.state.node,
			set ?? get,
			property.bidirectional && get
		);
	} else {
		// special cases
		switch (node.name) {
			// window
			case 'online':
				call = b.call(`$.bind_online`, set ?? get);
				break;

			case 'scrollX':
			case 'scrollY':
				call = b.call(
					'$.bind_window_scroll',
					b.literal(node.name === 'scrollX' ? 'x' : 'y'),
					get,
					set
				);
				break;

			case 'innerWidth':
			case 'innerHeight':
			case 'outerWidth':
			case 'outerHeight':
				call = b.call('$.bind_window_size', b.literal(node.name), set ?? get);
				break;

			// document
			case 'activeElement':
				call = b.call('$.bind_active_element', set ?? get);
				break;

			// media
			case 'muted':
				call = b.call(`$.bind_muted`, context.state.node, get, set);
				break;
			case 'paused':
				call = b.call(`$.bind_paused`, context.state.node, get, set);
				break;
			case 'volume':
				call = b.call(`$.bind_volume`, context.state.node, get, set);
				break;
			case 'playbackRate':
				call = b.call(`$.bind_playback_rate`, context.state.node, get, set);
				break;
			case 'currentTime':
				call = b.call(`$.bind_current_time`, context.state.node, get, set);
				break;
			case 'buffered':
				call = b.call(`$.bind_buffered`, context.state.node, set ?? get);
				break;
			case 'played':
				call = b.call(`$.bind_played`, context.state.node, set ?? get);
				break;
			case 'seekable':
				call = b.call(`$.bind_seekable`, context.state.node, set ?? get);
				break;
			case 'seeking':
				call = b.call(`$.bind_seeking`, context.state.node, set ?? get);
				break;
			case 'ended':
				call = b.call(`$.bind_ended`, context.state.node, set ?? get);
				break;
			case 'readyState':
				call = b.call(`$.bind_ready_state`, context.state.node, set ?? get);
				break;

			// dimensions
			case 'contentRect':
			case 'contentBoxSize':
			case 'borderBoxSize':
			case 'devicePixelContentBoxSize':
				call = b.call(
					'$.bind_resize_observer',
					context.state.node,
					b.literal(node.name),
					set ?? get
				);
				break;

			case 'clientWidth':
			case 'clientHeight':
			case 'offsetWidth':
			case 'offsetHeight':
				call = b.call('$.bind_element_size', context.state.node, b.literal(node.name), set ?? get);
				break;

			// various
			case 'value': {
				if (parent?.type === 'RegularElement' && parent.name === 'select') {
					call = b.call(`$.bind_select_value`, context.state.node, get, set);
				} else {
					call = b.call(`$.bind_value`, context.state.node, get, set);
				}
				break;
			}

			case 'files':
				call = b.call(`$.bind_files`, context.state.node, get, set);
				break;

			case 'this':
				call = build_bind_this(node.expression, context.state.node, context);
				break;

			case 'textContent':
			case 'innerHTML':
			case 'innerText':
				call = b.call(
					'$.bind_content_editable',
					b.literal(node.name),
					context.state.node,
					get,
					set
				);
				break;

			// checkbox/radio
			case 'checked':
				call = b.call(`$.bind_checked`, context.state.node, get, set);
				break;

			case 'focused':
				call = b.call(`$.bind_focused`, context.state.node, set ?? get);
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
				let group_getter = get;

				if (parent?.type === 'RegularElement') {
					const value = /** @type {any[]} */ (
						/** @type {AST.Attribute} */ (
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
							b.block([b.stmt(build_attribute_value(value, context).value), b.return(expression)])
						);
					}
				}

				call = b.call(
					'$.bind_group',
					node.metadata.binding_group_name,
					b.array(indexes),
					context.state.node,
					group_getter,
					set ?? get
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
		const has_use =
			parent.type === 'RegularElement' && parent.attributes.find((a) => a.type === 'UseDirective');

		if (has_use) {
			context.state.init.push(b.stmt(b.call('$.effect', b.thunk(call))));
		} else {
			context.state.after_update.push(b.stmt(call));
		}
	}
}
