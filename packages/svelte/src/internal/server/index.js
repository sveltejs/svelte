/** @import { ComponentType, SvelteComponent } from 'svelte' */
/** @import { Component, RenderOutput } from '#server' */
/** @import { Store } from '#shared' */
export { FILENAME, HMR } from '../../constants.js';
import { attr, clsx, to_class, to_style } from '../shared/attributes.js';
import { is_promise, noop } from '../shared/utils.js';
import { subscribe_to_store } from '../../store/utils.js';
import {
	UNINITIALIZED,
	ELEMENT_PRESERVE_ATTRIBUTE_CASE,
	ELEMENT_IS_NAMESPACED
} from '../../constants.js';
import { escape_html } from '../../escaping.js';
import { DEV } from 'esm-env';
import { current_component, pop, push } from './context.js';
import { EMPTY_COMMENT, BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE } from './hydration.js';
import { validate_store } from '../shared/validate.js';
import { is_boolean_attribute, is_raw_text_element, is_void } from '../../utils.js';
import { reset_elements } from './dev.js';
import { Payload } from './payload.js';

// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter
const INVALID_ATTR_NAME_CHAR_REGEX =
	/[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;

/**
 * @param {Payload} payload
 * @param {string} tag
 * @param {() => void} attributes_fn
 * @param {() => void} children_fn
 * @returns {void}
 */
export function element(payload, tag, attributes_fn = noop, children_fn = noop) {
	payload.out += '<!---->';

	if (tag) {
		payload.out += `<${tag}`;
		attributes_fn();
		payload.out += `>`;

		if (!is_void(tag)) {
			children_fn();
			if (!is_raw_text_element(tag)) {
				payload.out += EMPTY_COMMENT;
			}
			payload.out += `</${tag}>`;
		}
	}

	payload.out += '<!---->';
}

/**
 * Array of `onDestroy` callbacks that should be called at the end of the server render function
 * @type {Function[]}
 */
export let on_destroy = [];

/**
 * Only available on the server and when compiling with the `server` option.
 * Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
 * @template {Record<string, any>} Props
 * @param {import('svelte').Component<Props> | ComponentType<SvelteComponent<Props>>} component
 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} [options]
 * @returns {RenderOutput}
 */
export function render(component, options = {}) {
	const payload = new Payload(options.idPrefix ? options.idPrefix + '-' : '');

	const prev_on_destroy = on_destroy;
	on_destroy = [];
	payload.out += BLOCK_OPEN;

	let reset_reset_element;

	if (DEV) {
		// prevent parent/child element state being corrupted by a bad render
		reset_reset_element = reset_elements();
	}

	if (options.context) {
		push();
		/** @type {Component} */ (current_component).c = options.context;
	}

	// @ts-expect-error
	component(payload, options.props ?? {}, {}, {});

	if (options.context) {
		pop();
	}

	if (reset_reset_element) {
		reset_reset_element();
	}

	payload.out += BLOCK_CLOSE;
	for (const cleanup of on_destroy) cleanup();
	on_destroy = prev_on_destroy;

	let head = payload.head.out + payload.head.title;

	for (const { hash, code } of payload.css) {
		head += `<style id="${hash}">${code}</style>`;
	}

	return {
		head,
		html: payload.out,
		body: payload.out
	};
}

/**
 * @param {Payload} payload
 * @param {(head_payload: Payload['head']) => void} fn
 * @returns {void}
 */
export function head(payload, fn) {
	const head_payload = payload.head;
	head_payload.out += BLOCK_OPEN;
	fn(head_payload);
	head_payload.out += BLOCK_CLOSE;
}

/**
 * @param {Payload} payload
 * @param {boolean} is_html
 * @param {Record<string, string>} props
 * @param {() => void} component
 * @param {boolean} dynamic
 * @returns {void}
 */
export function css_props(payload, is_html, props, component, dynamic = false) {
	const styles = style_object_to_string(props);

	if (is_html) {
		payload.out += `<svelte-css-wrapper style="display: contents; ${styles}">`;
	} else {
		payload.out += `<g style="${styles}">`;
	}

	if (dynamic) {
		payload.out += '<!---->';
	}

	component();

	if (is_html) {
		payload.out += `<!----></svelte-css-wrapper>`;
	} else {
		payload.out += `<!----></g>`;
	}
}

/**
 * @param {Record<string, unknown>} attrs
 * @param {string | null} css_hash
 * @param {Record<string, boolean>} [classes]
 * @param {Record<string, string>} [styles]
 * @param {number} [flags]
 * @returns {string}
 */
export function spread_attributes(attrs, css_hash, classes, styles, flags = 0) {
	if (styles) {
		attrs.style = to_style(attrs.style, styles);
	}

	if (attrs.class) {
		attrs.class = clsx(attrs.class);
	}

	if (css_hash || classes) {
		attrs.class = to_class(attrs.class, css_hash, classes);
	}

	let attr_str = '';
	let name;

	const is_html = (flags & ELEMENT_IS_NAMESPACED) === 0;
	const lowercase = (flags & ELEMENT_PRESERVE_ATTRIBUTE_CASE) === 0;

	for (name in attrs) {
		// omit functions, internal svelte properties and invalid attribute names
		if (typeof attrs[name] === 'function') continue;
		if (name[0] === '$' && name[1] === '$') continue; // faster than name.startsWith('$$')
		if (INVALID_ATTR_NAME_CHAR_REGEX.test(name)) continue;

		var value = attrs[name];

		if (lowercase) {
			name = name.toLowerCase();
		}

		attr_str += attr(name, value, is_html && is_boolean_attribute(name));
	}

	return attr_str;
}

/**
 * @param {Record<string, unknown>[]} props
 * @returns {Record<string, unknown>}
 */
export function spread_props(props) {
	/** @type {Record<string, unknown>} */
	const merged_props = {};
	let key;

	for (let i = 0; i < props.length; i++) {
		const obj = props[i];
		for (key in obj) {
			const desc = Object.getOwnPropertyDescriptor(obj, key);
			if (desc) {
				Object.defineProperty(merged_props, key, desc);
			} else {
				merged_props[key] = obj[key];
			}
		}
	}
	return merged_props;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function stringify(value) {
	return typeof value === 'string' ? value : value == null ? '' : value + '';
}

/** @param {Record<string, string>} style_object */
function style_object_to_string(style_object) {
	return Object.keys(style_object)
		.filter(/** @param {any} key */ (key) => style_object[key] != null && style_object[key] !== '')
		.map(/** @param {any} key */ (key) => `${key}: ${escape_html(style_object[key], true)};`)
		.join(' ');
}

/**
 * @param {any} value
 * @param {string | undefined} [hash]
 * @param {Record<string, boolean>} [directives]
 */
export function attr_class(value, hash, directives) {
	var result = to_class(value, hash, directives);
	return result ? ` class="${escape_html(result, true)}"` : '';
}

/**
 * @param {any} value
 * @param {Record<string,any>|[Record<string,any>,Record<string,any>]} [directives]
 */
export function attr_style(value, directives) {
	var result = to_style(value, directives);
	return result ? ` style="${escape_html(result, true)}"` : '';
}

/**
 * @template V
 * @param {Record<string, [any, any, any]>} store_values
 * @param {string} store_name
 * @param {Store<V> | null | undefined} store
 * @returns {V}
 */
export function store_get(store_values, store_name, store) {
	if (DEV) {
		validate_store(store, store_name.slice(1));
	}

	// it could be that someone eagerly updates the store in the instance script, so
	// we should only reuse the store value in the template
	if (store_name in store_values && store_values[store_name][0] === store) {
		return store_values[store_name][2];
	}

	store_values[store_name]?.[1](); // if store was switched, unsubscribe from old store
	store_values[store_name] = [store, null, undefined];
	const unsub = subscribe_to_store(
		store,
		/** @param {any} v */ (v) => (store_values[store_name][2] = v)
	);
	store_values[store_name][1] = unsub;
	return store_values[store_name][2];
}

/**
 * Sets the new value of a store and returns that value.
 * @template V
 * @param {Store<V>} store
 * @param {V} value
 * @returns {V}
 */
export function store_set(store, value) {
	store.set(value);
	return value;
}

/**
 * Updates a store with a new value.
 * @template V
 * @param {Record<string, [any, any, any]>} store_values
 * @param {string} store_name
 * @param {Store<V>} store
 * @param {any} expression
 */
export function store_mutate(store_values, store_name, store, expression) {
	store_set(store, store_get(store_values, store_name, store));
	return expression;
}

/**
 * @param {Record<string, [any, any, any]>} store_values
 * @param {string} store_name
 * @param {Store<number>} store
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update_store(store_values, store_name, store, d = 1) {
	let store_value = store_get(store_values, store_name, store);
	store.set(store_value + d);
	return store_value;
}

/**
 * @param {Record<string, [any, any, any]>} store_values
 * @param {string} store_name
 * @param {Store<number>} store
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update_store_pre(store_values, store_name, store, d = 1) {
	const value = store_get(store_values, store_name, store) + d;
	store.set(value);
	return value;
}

/** @param {Record<string, [any, any, any]>} store_values */
export function unsubscribe_stores(store_values) {
	for (const store_name in store_values) {
		store_values[store_name][1]();
	}
}

/**
 * @param {Payload} payload
 * @param {Record<string, any>} $$props
 * @param {string} name
 * @param {Record<string, unknown>} slot_props
 * @param {null | (() => void)} fallback_fn
 * @returns {void}
 */
export function slot(payload, $$props, name, slot_props, fallback_fn) {
	var slot_fn = $$props.$$slots?.[name];
	// Interop: Can use snippets to fill slots
	if (slot_fn === true) {
		slot_fn = $$props[name === 'default' ? 'children' : name];
	}

	if (slot_fn !== undefined) {
		slot_fn(payload, slot_props);
	} else {
		fallback_fn?.();
	}
}

/**
 * @param {Record<string, unknown>} props
 * @param {string[]} rest
 * @returns {Record<string, unknown>}
 */
export function rest_props(props, rest) {
	/** @type {Record<string, unknown>} */
	const rest_props = {};
	let key;
	for (key in props) {
		if (!rest.includes(key)) {
			rest_props[key] = props[key];
		}
	}
	return rest_props;
}

/**
 * @param {Record<string, unknown>} props
 * @returns {Record<string, unknown>}
 */
export function sanitize_props(props) {
	const { children, $$slots, ...sanitized } = props;
	return sanitized;
}

/**
 * @param {Record<string, any>} props
 * @returns {Record<string, boolean>}
 */
export function sanitize_slots(props) {
	/** @type {Record<string, boolean>} */
	const sanitized = {};
	if (props.children) sanitized.default = true;
	for (const key in props.$$slots) {
		sanitized[key] = true;
	}
	return sanitized;
}

/**
 * Legacy mode: If the prop has a fallback and is bound in the
 * parent component, propagate the fallback value upwards.
 * @param {Record<string, unknown>} props_parent
 * @param {Record<string, unknown>} props_now
 */
export function bind_props(props_parent, props_now) {
	for (const key in props_now) {
		const initial_value = props_parent[key];
		const value = props_now[key];
		if (
			initial_value === undefined &&
			value !== undefined &&
			Object.getOwnPropertyDescriptor(props_parent, key)?.set
		) {
			props_parent[key] = value;
		}
	}
}

/**
 * @template V
 * @param {Payload} payload
 * @param {Promise<V>} promise
 * @param {null | (() => void)} pending_fn
 * @param {(value: V) => void} then_fn
 * @returns {void}
 */
function await_block(payload, promise, pending_fn, then_fn) {
	if (is_promise(promise)) {
		payload.out += BLOCK_OPEN;
		promise.then(null, noop);
		if (pending_fn !== null) {
			pending_fn();
		}
	} else if (then_fn !== null) {
		payload.out += BLOCK_OPEN_ELSE;
		then_fn(promise);
	}
}

export { await_block as await };

/** @param {any} array_like_or_iterator */
export function ensure_array_like(array_like_or_iterator) {
	if (array_like_or_iterator) {
		return array_like_or_iterator.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}
	return [];
}

/**
 * @param {any[]} args
 * @param {Function} [inspect]
 */
// eslint-disable-next-line no-console
export function inspect(args, inspect = console.log) {
	inspect('init', ...args);
}

/**
 * @template V
 * @param {() => V} get_value
 */
export function once(get_value) {
	let value = /** @type {V} */ (UNINITIALIZED);
	return () => {
		if (value === UNINITIALIZED) {
			value = get_value();
		}
		return value;
	};
}

/**
 * Create an unique ID
 * @param {Payload} payload
 * @returns {string}
 */
export function props_id(payload) {
	const uid = payload.uid();
	payload.out += '<!--#' + uid + '-->';
	return uid;
}

export { attr, clsx };

export { html } from './blocks/html.js';

export { push, pop } from './context.js';

export { push_element, pop_element, validate_snippet_args } from './dev.js';

export { assign_payload, copy_payload } from './payload.js';

export { snapshot } from '../shared/clone.js';

export { fallback, to_array } from '../shared/utils.js';

export {
	invalid_default_snippet,
	validate_dynamic_element_tag,
	validate_void_dynamic_element,
	prevent_snippet_stringification
} from '../shared/validate.js';

export { escape_html as escape };

/**
 * @template T
 * @param {()=>T} fn
 * @returns {(new_value?: T) => (T | void)}
 */
export function derived(fn) {
	const get_value = once(fn);
	/**
	 * @type {T | undefined}
	 */
	let updated_value;

	return function (new_value) {
		if (arguments.length === 0) {
			return updated_value ?? get_value();
		}
		updated_value = new_value;
		return updated_value;
	};
}

/**
 *
 * @param {Payload} payload
 * @param {*} value
 */
export function maybe_selected(payload, value) {
	return value === payload.select_value ? ' selected' : '';
}

/**
 * @param {Payload} payload
 * @param {() => void} children
 * @returns {void}
 */
export function valueless_option(payload, children) {
	var i = payload.out.length;

	children();

	var body = payload.out.slice(i);

	if (body.replace(/<!---->/g, '') === payload.select_value) {
		// replace '>' with ' selected>' (closing tag will be added later)
		payload.out = payload.out.slice(0, i - 1) + ' selected>' + body;
	}
}
