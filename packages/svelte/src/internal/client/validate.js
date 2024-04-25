import { untrack } from './runtime.js';
import { get_descriptor, is_array } from './utils.js';
import * as e from './errors.js';

/** regex of all html void element names */
const void_element_names =
	/^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;

/** @param {string} tag */
function is_void(tag) {
	return void_element_names.test(tag) || tag.toLowerCase() === '!doctype';
}

/**
 * @param {() => any} component_fn
 * @returns {any}
 */
export function validate_dynamic_component(component_fn) {
	try {
		const instance = component_fn();

		if (instance !== undefined && typeof instance !== 'object') {
			e.svelte_component_invalid_this_value();
		}

		return instance;
	} catch (err) {
		const { message } = /** @type {Error} */ (err);

		if (typeof message === 'string' && message.indexOf('is not a function') !== -1) {
			e.svelte_component_invalid_this_value();
		}

		throw err;
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
			const a = String(keys.get(key));
			const b = String(i);

			/** @type {string | null} */
			let k = String(array[i]);
			if (k.startsWith('[object ')) k = null;

			e.each_key_duplicate(a, b, k);
		}
		keys.set(key, i);
	}
}

/**
 * @param {Record<string, any>} $$props
 * @param {string[]} bindable
 * @param {string[]} exports
 * @param {Function & { filename: string }} component
 */
export function validate_prop_bindings($$props, bindable, exports, component) {
	for (const key in $$props) {
		var setter = get_descriptor($$props, key)?.set;
		var name = component.name;

		if (setter) {
			if (exports.includes(key)) {
				throw new Error(
					`Component ${component.filename} has an export named ${key} that a consumer component is trying to access using bind:${key}, which is disallowed. ` +
						`Instead, use bind:this (e.g. <${name} bind:this={component} />) ` +
						`and then access the property on the bound component instance (e.g. component.${key}).`
				);
			}
			if (!bindable.includes(key)) {
				throw new Error(
					`A component is binding to property ${key} of ${name}.svelte (i.e. <${name} bind:${key} />). This is disallowed because the property was not declared as bindable inside ${component.filename}. ` +
						`To mark a property as bindable, use the $bindable() rune in ${name}.svelte like this: \`let { ${key} = $bindable() } = $props()\``
				);
			}
		}
	}
}
