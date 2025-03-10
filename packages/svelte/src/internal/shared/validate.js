/** @import { TemplateNode } from '#client' */
/** @import { Getters } from '#shared' */
import { is_void } from '../../utils.js';
import * as w from './warnings.js';
import * as e from './errors.js';

export { invalid_default_snippet } from './errors.js';

/**
 * @param {() => string | HTMLElement | SVGElement} tag_fn
 * @returns {void}
 */
export function validate_void_dynamic_element(tag_fn) {
	const tag = tag_fn();
	const tag_name = typeof tag === 'string' ? tag : tag?.tagName;
	if (tag_name && is_void(tag_name)) {
		w.dynamic_void_element_content(tag_name);
	}
}

/** @param {() => unknown} tag_fn */
export function validate_dynamic_element_tag(tag_fn) {
	const tag = tag_fn();
	const is_string = typeof tag === 'string';
	const is_element = tag instanceof HTMLElement || tag instanceof SVGElement;
	if (tag && !(is_string || is_element)) {
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
