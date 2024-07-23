/** @import { Component, Payload, RenderOutput } from '#server' */
/** @import { Store } from '#shared' */
export { FILENAME, HMR } from '../../constants.js';
import { is_promise, noop } from '../shared/utils.js';
import { subscribe_to_store } from '../../store/utils.js';
import {
	UNINITIALIZED,
	DOMBooleanAttributes,
	RawTextElements,
	ELEMENT_PRESERVE_ATTRIBUTE_CASE,
	ELEMENT_IS_NAMESPACED
} from '../../constants.js';
import { escape_html } from '../../escaping.js';
import { DEV } from 'esm-env';
import { current_component, pop, push } from './context.js';
import { EMPTY_COMMENT, BLOCK_CLOSE, BLOCK_OPEN } from './hydration.js';
import { validate_store } from '../shared/validate.js';

// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter
const INVALID_ATTR_NAME_CHAR_REGEX =
	/[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;

export const VoidElements = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'menuitem',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
]);

/**
 * @param {Payload} to_copy
 * @returns {Payload}
 */
export function copy_payload({ out, css, head }) {
	return {
		out,
		css: new Set(css),
		head: {
			title: head.title,
			out: head.out
		}
	};
}

/**
 * Assigns second payload to first
 * @param {Payload} p1
 * @param {Payload} p2
 * @returns {void}
 */
export function assign_payload(p1, p2) {
	p1.out = p2.out;
	p1.head = p2.head;
}

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
		payload.out += `<${tag} `;
		attributes_fn();
		payload.out += `>`;

		if (!VoidElements.has(tag)) {
			children_fn();
			if (!RawTextElements.includes(tag)) {
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
 * @param {import('svelte').Component<Props> | import('svelte').ComponentType<import('svelte').SvelteComponent<Props>>} component
 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any> }} [options]
 * @returns {RenderOutput}
 */
export function render(component, options = {}) {
	/** @type {Payload} */
	const payload = { out: '', css: new Set(), head: { title: '', out: '' } };

	const prev_on_destroy = on_destroy;
	on_destroy = [];
	payload.out += BLOCK_OPEN;

	if (options.context) {
		push();
		/** @type {Component} */ (current_component).c = options.context;
	}

	// @ts-expect-error
	component(payload, options.props ?? {}, {}, {});

	if (options.context) {
		pop();
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
 * @template V
 * @param {string} name
 * @param {V} value
 * @param {boolean} [is_boolean]
 * @returns {string}
 */
export function attr(name, value, is_boolean = false) {
	if (value == null || (!value && is_boolean) || (value === '' && name === 'class')) return '';
	const assignment = is_boolean ? '' : `="${escape_html(value, true)}"`;
	return ` ${name}${assignment}`;
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
		payload.out += `<div style="display: contents; ${styles}">`;
	} else {
		payload.out += `<g style="${styles}">`;
	}

	if (dynamic) {
		payload.out += '<!---->';
	}

	component();

	if (is_html) {
		payload.out += `<!----></div>`;
	} else {
		payload.out += `<!----></g>`;
	}
}

/**
 * @param {Record<string, unknown>} attrs
 * @param {Record<string, string>} [classes]
 * @param {Record<string, string>} [styles]
 * @param {number} [flags]
 * @returns {string}
 */
export function spread_attributes(attrs, classes, styles, flags = 0) {
	if (styles) {
		attrs.style = attrs.style
			? style_object_to_string(merge_styles(/** @type {string} */ (attrs.style), styles))
			: style_object_to_string(styles);
	}

	if (classes) {
		const classlist = attrs.class ? [attrs.class] : [];

		for (const key in classes) {
			if (classes[key]) {
				classlist.push(key);
			}
		}

		attrs.class = classlist.join(' ');
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

		if (lowercase) {
			name = name.toLowerCase();
		}

		const is_boolean = is_html && DOMBooleanAttributes.includes(name);
		attr_str += attr(name, attrs[name], is_boolean);
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
			merged_props[key] = obj[key];
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

/** @param {Record<string, string>} style_object */
export function add_styles(style_object) {
	const styles = style_object_to_string(style_object);
	return styles ? ` style="${styles}"` : '';
}

/**
 * @param {string} attribute
 * @param {Record<string, string>} styles
 */
export function merge_styles(attribute, styles) {
	/** @type {Record<string, string>} */
	var merged = {};

	if (attribute) {
		for (var declaration of attribute.split(';')) {
			var i = declaration.indexOf(':');
			var name = declaration.slice(0, i).trim();
			var value = declaration.slice(i + 1).trim();

			if (name !== '') merged[name] = value;
		}
	}

	for (name in styles) {
		merged[name] = styles[name];
	}

	return merged;
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
export function mutate_store(store_values, store_name, store, expression) {
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
 * @template V
 * @param {V} value
 * @param {() => V} fallback lazy because could contain side effects
 * @returns {V}
 */
export function value_or_fallback(value, fallback) {
	return value === undefined ? fallback() : value;
}

/**
 * @template V
 * @param {V} value
 * @param {() => Promise<V>} fallback lazy because could contain side effects
 * @returns {Promise<V>}
 */
export async function value_or_fallback_async(value, fallback) {
	return value === undefined ? fallback() : value;
}

/**
 * @param {Payload} payload
 * @param {void | ((payload: Payload, props: Record<string, unknown>) => void)} slot_fn
 * @param {Record<string, unknown>} slot_props
 * @param {null | (() => void)} fallback_fn
 * @returns {void}
 */
export function slot(payload, slot_fn, slot_props, fallback_fn) {
	if (slot_fn === undefined) {
		if (fallback_fn !== null) {
			fallback_fn();
		}
	} else {
		slot_fn(payload, slot_props);
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
 * @param {Promise<V>} promise
 * @param {null | (() => void)} pending_fn
 * @param {(value: V) => void} then_fn
 * @returns {void}
 */
function await_block(promise, pending_fn, then_fn) {
	if (is_promise(promise)) {
		promise.then(null, noop);
		if (pending_fn !== null) {
			pending_fn();
		}
	} else if (then_fn !== null) {
		then_fn(promise);
	}
}

export { await_block as await };

/** @param {any} array_like_or_iterator */
export function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
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

export { html } from './blocks/html.js';

export { push, pop } from './context.js';

export { push_element, pop_element } from './dev.js';

export { snapshot } from '../shared/clone.js';

export {
	add_snippet_symbol,
	invalid_default_snippet,
	validate_component,
	validate_dynamic_element_tag,
	validate_snippet,
	validate_void_dynamic_element
} from '../shared/validate.js';

export { escape_html as escape };

export { default_slot } from '../client/dom/legacy/misc.js';
