import { is_void } from '../../compiler/phases/1-parse/utils/names.js';

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
		throw new Error(
			'The argument to `{@render ...}` must be a snippet function, not a component or some other kind of function. ' +
				'If you want to dynamically render one snippet or another, use `$derived` and pass its result to `{@render ...}`.'
		);
	}
	return snippet_fn;
}

/**
 * Validate that the function behind `<Component />` isn't a snippet.
 * @param {any} component_fn
 */
export function validate_component(component_fn) {
	if (component_fn?.[snippet_symbol] === true) {
		throw new Error('A snippet must be rendered with `{@render ...}`');
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
		// eslint-disable-next-line no-console
		console.warn(`<svelte:element this="${tag}"> is self-closing and cannot have content.`);
	}
}

/** @param {() => unknown} tag_fn */
export function validate_dynamic_element_tag(tag_fn) {
	const tag = tag_fn();
	const is_string = typeof tag === 'string';
	if (tag && !is_string) {
		throw new Error('<svelte:element> expects "this" attribute to be a string.');
	}
}
