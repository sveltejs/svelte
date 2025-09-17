/** @import { ComponentType, SvelteComponent, Component } from 'svelte' */
/** @import { RenderOutput, SSRContext } from '#server' */
/** @import { Store } from '#shared' */
/** @import { AccumulatedContent } from './payload.js' */
export { FILENAME, HMR } from '../../constants.js';
import { attr, clsx, to_class, to_style } from '../shared/attributes.js';
import { is_promise, noop } from '../shared/utils.js';
import { subscribe_to_store } from '../../store/utils.js';
import {
	UNINITIALIZED,
	ELEMENT_PRESERVE_ATTRIBUTE_CASE,
	ELEMENT_IS_NAMESPACED,
	ELEMENT_IS_INPUT
} from '../../constants.js';
import { escape_html } from '../../escaping.js';
import { DEV } from 'esm-env';
import { ssr_context, pop, push, set_ssr_context } from './context.js';
import { EMPTY_COMMENT, BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE } from './hydration.js';
import { validate_store } from '../shared/validate.js';
import { is_boolean_attribute, is_raw_text_element, is_void } from '../../utils.js';
import { Payload, SSRState } from './payload.js';
import { abort } from './abort-signal.js';
import { async_mode_flag } from '../flags/index.js';
import * as e from './errors.js';

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
	payload.push('<!---->');

	if (tag) {
		payload.push(`<${tag}`);
		attributes_fn();
		payload.push(`>`);

		if (!is_void(tag)) {
			children_fn();
			if (!is_raw_text_element(tag)) {
				payload.push(EMPTY_COMMENT);
			}
			payload.push(`</${tag}>`);
		}
	}

	payload.push('<!---->');
}

/**
 * Only available on the server and when compiling with the `server` option.
 * Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
 * @template {Record<string, any>} Props
 * @param {Component<Props> | ComponentType<SvelteComponent<Props>>} component
 * @param {{ props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any>; idPrefix?: string }} [options]
 * @returns {RenderOutput}
 */
export function render(component, options = {}) {
	return Payload.render(/** @type {Component<Props>} */ (component), options);
}

/**
 * @param {Payload} payload
 * @param {(payload: Payload) => Promise<void> | void} fn
 * @returns {void}
 */
export function head(payload, fn) {
	payload.child((payload) => {
		payload.push(BLOCK_OPEN);
		payload.child(fn);
		payload.push(BLOCK_CLOSE);
	}, 'head');
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
		payload.push(`<svelte-css-wrapper style="display: contents; ${styles}">`);
	} else {
		payload.push(`<g style="${styles}">`);
	}

	if (dynamic) {
		payload.push('<!---->');
	}

	component();

	if (is_html) {
		payload.push(`<!----></svelte-css-wrapper>`);
	} else {
		payload.push(`<!----></g>`);
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
	const is_input = (flags & ELEMENT_IS_INPUT) !== 0;

	for (name in attrs) {
		// omit functions, internal svelte properties and invalid attribute names
		if (typeof attrs[name] === 'function') continue;
		if (name[0] === '$' && name[1] === '$') continue; // faster than name.startsWith('$$')
		if (INVALID_ATTR_NAME_CHAR_REGEX.test(name)) continue;

		var value = attrs[name];

		if (lowercase) {
			name = name.toLowerCase();
		}

		if (is_input) {
			if (name === 'defaultvalue' || name === 'defaultchecked') {
				name = name === 'defaultvalue' ? 'value' : 'checked';
				if (attrs[name]) continue;
			}
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
		payload.push(BLOCK_OPEN);
		promise.then(null, noop);
		if (pending_fn !== null) {
			pending_fn();
		}
	} else if (then_fn !== null) {
		payload.push(BLOCK_OPEN_ELSE);
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
	const uid = payload.global.uid();
	payload.push('<!--#' + uid + '-->');
	return uid;
}

export { attr, clsx };

export { html } from './blocks/html.js';

export { save } from './context.js';

export { push_element, pop_element, validate_snippet_args } from './dev.js';

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
 * @param {unknown} value
 */
export function maybe_selected(payload, value) {
	return value === payload.local.select_value ? ' selected' : '';
}

/**
 * When an `option` element has no `value` attribute, we need to treat the child
 * content as its `value` to determine whether we should apply the `selected` attribute.
 * This has to be done at runtime, for hopefully obvious reasons. It is also complicated,
 * for sad reasons.
 * @param {Payload} payload
 * @param {((payload: Payload) => void | Promise<void>)} children
 * @returns {void}
 */
export function valueless_option(payload, children) {
	const i = payload.length;

	// prior to children, `payload` has some combination of string/unresolved payload that ends in `<option ...>`
	payload.child(children);

	// post-children, `payload` has child content, possibly also with some number of hydration comments.
	// we can compact this last chunk of content to see if it matches the select value...
	payload.compact({
		start: i,
		fn: (content) => {
			if (content.body.replace(/<!---->/g, '') === payload.local.select_value) {
				// ...and if it does match the select value, we can compact the part of the payload representing the `<option ...>`
				// to add the `selected` attribute to the end.
				payload.compact({
					start: i - 1,
					end: i,
					fn: (content) => {
						return { body: content.body.slice(0, -1) + ' selected>', head: content.head };
					}
				});
			}
			return content;
		}
	});
}

/**
 * In the special case where an `option` element has no `value` attribute but
 * the children of the `option` element are a single expression, we can simplify
 * by running the children and passing the resulting value, which means
 * we don't have to do all of the same parsing nonsense. It also means we can avoid
 * coercing everything to a string.
 * @param {Payload} payload
 * @param {(() => unknown)} child
 */
export function simple_valueless_option(payload, child) {
	const result = child();

	/**
	 * @param {AccumulatedContent} content
	 * @param {unknown} child_value
	 * @returns {AccumulatedContent}
	 */
	const mark_selected = (content, child_value) => {
		if (child_value === payload.local.select_value) {
			return { body: content.body.slice(0, -1) + ' selected>', head: content.head };
		}
		return content;
	};

	payload.compact({
		start: payload.length - 1,
		fn: (content) => {
			if (result instanceof Promise) {
				return result.then((child_value) => mark_selected(content, child_value));
			}
			return mark_selected(content, result);
		}
	});

	payload.child((child_payload) => {
		if (result instanceof Promise) {
			return result.then((child_value) => {
				child_payload.push(escape_html(child_value));
			});
		}
		child_payload.push(escape_html(result));
	});
}

/**
 * Since your document can only have one `title`, we have to have some sort of algorithm for determining
 * which one "wins". To do this, we perform a depth-first comparison of where the title was encountered --
 * later ones "win" over earlier ones, regardless of what order the promises resolve in. To accomodate this, we:
 * - Figure out where we are in the content tree (`get_path`)
 * - Render the title in its own child so that it has a defined "slot" in the payload
 * - Compact that spot so that we get the entire rendered contents of the title
 * - Attempt to set the global title (this is where the "wins" logic based on the path happens)
 *
 * TODO we could optimize this by not even rendering the title if the path wouldn't be accepted
 *
 * @param {Payload} payload
 * @param {((payload: Payload) => void | Promise<void>)} children
 */
export function build_title(payload, children) {
	const path = payload.get_path();
	const i = payload.length;
	payload.child(children);
	payload.compact({
		start: i,
		fn: ({ head }) => {
			payload.global.set_title(head, path);
			// since we can only ever render the title in this chunk, and title rendering is handled specially,
			// we can just ditch the results after we've saved them globally
			return { head: '', body: '' };
		}
	});
}
