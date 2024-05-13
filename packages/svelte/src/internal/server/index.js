import { is_promise, noop } from '../shared/utils.js';
import { subscribe_to_store } from '../../store/utils.js';
import {
	UNINITIALIZED,
	DOMBooleanAttributes,
	RawTextElements,
	disallowed_paragraph_contents,
	interactive_elements,
	is_tag_valid_with_parent
} from '../../constants.js';
import { escape_html } from '../../escaping.js';
import { DEV } from 'esm-env';
import { current_component, pop, push } from './context.js';
import { BLOCK_CLOSE, BLOCK_OPEN } from './hydration.js';
import { validate_store } from '../shared/validate.js';

/**
 * @typedef {{
 * 	tag: string;
 * 	parent: null | Element;
 * }} Element
 */

/**
 * @typedef {{
 * 	head: string;
 * 	html: string;
 * }} RenderOutput
 */

/**
 * @typedef {{
 * 	out: string;
 * 	anchor: number;
 * 	head: {
 * 		title: string;
 * 		out: string;
 * 		anchor: number;
 * 	};
 * }} Payload
 */

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
 * @type {Element | null}
 */
let current_element = null;

/** @returns {Payload} */
function create_payload() {
	return { out: '', head: { title: '', out: '', anchor: 0 }, anchor: 0 };
}

/**
 * @param {Payload} to_copy
 * @returns {Payload}
 */
export function copy_payload(to_copy) {
	return {
		...to_copy,
		head: { ...to_copy.head }
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
	p1.anchor = p2.anchor;
}

/**
 * @param {Payload} payload
 * @param {string} message
 */
function error_on_client(payload, message) {
	message =
		`Svelte SSR validation error:\n\n${message}\n\n` +
		'Ensure your components render valid HTML as the browser will try to repair invalid HTML, ' +
		'which may result in content being shifted around and will likely result in a hydration mismatch.';
	// eslint-disable-next-line no-console
	console.error(message);
	payload.head.out += `<script>console.error(\`${message}\`)</script>`;
}

/**
 * @param {string} tag
 * @param {Payload} payload
 */
export function push_element(tag, payload) {
	if (current_element !== null && !is_tag_valid_with_parent(tag, current_element.tag)) {
		error_on_client(payload, `<${tag}> is invalid inside <${current_element.tag}>`);
	}
	if (interactive_elements.has(tag)) {
		let element = current_element;
		while (element !== null) {
			if (interactive_elements.has(element.tag)) {
				error_on_client(payload, `<${tag}> is invalid inside <${element.tag}>`);
			}
			element = element.parent;
		}
	}
	if (disallowed_paragraph_contents.includes(tag)) {
		let element = current_element;
		while (element !== null) {
			if (element.tag === 'p') {
				error_on_client(payload, `<${tag}> is invalid inside <p>`);
			}
			element = element.parent;
		}
	}
	current_element = {
		tag,
		parent: current_element
	};
}

export function pop_element() {
	if (current_element !== null) {
		current_element = current_element.parent;
	}
}

/**
 * @param {Payload} payload
 * @param {string} tag
 * @param {() => void} attributes_fn
 * @param {() => void} children_fn
 * @returns {void}
 */
export function element(payload, tag, attributes_fn, children_fn) {
	payload.out += `<${tag} `;
	attributes_fn();
	payload.out += `>`;

	if (!VoidElements.has(tag)) {
		if (!RawTextElements.includes(tag)) {
			payload.out += BLOCK_OPEN;
		}
		children_fn();
		if (!RawTextElements.includes(tag)) {
			payload.out += BLOCK_CLOSE;
		}
		payload.out += `</${tag}>`;
	}
}

/**
 * Array of `onDestroy` callbacks that should be called at the end of the server render function
 * @type {Function[]}
 */
export let on_destroy = [];

/**
 * @param {typeof import('svelte').SvelteComponent} component
 * @param {{ props: Record<string, any>; context?: Map<any, any> }} options
 * @returns {RenderOutput}
 */
export function render(component, options) {
	const payload = create_payload();

	const prev_on_destroy = on_destroy;
	on_destroy = [];
	payload.out += BLOCK_OPEN;

	if (options.context) {
		push();
		/** @type {import('#server').Component} */ (current_component).c = options.context;
	}

	// @ts-expect-error
	component(payload, options.props, {}, {});

	if (options.context) {
		pop();
	}

	payload.out += BLOCK_CLOSE;
	for (const cleanup of on_destroy) cleanup();
	on_destroy = prev_on_destroy;

	return {
		head: payload.head.out || payload.head.title ? payload.head.out + payload.head.title : '',
		html: payload.out
	};
}

/**
 * @param {Payload} payload
 * @param {(head_payload: Payload['head']) => void} fn
 * @returns {void}
 */
export function head(payload, fn) {
	const head_payload = payload.head;
	payload.head.out += BLOCK_OPEN;
	fn(head_payload);
	payload.head.out += BLOCK_CLOSE;
}

/**
 * @template V
 * @param {string} name
 * @param {V} value
 * @param {boolean} boolean
 * @returns {string}
 */
export function attr(name, value, boolean) {
	if (value == null || (!value && boolean) || (value === '' && name === 'class')) return '';
	const assignment = boolean ? '' : `="${escape_html(value, true)}"`;
	return ` ${name}${assignment}`;
}

/**
 * @param {Payload} payload
 * @param {boolean} is_html
 * @param {Record<string, string>} props
 * @param {() => void} component
 * @returns {void}
 */
export function css_props(payload, is_html, props, component) {
	const styles = style_object_to_string(props);
	if (is_html) {
		payload.out += `<div style="display: contents; ${styles}"><!--[-->`;
	} else {
		payload.out += `<g style="${styles}"><!--[-->`;
	}
	component();
	if (is_html) {
		payload.out += `<!--]--></div>`;
	} else {
		payload.out += `<!--]--></g>`;
	}
}

/**
 * @param {Record<string, unknown>[]} attrs
 * @param {boolean} lowercase_attributes
 * @param {boolean} is_html
 * @param {string} class_hash
 * @param {{ styles: Record<string, string> | null; classes: string }} [additional]
 * @returns {string}
 */
export function spread_attributes(attrs, lowercase_attributes, is_html, class_hash, additional) {
	/** @type {Record<string, unknown>} */
	const merged_attrs = {};
	let key;

	for (let i = 0; i < attrs.length; i++) {
		const obj = attrs[i];
		for (key in obj) {
			// omit functions
			if (typeof obj[key] !== 'function') {
				merged_attrs[key] = obj[key];
			}
		}
	}

	const styles = additional?.styles;
	if (styles) {
		if ('style' in merged_attrs) {
			merged_attrs.style = style_object_to_string(
				merge_styles(/** @type {string} */ (merged_attrs.style), styles)
			);
		} else {
			merged_attrs.style = style_object_to_string(styles);
		}
	}

	if (class_hash) {
		if ('class' in merged_attrs) {
			merged_attrs.class += ` ${class_hash}`;
		} else {
			merged_attrs.class = class_hash;
		}
	}
	const classes = additional?.classes;
	if (classes) {
		if ('class' in merged_attrs) {
			merged_attrs.class += ` ${classes}`;
		} else {
			merged_attrs.class = classes;
		}
	}

	let attr_str = '';
	let name;

	for (name in merged_attrs) {
		if (INVALID_ATTR_NAME_CHAR_REGEX.test(name)) continue;
		if (lowercase_attributes) {
			name = name.toLowerCase();
		}
		const is_boolean = is_html && DOMBooleanAttributes.includes(name);
		attr_str += attr(name, merged_attrs[name], is_boolean);
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
 * @param {string} style_attribute
 * @param {Record<string, string>} style_directive
 */
export function merge_styles(style_attribute, style_directive) {
	/** @type {Record<string, string>} */
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

/**
 * @template V
 * @param {Record<string, [any, any, any]>} store_values
 * @param {string} store_name
 * @param {import('#shared').Store<V> | null | undefined} store
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
 * @param {import('#shared').Store<V>} store
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
 * @param {import('#shared').Store<V>} store
 * @param {any} expression
 */
export function mutate_store(store_values, store_name, store, expression) {
	store_set(store, store_get(store_values, store_name, store));
	return expression;
}

/**
 * @param {Record<string, [any, any, any]>} store_values
 * @param {string} store_name
 * @param {import('#shared').Store<number>} store
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
 * @param {import('#shared').Store<number>} store
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
 * @returns {Record<string, any>}
 */
export function sanitize_slots(props) {
	const sanitized = { ...props.$$slots };
	if (props.children) sanitized.default = props.children;
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

export { push, pop } from './context.js';

export {
	add_snippet_symbol,
	validate_component,
	validate_dynamic_element_tag,
	validate_snippet,
	validate_void_dynamic_element
} from '../shared/validate.js';

export { escape_html as escape };
