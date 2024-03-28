import { untrack } from './runtime.js';
import { get_descriptor, is_array } from './utils.js';

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
 * @param {() => any} collection
 * @param {(item: any, index: number) => string} key_fn
 * @returns {void}
 */
export function validate_each_keys(collection, key_fn) {
	const keys = new Map();
	const maybe_array = untrack(() => collection());
	const array = is_array(maybe_array)
		? maybe_array
		: maybe_array == null
			? []
			: Array.from(maybe_array);
	const length = array.length;
	for (let i = 0; i < length; i++) {
		const key = key_fn(array[i], i);
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

/**
 * @param {Record<string, any>} $$props
 * @param {string[]} bindable
 */
export function validate_prop_bindings($$props, bindable) {
	for (const key in $$props) {
		if (!bindable.includes(key)) {
			var setter = get_descriptor($$props, key)?.set;

			if (setter) {
				throw new Error(
					`Cannot use bind:${key} on this component because the property was not declared as bindable. ` +
						`To mark a property as bindable, use the $bindable() rune like this: \`let { ${key} = $bindable() } = $props()\``
				);
			}
		}
	}
}
