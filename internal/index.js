'use strict';

var Component = require('./Component-9c4b98a2.js');
var dev = require('./dev-1537023e.js');

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {import('./private.js').PositionRect} from
 * @param {import('./private.js').AnimationFn} fn
 */
function create_animation(node, from, fn, params) {
	if (!from) return Component.noop;
	const to = node.getBoundingClientRect();
	if (
		from.left === to.left &&
		from.right === to.right &&
		from.top === to.top &&
		from.bottom === to.bottom
	)
		return Component.noop;
	const {
		delay = 0,
		duration = 300,
		easing = Component.identity,
		// @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
		start: start_time = Component.now() + delay,
		// @ts-ignore todo:
		end = start_time + duration,
		tick = Component.noop,
		css
	} = fn(node, { from, to }, params);
	let running = true;
	let started = false;
	let name;
	/** @returns {void} */
	function start() {
		if (css) {
			name = Component.create_rule(node, 0, 1, duration, delay, easing, css);
		}
		if (!delay) {
			started = true;
		}
	}
	/** @returns {void} */
	function stop() {
		if (css) Component.delete_rule(node, name);
		running = false;
	}
	Component.loop((now) => {
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
						Component.group_outros();
						Component.transition_out(block, 1, 1, () => {
							if (info.blocks[i] === block) {
								info.blocks[i] = null;
							}
						});
						Component.check_outros();
					}
				});
			} else {
				info.block.d(1);
			}
			block.c();
			Component.transition_in(block, 1);
			block.m(info.mount(), info.anchor);
			needs_flush = true;
		}
		info.block = block;
		if (info.blocks) info.blocks[index] = block;
		if (needs_flush) {
			Component.flush();
		}
	}
	if (Component.is_promise(promise)) {
		const current_component = Component.get_current_component();
		promise.then(
			(value) => {
				Component.set_current_component(current_component);
				update(info.then, 1, info.value, value);
				Component.set_current_component(null);
			},
			(error) => {
				Component.set_current_component(current_component);
				update(info.catch, 2, info.error, error);
				Component.set_current_component(null);
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
	Component.transition_out(block, 1, 1, () => {
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
		Component.transition_in(block, 1);
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
	Component.run_all(updates);
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
		const parent_component = Component.current_component;
		const $$ = {
			on_destroy,
			context: new Map(context || (parent_component ? parent_component.$$.context : [])),
			// these will be immediately discarded
			on_mount: [],
			before_update: [],
			after_update: [],
			callbacks: Component.blank_object()
		};
		Component.set_current_component({ $$ });
		const html = fn(result, props, bindings, slots);
		Component.set_current_component(parent_component);
		return html;
	}
	return {
		render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
			on_destroy = [];
			const result = { title: '', head: '', css: new Set() };
			const html = $$render(result, props, {}, $$slots, context);
			Component.run_all(on_destroy);
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

exports.HtmlTag = Component.HtmlTag;
exports.HtmlTagHydration = Component.HtmlTagHydration;
exports.ResizeObserverSingleton = Component.ResizeObserverSingleton;
exports.SvelteComponent = Component.SvelteComponent;
Object.defineProperty(exports, 'SvelteElement', {
	enumerable: true,
	get: function () { return Component.SvelteElement; }
});
exports.action_destroyer = Component.action_destroyer;
exports.add_flush_callback = Component.add_flush_callback;
exports.add_iframe_resize_listener = Component.add_iframe_resize_listener;
exports.add_location = Component.add_location;
exports.add_render_callback = Component.add_render_callback;
exports.afterUpdate = Component.afterUpdate;
exports.append = Component.append;
exports.append_empty_stylesheet = Component.append_empty_stylesheet;
exports.append_hydration = Component.append_hydration;
exports.append_styles = Component.append_styles;
exports.assign = Component.assign;
exports.attr = Component.attr;
exports.attribute_to_object = Component.attribute_to_object;
exports.beforeUpdate = Component.beforeUpdate;
exports.bind = Component.bind;
exports.binding_callbacks = Component.binding_callbacks;
exports.blank_object = Component.blank_object;
exports.bubble = Component.bubble;
exports.check_outros = Component.check_outros;
exports.children = Component.children;
exports.claim_comment = Component.claim_comment;
exports.claim_component = Component.claim_component;
exports.claim_element = Component.claim_element;
exports.claim_html_tag = Component.claim_html_tag;
exports.claim_space = Component.claim_space;
exports.claim_svg_element = Component.claim_svg_element;
exports.claim_text = Component.claim_text;
exports.clear_loops = Component.clear_loops;
exports.comment = Component.comment;
exports.component_subscribe = Component.component_subscribe;
exports.compute_rest_props = Component.compute_rest_props;
exports.compute_slots = Component.compute_slots;
exports.construct_svelte_component = Component.construct_svelte_component;
exports.contenteditable_truthy_values = Component.contenteditable_truthy_values;
exports.createEventDispatcher = Component.createEventDispatcher;
exports.create_bidirectional_transition = Component.create_bidirectional_transition;
exports.create_component = Component.create_component;
exports.create_custom_element = Component.create_custom_element;
exports.create_in_transition = Component.create_in_transition;
exports.create_out_transition = Component.create_out_transition;
exports.create_slot = Component.create_slot;
Object.defineProperty(exports, 'current_component', {
	enumerable: true,
	get: function () { return Component.current_component; }
});
exports.custom_event = Component.custom_event;
exports.destroy_component = Component.destroy_component;
exports.destroy_each = Component.destroy_each;
exports.detach = Component.detach;
exports.dirty_components = Component.dirty_components;
exports.element = Component.element;
exports.element_is = Component.element_is;
exports.empty = Component.empty;
exports.end_hydrating = Component.end_hydrating;
exports.exclude_internal_props = Component.exclude_internal_props;
exports.flush = Component.flush;
exports.flush_render_callbacks = Component.flush_render_callbacks;
exports.getAllContexts = Component.getAllContexts;
exports.getContext = Component.getContext;
exports.get_all_dirty_from_scope = Component.get_all_dirty_from_scope;
exports.get_binding_group_value = Component.get_binding_group_value;
exports.get_current_component = Component.get_current_component;
exports.get_custom_elements_slots = Component.get_custom_elements_slots;
exports.get_root_for_style = Component.get_root_for_style;
exports.get_slot_changes = Component.get_slot_changes;
exports.get_store_value = Component.get_store_value;
exports.get_svelte_dataset = Component.get_svelte_dataset;
exports.globals = Component.globals;
exports.group_outros = Component.group_outros;
exports.hasContext = Component.hasContext;
exports.has_prop = Component.has_prop;
exports.head_selector = Component.head_selector;
exports.identity = Component.identity;
exports.init = Component.init;
exports.init_binding_group = Component.init_binding_group;
exports.init_binding_group_dynamic = Component.init_binding_group_dynamic;
exports.insert = Component.insert;
exports.insert_hydration = Component.insert_hydration;
exports.intros = Component.intros;
exports.is_client = Component.is_client;
exports.is_crossorigin = Component.is_crossorigin;
exports.is_empty = Component.is_empty;
exports.is_function = Component.is_function;
exports.is_promise = Component.is_promise;
exports.listen = Component.listen;
exports.loop = Component.loop;
exports.mount_component = Component.mount_component;
exports.noop = Component.noop;
exports.not_equal = Component.not_equal;
Object.defineProperty(exports, 'now', {
	enumerable: true,
	get: function () { return Component.now; }
});
exports.null_to_empty = Component.null_to_empty;
exports.object_without_properties = Component.object_without_properties;
exports.onDestroy = Component.onDestroy;
exports.onMount = Component.onMount;
exports.once = Component.once;
exports.prevent_default = Component.prevent_default;
exports.query_selector_all = Component.query_selector_all;
Object.defineProperty(exports, 'raf', {
	enumerable: true,
	get: function () { return Component.raf; }
});
exports.resize_observer_border_box = Component.resize_observer_border_box;
exports.resize_observer_content_box = Component.resize_observer_content_box;
exports.resize_observer_device_pixel_content_box = Component.resize_observer_device_pixel_content_box;
exports.run = Component.run;
exports.run_all = Component.run_all;
exports.safe_not_equal = Component.safe_not_equal;
exports.schedule_update = Component.schedule_update;
exports.select_multiple_value = Component.select_multiple_value;
exports.select_option = Component.select_option;
exports.select_options = Component.select_options;
exports.select_value = Component.select_value;
exports.self = Component.self;
exports.setContext = Component.setContext;
exports.set_attributes = Component.set_attributes;
exports.set_current_component = Component.set_current_component;
exports.set_custom_element_data = Component.set_custom_element_data;
exports.set_custom_element_data_map = Component.set_custom_element_data_map;
exports.set_data = Component.set_data;
exports.set_data_contenteditable = Component.set_data_contenteditable;
exports.set_data_maybe_contenteditable = Component.set_data_maybe_contenteditable;
exports.set_dynamic_element_data = Component.set_dynamic_element_data;
exports.set_input_type = Component.set_input_type;
exports.set_input_value = Component.set_input_value;
exports.set_now = Component.set_now;
exports.set_raf = Component.set_raf;
exports.set_store_value = Component.set_store_value;
exports.set_style = Component.set_style;
exports.set_svg_attributes = Component.set_svg_attributes;
exports.space = Component.space;
exports.split_css_unit = Component.split_css_unit;
exports.src_url_equal = Component.src_url_equal;
exports.start_hydrating = Component.start_hydrating;
exports.stop_immediate_propagation = Component.stop_immediate_propagation;
exports.stop_propagation = Component.stop_propagation;
exports.subscribe = Component.subscribe;
exports.svg_element = Component.svg_element;
exports.text = Component.text;
exports.tick = Component.tick;
exports.time_ranges_to_array = Component.time_ranges_to_array;
exports.to_number = Component.to_number;
exports.toggle_class = Component.toggle_class;
exports.transition_in = Component.transition_in;
exports.transition_out = Component.transition_out;
exports.trusted = Component.trusted;
exports.update_slot = Component.update_slot;
exports.update_slot_base = Component.update_slot_base;
exports.validate_store = Component.validate_store;
exports.xlink_attr = Component.xlink_attr;
exports.SvelteComponentDev = dev.SvelteComponentDev;
exports.SvelteComponentTyped = dev.SvelteComponentTyped;
exports.append_dev = dev.append_dev;
exports.append_hydration_dev = dev.append_hydration_dev;
exports.attr_dev = dev.attr_dev;
exports.construct_svelte_component_dev = dev.construct_svelte_component_dev;
exports.dataset_dev = dev.dataset_dev;
exports.detach_after_dev = dev.detach_after_dev;
exports.detach_before_dev = dev.detach_before_dev;
exports.detach_between_dev = dev.detach_between_dev;
exports.detach_dev = dev.detach_dev;
exports.dispatch_dev = dev.dispatch_dev;
exports.insert_dev = dev.insert_dev;
exports.insert_hydration_dev = dev.insert_hydration_dev;
exports.is_void = dev.is_void;
exports.listen_dev = dev.listen_dev;
exports.loop_guard = dev.loop_guard;
exports.prop_dev = dev.prop_dev;
exports.set_data_contenteditable_dev = dev.set_data_contenteditable_dev;
exports.set_data_dev = dev.set_data_dev;
exports.set_data_maybe_contenteditable_dev = dev.set_data_maybe_contenteditable_dev;
exports.validate_dynamic_element = dev.validate_dynamic_element;
exports.validate_each_argument = dev.validate_each_argument;
exports.validate_slots = dev.validate_slots;
exports.validate_void_dynamic_element = dev.validate_void_dynamic_element;
exports.add_attribute = add_attribute;
exports.add_classes = add_classes;
exports.add_styles = add_styles;
exports.add_transform = add_transform;
exports.create_animation = create_animation;
exports.create_ssr_component = create_ssr_component;
exports.debug = debug;
exports.destroy_block = destroy_block;
exports.each = each;
exports.escape = escape;
exports.escape_attribute_value = escape_attribute_value;
exports.escape_object = escape_object;
exports.fix_and_destroy_block = fix_and_destroy_block;
exports.fix_and_outro_and_destroy_block = fix_and_outro_and_destroy_block;
exports.fix_position = fix_position;
exports.get_spread_object = get_spread_object;
exports.get_spread_update = get_spread_update;
exports.handle_promise = handle_promise;
exports.invalid_attribute_name_character = invalid_attribute_name_character;
exports.merge_ssr_styles = merge_ssr_styles;
exports.missing_component = missing_component;
exports.outro_and_destroy_block = outro_and_destroy_block;
exports.spread = spread;
exports.update_await_block_branch = update_await_block_branch;
exports.update_keyed_each = update_keyed_each;
exports.validate_component = validate_component;
exports.validate_each_keys = validate_each_keys;
