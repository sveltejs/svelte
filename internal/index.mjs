import { noop, identity, now, loop, create_rule, delete_rule, is_promise, get_current_component, set_current_component, group_outros, transition_out, check_outros, transition_in, flush, run_all, blank_object, current_component } from './Component-cd97939e.mjs';
export { HtmlTag, HtmlTagHydration, ResizeObserverSingleton, SvelteComponent, SvelteElement, action_destroyer, add_flush_callback, add_iframe_resize_listener, add_location, add_render_callback, afterUpdate, append, append_empty_stylesheet, append_hydration, append_styles, assign, attr, attribute_to_object, beforeUpdate, bind, binding_callbacks, bubble, children, claim_comment, claim_component, claim_element, claim_html_tag, claim_space, claim_svg_element, claim_text, clear_loops, comment, component_subscribe, compute_rest_props, compute_slots, construct_svelte_component, contenteditable_truthy_values, createEventDispatcher, create_bidirectional_transition, create_component, create_custom_element, create_in_transition, create_out_transition, create_slot, custom_event, destroy_component, destroy_each, detach, dirty_components, element, element_is, empty, end_hydrating, exclude_internal_props, flush_render_callbacks, getAllContexts, getContext, get_all_dirty_from_scope, get_binding_group_value, get_custom_elements_slots, get_root_for_style, get_slot_changes, get_store_value, get_svelte_dataset, globals, hasContext, has_prop, head_selector, init, init_binding_group, init_binding_group_dynamic, insert, insert_hydration, intros, is_client, is_crossorigin, is_empty, is_function, listen, mount_component, not_equal, null_to_empty, object_without_properties, onDestroy, onMount, once, prevent_default, query_selector_all, raf, resize_observer_border_box, resize_observer_content_box, resize_observer_device_pixel_content_box, run, safe_not_equal, schedule_update, select_multiple_value, select_option, select_options, select_value, self, setContext, set_attributes, set_custom_element_data, set_custom_element_data_map, set_data, set_data_contenteditable, set_data_maybe_contenteditable, set_dynamic_element_data, set_input_type, set_input_value, set_now, set_raf, set_store_value, set_style, set_svg_attributes, space, split_css_unit, src_url_equal, start_hydrating, stop_immediate_propagation, stop_propagation, subscribe, svg_element, text, tick, time_ranges_to_array, to_number, toggle_class, trusted, update_slot, update_slot_base, validate_store, xlink_attr } from './Component-cd97939e.mjs';
export { SvelteComponentDev, SvelteComponentTyped, append_dev, append_hydration_dev, attr_dev, construct_svelte_component_dev, dataset_dev, detach_after_dev, detach_before_dev, detach_between_dev, detach_dev, dispatch_dev, insert_dev, insert_hydration_dev, is_void, listen_dev, loop_guard, prop_dev, set_data_contenteditable_dev, set_data_dev, set_data_maybe_contenteditable_dev, validate_dynamic_element, validate_each_argument, validate_slots, validate_void_dynamic_element } from './dev-89102382.mjs';

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {import('./private.js').PositionRect} from
 * @param {import('./private.js').AnimationFn} fn
 */
function create_animation(node, from, fn, params) {
	if (!from) return noop;
	const to = node.getBoundingClientRect();
	if (
		from.left === to.left &&
		from.right === to.right &&
		from.top === to.top &&
		from.bottom === to.bottom
	)
		return noop;
	const {
		delay = 0,
		duration = 300,
		easing = identity,
		// @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
		start: start_time = now() + delay,
		// @ts-ignore todo:
		end = start_time + duration,
		tick = noop,
		css
	} = fn(node, { from, to }, params);
	let running = true;
	let started = false;
	let name;
	/** @returns {void} */
	function start() {
		if (css) {
			name = create_rule(node, 0, 1, duration, delay, easing, css);
		}
		if (!delay) {
			started = true;
		}
	}
	/** @returns {void} */
	function stop() {
		if (css) delete_rule(node, name);
		running = false;
	}
	loop((now) => {
		if (!started && now >= start_time) {
			started = true;
		}
		if (started && now >= end) {
			tick(1, 0);
			stop();
		}
		if (!running) {
			return false;
		}
		if (started) {
			const p = now - start_time;
			const t = 0 + 1 * easing(p / duration);
			tick(t, 1 - t);
		}
		return true;
	});
	start();
	tick(0, 1);
	return stop;
}

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @returns {void}
 */
function fix_position(node) {
	const style = getComputedStyle(node);
	if (style.position !== 'absolute' && style.position !== 'fixed') {
		const { width, height } = style;
		const a = node.getBoundingClientRect();
		node.style.position = 'absolute';
		node.style.width = width;
		node.style.height = height;
		add_transform(node, a);
	}
}

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {import('./private.js').PositionRect} a
 * @returns {void}
 */
function add_transform(node, a) {
	const b = node.getBoundingClientRect();
	if (a.left !== b.left || a.top !== b.top) {
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;
		node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
	}
}

/**
 * @template T
 * @param {Promise<T>} promise
 * @param {import('./private.js').PromiseInfo<T>} info
 * @returns {boolean}
 */
function handle_promise(promise, info) {
	const token = (info.token = {});
	/**
	 * @param {import('./private.js').FragmentFactory} type
	 * @param {0 | 1 | 2} index
	 * @param {number} [key]
	 * @param {any} [value]
	 * @returns {void}
	 */
	function update(type, index, key, value) {
		if (info.token !== token) return;
		info.resolved = value;
		let child_ctx = info.ctx;
		if (key !== undefined) {
			child_ctx = child_ctx.slice();
			child_ctx[key] = value;
		}
		const block = type && (info.current = type)(child_ctx);
		let needs_flush = false;
		if (info.block) {
			if (info.blocks) {
				info.blocks.forEach((block, i) => {
					if (i !== index && block) {
						group_outros();
						transition_out(block, 1, 1, () => {
							if (info.blocks[i] === block) {
								info.blocks[i] = null;
							}
						});
						check_outros();
					}
				});
			} else {
				info.block.d(1);
			}
			block.c();
			transition_in(block, 1);
			block.m(info.mount(), info.anchor);
			needs_flush = true;
		}
		info.block = block;
		if (info.blocks) info.blocks[index] = block;
		if (needs_flush) {
			flush();
		}
	}
	if (is_promise(promise)) {
		const current_component = get_current_component();
		promise.then(
			(value) => {
				set_current_component(current_component);
				update(info.then, 1, info.value, value);
				set_current_component(null);
			},
			(error) => {
				set_current_component(current_component);
				update(info.catch, 2, info.error, error);
				set_current_component(null);
				if (!info.hasCatch) {
					throw error;
				}
			}
		);
		// if we previously had a then/catch block, destroy it
		if (info.current !== info.pending) {
			update(info.pending, 0);
			return true;
		}
	} else {
		if (info.current !== info.then) {
			update(info.then, 1, info.value, promise);
			return true;
		}
		info.resolved = /** @type {T} */ (promise);
	}
}

/** @returns {void} */
function update_await_block_branch(info, ctx, dirty) {
	const child_ctx = ctx.slice();
	const { resolved } = info;
	if (info.current === info.then) {
		child_ctx[info.value] = resolved;
	}
	if (info.current === info.catch) {
		child_ctx[info.error] = resolved;
	}
	info.block.p(child_ctx, dirty);
}

/** @returns {void} */
function destroy_block(block, lookup) {
	block.d(1);
	lookup.delete(block.key);
}

/** @returns {void} */
function outro_and_destroy_block(block, lookup) {
	transition_out(block, 1, 1, () => {
		lookup.delete(block.key);
	});
}

/** @returns {void} */
function fix_and_destroy_block(block, lookup) {
	block.f();
	destroy_block(block, lookup);
}

/** @returns {void} */
function fix_and_outro_and_destroy_block(block, lookup) {
	block.f();
	outro_and_destroy_block(block, lookup);
}

/** @returns {any[]} */
function update_keyed_each(
	old_blocks,
	dirty,
	get_key,
	dynamic,
	ctx,
	list,
	lookup,
	node,
	destroy,
	create_each_block,
	next,
	get_context
) {
	let o = old_blocks.length;
	let n = list.length;
	let i = o;
	const old_indexes = {};
	while (i--) old_indexes[old_blocks[i].key] = i;
	const new_blocks = [];
	const new_lookup = new Map();
	const deltas = new Map();
	const updates = [];
	i = n;
	while (i--) {
		const child_ctx = get_context(ctx, list, i);
		const key = get_key(child_ctx);
		let block = lookup.get(key);
		if (!block) {
			block = create_each_block(key, child_ctx);
			block.c();
		} else if (dynamic) {
			// defer updates until all the DOM shuffling is done
			updates.push(() => block.p(child_ctx, dirty));
		}
		new_lookup.set(key, (new_blocks[i] = block));
		if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
	}
	const will_move = new Set();
	const did_move = new Set();
	/** @returns {void} */
	function insert(block) {
		transition_in(block, 1);
		block.m(node, next);
		lookup.set(block.key, block);
		next = block.first;
		n--;
	}
	while (o && n) {
		const new_block = new_blocks[n - 1];
		const old_block = old_blocks[o - 1];
		const new_key = new_block.key;
		const old_key = old_block.key;
		if (new_block === old_block) {
			// do nothing
			next = new_block.first;
			o--;
			n--;
		} else if (!new_lookup.has(old_key)) {
			// remove old block
			destroy(old_block, lookup);
			o--;
		} else if (!lookup.has(new_key) || will_move.has(new_key)) {
			insert(new_block);
		} else if (did_move.has(old_key)) {
			o--;
		} else if (deltas.get(new_key) > deltas.get(old_key)) {
			did_move.add(new_key);
			insert(new_block);
		} else {
			will_move.add(old_key);
			o--;
		}
	}
	while (o--) {
		const old_block = old_blocks[o];
		if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
	}
	while (n) insert(new_blocks[n - 1]);
	run_all(updates);
	return new_blocks;
}

/** @returns {void} */
function validate_each_keys(ctx, list, get_context, get_key) {
	const keys = new Map();
	for (let i = 0; i < list.length; i++) {
		const key = get_key(get_context(ctx, list, i));
		if (keys.has(key)) {
			let value = '';
			try {
				value = `with value '${String(key)}' `;
			} catch (e) {
				// can't stringify
			}
			throw new Error(
				`Cannot have duplicate keys in a keyed each: Keys at index ${keys.get(
					key
				)} and ${i} ${value}are duplicates`
			);
		}
		keys.set(key, i);
	}
}

/** @returns {{}} */
function get_spread_update(levels, updates) {
	const update = {};
	const to_null_out = {};
	const accounted_for = { $$scope: 1 };
	let i = levels.length;
	while (i--) {
		const o = levels[i];
		const n = updates[i];
		if (n) {
			for (const key in o) {
				if (!(key in n)) to_null_out[key] = 1;
			}
			for (const key in n) {
				if (!accounted_for[key]) {
					update[key] = n[key];
					accounted_for[key] = 1;
				}
			}
			levels[i] = n;
		} else {
			for (const key in o) {
				accounted_for[key] = 1;
			}
		}
	}
	for (const key in to_null_out) {
		if (!(key in update)) update[key] = undefined;
	}
	return update;
}

function get_spread_object(spread_props) {
	return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

const _boolean_attributes = /** @type {const} */ ([
	'allowfullscreen',
	'allowpaymentrequest',
	'async',
	'autofocus',
	'autoplay',
	'checked',
	'controls',
	'default',
	'defer',
	'disabled',
	'formnovalidate',
	'hidden',
	'inert',
	'ismap',
	'loop',
	'multiple',
	'muted',
	'nomodule',
	'novalidate',
	'open',
	'playsinline',
	'readonly',
	'required',
	'reversed',
	'selected'
]);

/**
 * List of HTML boolean attributes (e.g. `<input disabled>`).
 * Source: https://html.spec.whatwg.org/multipage/indices.html
 *
 * @type {Set<string>}
 */
const boolean_attributes = new Set([..._boolean_attributes]);

/** @typedef {typeof _boolean_attributes[number]} BooleanAttributes */

const invalid_attribute_name_character =
	/[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter

/** @returns {string} */
function spread(args, attrs_to_add) {
	const attributes = Object.assign({}, ...args);
	if (attrs_to_add) {
		const classes_to_add = attrs_to_add.classes;
		const styles_to_add = attrs_to_add.styles;
		if (classes_to_add) {
			if (attributes.class == null) {
				attributes.class = classes_to_add;
			} else {
				attributes.class += ' ' + classes_to_add;
			}
		}
		if (styles_to_add) {
			if (attributes.style == null) {
				attributes.style = style_object_to_string(styles_to_add);
			} else {
				attributes.style = style_object_to_string(
					merge_ssr_styles(attributes.style, styles_to_add)
				);
			}
		}
	}
	let str = '';
	Object.keys(attributes).forEach((name) => {
		if (invalid_attribute_name_character.test(name)) return;
		const value = attributes[name];
		if (value === true) str += ' ' + name;
		else if (boolean_attributes.has(name.toLowerCase())) {
			if (value) str += ' ' + name;
		} else if (value != null) {
			str += ` ${name}="${value}"`;
		}
	});
	return str;
}

/** @returns {{}} */
function merge_ssr_styles(style_attribute, style_directive) {
	const style_object = {};
	for (const individual_style of style_attribute.split(';')) {
		const colon_index = individual_style.indexOf(':');
		const name = individual_style.slice(0, colon_index).trim();
		const value = individual_style.slice(colon_index + 1).trim();
		if (!name) continue;
		style_object[name] = value;
	}
	for (const name in style_directive) {
		const value = style_directive[name];
		if (value) {
			style_object[name] = value;
		} else {
			delete style_object[name];
		}
	}
	return style_object;
}

const ATTR_REGEX = /[&"]/g;
const CONTENT_REGEX = /[&<]/g;

/**
 * Note: this method is performance sensitive and has been optimized
 * https://github.com/sveltejs/svelte/pull/5701
 * @param {unknown} value
 * @returns {string}
 */
function escape(value, is_attr = false) {
	const str = String(value);
	const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
	pattern.lastIndex = 0;
	let escaped = '';
	let last = 0;
	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1;
		const ch = str[i];
		escaped += str.substring(last, i) + (ch === '&' ? '&amp;' : ch === '"' ? '&quot;' : '&lt;');
		last = i + 1;
	}
	return escaped + str.substring(last);
}

function escape_attribute_value(value) {
	// keep booleans, null, and undefined for the sake of `spread`
	const should_escape = typeof value === 'string' || (value && typeof value === 'object');
	return should_escape ? escape(value, true) : value;
}

/** @returns {{}} */
function escape_object(obj) {
	const result = {};
	for (const key in obj) {
		result[key] = escape_attribute_value(obj[key]);
	}
	return result;
}

/** @returns {string} */
function each(items, fn) {
	let str = '';
	for (let i = 0; i < items.length; i += 1) {
		str += fn(items[i], i);
	}
	return str;
}

const missing_component = {
	$$render: () => ''
};

function validate_component(component, name) {
	if (!component || !component.$$render) {
		if (name === 'svelte:component') name += ' this={...}';
		throw new Error(
			`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${name}>.`
		);
	}
	return component;
}

/** @returns {string} */
function debug(file, line, column, values) {
	console.log(`{@debug} ${file ? file + ' ' : ''}(${line}:${column})`); // eslint-disable-line no-console
	console.log(values); // eslint-disable-line no-console
	return '';
}

let on_destroy;

/** @returns {{ render: (props?: {}, { $$slots, context }?: { $$slots?: {}; context?: Map<any, any>; }) => { html: any; css: { code: string; map: any; }; head: string; }; $$render: (result: any, props: any, bindings: any, slots: any, context: any) => any; }} */
function create_ssr_component(fn) {
	function $$render(result, props, bindings, slots, context) {
		const parent_component = current_component;
		const $$ = {
			on_destroy,
			context: new Map(context || (parent_component ? parent_component.$$.context : [])),
			// these will be immediately discarded
			on_mount: [],
			before_update: [],
			after_update: [],
			callbacks: blank_object()
		};
		set_current_component({ $$ });
		const html = fn(result, props, bindings, slots);
		set_current_component(parent_component);
		return html;
	}
	return {
		render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
			on_destroy = [];
			const result = { title: '', head: '', css: new Set() };
			const html = $$render(result, props, {}, $$slots, context);
			run_all(on_destroy);
			return {
				html,
				css: {
					code: Array.from(result.css)
						.map((css) => css.code)
						.join('\n'),
					map: null // TODO
				},
				head: result.title + result.head
			};
		},
		$$render
	};
}

/** @returns {string} */
function add_attribute(name, value, boolean) {
	if (value == null || (boolean && !value)) return '';
	const assignment = boolean && value === true ? '' : `="${escape(value, true)}"`;
	return ` ${name}${assignment}`;
}

/** @returns {string} */
function add_classes(classes) {
	return classes ? ` class="${classes}"` : '';
}

/** @returns {string} */
function style_object_to_string(style_object) {
	return Object.keys(style_object)
		.filter((key) => style_object[key])
		.map((key) => `${key}: ${escape_attribute_value(style_object[key])};`)
		.join(' ');
}

/** @returns {string} */
function add_styles(style_object) {
	const styles = style_object_to_string(style_object);
	return styles ? ` style="${styles}"` : '';
}

export { add_attribute, add_classes, add_styles, add_transform, blank_object, check_outros, create_animation, create_ssr_component, current_component, debug, destroy_block, each, escape, escape_attribute_value, escape_object, fix_and_destroy_block, fix_and_outro_and_destroy_block, fix_position, flush, get_current_component, get_spread_object, get_spread_update, group_outros, handle_promise, identity, invalid_attribute_name_character, is_promise, loop, merge_ssr_styles, missing_component, noop, now, outro_and_destroy_block, run_all, set_current_component, spread, transition_in, transition_out, update_await_block_branch, update_keyed_each, validate_component, validate_each_keys };
