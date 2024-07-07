import { is_void } from '../../constants.js';
import * as w from './warnings.js';
import * as e from './errors.js';

const snippet_symbol = Symbol.for('svelte.snippet');

/**
 * @param {any} fn
 */
export function add_snippet_symbol(fn) {
	fn[snippet_symbol] = true;
	return fn;
}

/**
 * Validate that the function handed to `{@render ...}` is a snippet function, and not some other kind of function.
 * @param {any} snippet_fn
 */
export function validate_snippet(snippet_fn) {
	if (snippet_fn && snippet_fn[snippet_symbol] !== true) {
		e.render_tag_invalid_argument();
	}

	return snippet_fn;
}

/**
 * Validate that the function behind `<Component />` isn't a snippet.
 * @param {any} component_fn
 */
export function validate_component(component_fn) {
	if (component_fn?.[snippet_symbol] === true) {
		e.snippet_used_as_component();
	}

	return component_fn;
}

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
