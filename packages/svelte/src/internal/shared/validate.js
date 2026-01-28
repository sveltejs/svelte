import { is_void } from '../../utils.js';
import * as w from './warnings.js';
import * as e from './errors.js';

export { invalid_default_snippet } from './errors.js';

/**
 * @param {() => string} tag_fn
 * @returns {void}
 */
export function validate_void_dynamic_element(tag_fn) {
	const tag = tag_fn();
	if (tag && is_void(tag)) {
		w.dynamic_void_element_content(tag);
	}
}

/** @param {() => unknown} tag_fn */
export function validate_dynamic_element_tag(tag_fn) {
	const tag = tag_fn();
	const is_string = typeof tag === 'string';
	if (tag && !is_string) {
		e.svelte_element_invalid_this_value();
	}
}

/**
 * @param {any} store
 * @param {string} name
 */
export function validate_store(store, name) {
	if (store != null && typeof store.subscribe !== 'function') {
		e.store_invalid_shape(name);
	}
}

/**
 * @template {(...args: any[]) => unknown} T
 * @param {T} fn
 */
export function prevent_snippet_stringification(fn) {
	fn.toString = () => {
		e.snippet_without_render_tag();
		return '';
	};
	return fn;
}
