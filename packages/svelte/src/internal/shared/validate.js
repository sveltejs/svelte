import { is_void, IS_COMPONENT } from '../../constants.js';
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
 * @param {Record<string, any> | undefined} $$props Only passed if render tag receives arguments and is for the children prop
 */
export function validate_snippet(snippet_fn, $$props) {
	if (
		($$props?.$$slots?.default && typeof $$props.$$slots.default !== 'boolean') ||
		(snippet_fn && snippet_fn[snippet_symbol] !== true)
	) {
		e.render_tag_invalid_argument();
	}

	return snippet_fn;
}

/**
 * Validate that the function behind `<Component />` isn't a snippet.
 * @param {any} component_fn
 */
export function validate_component_is_not_a_snippet(component_fn) {
	if (component_fn?.[snippet_symbol] === true) {
		e.snippet_used_as_component();
	}
}

/**
 * Validate that the function behind `<Component />` is a valid svelte component.
 *
 * If `dynamic` is true checks that `component_fn` isn't a snippet and that is actually a svelte component
 * If `dynamic` is false checks that `component_fn` isn't a snippet, is not undefined and it's actually a svelte component
 * @param {any} component_fn
 * @param {boolean} dynamic
 */
export function validate_component(component_fn, dynamic) {
	validate_component_is_not_a_snippet(component_fn);

	// this is the case for both `<svelte:component>` with a wrong this and `<Something >`
	// where Something is not a svelte component. In this case `component_fn` needs to be
	// defined for the error to throw because you can do `<svelte:component this={undefined} />`
	if (component_fn && !(IS_COMPONENT in component_fn)) {
		if (dynamic) {
			e.svelte_component_invalid_this_value();
		}
		e.not_a_svelte_component();
	}

	// if dynamic is false and component_fn is undefined we still throw to cover
	// the case of `<Something />` where Something = undefined
	if (!dynamic && !component_fn) {
		e.not_a_svelte_component();
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
