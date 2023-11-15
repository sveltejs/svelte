import { is_array } from './utils.js';

/** regex of all html void element names */
const void_element_names =
	/^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;

/** @param {string} tag */
function is_void(tag) {
	return void_element_names.test(tag) || tag.toLowerCase() === '!doctype';
}

/**
 * @param {any} store
 * @param {string} name
 */
export function validate_store(store, name) {
	if (store != null && typeof store.subscribe !== 'function') {
		throw new Error(`'${name}' is not a store with a 'subscribe' method`);
	}
}

/**
 * @param {() => any} component_fn
 * @returns {any}
 */
export function validate_dynamic_component(component_fn) {
	const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
	try {
		const instance = component_fn();
		if (instance !== undefined && typeof instance !== 'object') {
			throw new Error(error_message);
		}
		return instance;
	} catch (err) {
		const { message } = /** @type {Error} */ (err);
		if (typeof message === 'string' && message.indexOf('is not a function') !== -1) {
			throw new Error(error_message);
		} else {
			throw err;
		}
	}
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

/**
 * @param {() => any} collection
 * @param {(item: any) => string} key_fn
 * @returns {void}
 */
export function validate_each_keys(collection, key_fn) {
	const keys = new Map();
	const maybe_array = collection();
	const array = is_array(maybe_array)
		? maybe_array
		: maybe_array == null
		? []
		: Array.from(maybe_array);
	const length = array.length;
	for (let i = 0; i < length; i++) {
		const key = key_fn(array[i]);
		if (keys.has(key)) {
			throw new Error(
				`Cannot have duplicate keys in a keyed each: Keys at index ${keys.get(
					key
				)} and ${i} with value '${array[i]}' are duplicates`
			);
		}
		keys.set(key, i);
	}
}

/**
 * @param {number} timeout
 * @returns {() => void}
 * */
export function loop_guard(timeout) {
	const start = Date.now();
	return () => {
		if (Date.now() - start > timeout) {
			throw new Error('Infinite loop detected');
		}
	};
}

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
	if (snippet_fn[snippet_symbol] !== true) {
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
