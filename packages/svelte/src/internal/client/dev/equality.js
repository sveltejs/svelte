import * as w from '../warnings.js';
import { get_proxied_value } from '../proxy.js';

/**
 * Resolves `from_index` like the native array methods do (a negative index
 * counts back from the end), so we only look at what they searched
 * @param {number} length
 * @param {number} from_index
 */
function resolve_index(length, from_index) {
	const index = Math.trunc(from_index) || 0;
	return index < 0 ? length + index : index;
}

/**
 * Holes and other non-proxies can't cause a mismatch, so only a real proxy of `item` counts
 * @param {any} value
 * @param {any} item
 */
function is_proxy_of(value, item) {
	const proxied = get_proxied_value(value);
	return proxied !== value && proxied === item;
}

export function init_array_prototype_warnings() {
	const array_prototype = Array.prototype;
	// The REPL ends up here over and over, and this prevents it from adding more and more patches
	// of the same kind to the prototype, which would slow down everything over time.
	// @ts-expect-error
	const cleanup = Array.__svelte_cleanup;
	if (cleanup) {
		cleanup();
	}

	const { indexOf, lastIndexOf, includes } = array_prototype;

	array_prototype.indexOf = function (item, from_index) {
		const index = indexOf.call(this, item, from_index);

		if (index === -1) {
			const start = Math.max(resolve_index(this.length, from_index ?? 0), 0);

			for (let i = start; i < this.length; i += 1) {
				if (is_proxy_of(this[i], item)) {
					w.state_proxy_equality_mismatch('array.indexOf(...)');
					break;
				}
			}
		}

		return index;
	};

	array_prototype.lastIndexOf = function (item, from_index) {
		// we need to specify this.length - 1 because it's probably using something like
		// `arguments` inside so passing undefined is different from not passing anything
		const index = lastIndexOf.call(this, item, from_index ?? this.length - 1);

		if (index === -1) {
			const end = Math.min(
				resolve_index(this.length, from_index ?? this.length - 1),
				this.length - 1
			);

			for (let i = 0; i <= end; i += 1) {
				if (is_proxy_of(this[i], item)) {
					w.state_proxy_equality_mismatch('array.lastIndexOf(...)');
					break;
				}
			}
		}

		return index;
	};

	array_prototype.includes = function (item, from_index) {
		const has = includes.call(this, item, from_index);

		if (!has) {
			const start = Math.max(resolve_index(this.length, from_index ?? 0), 0);

			for (let i = start; i < this.length; i += 1) {
				if (is_proxy_of(this[i], item)) {
					w.state_proxy_equality_mismatch('array.includes(...)');
					break;
				}
			}
		}

		return has;
	};

	// @ts-expect-error
	Array.__svelte_cleanup = () => {
		array_prototype.indexOf = indexOf;
		array_prototype.lastIndexOf = lastIndexOf;
		array_prototype.includes = includes;
	};
}

/**
 * @param {any} a
 * @param {any} b
 * @param {boolean} equal
 * @returns {boolean}
 */
export function strict_equals(a, b, equal = true) {
	// try-catch needed because this tries to read properties of `a` and `b`,
	// which could be disallowed for example in a secure context
	try {
		if ((a === b) !== (get_proxied_value(a) === get_proxied_value(b))) {
			w.state_proxy_equality_mismatch(equal ? '===' : '!==');
		}
	} catch {}

	return (a === b) === equal;
}

/**
 * @param {any} a
 * @param {any} b
 * @param {boolean} equal
 * @returns {boolean}
 */
export function equals(a, b, equal = true) {
	if ((a == b) !== (get_proxied_value(a) == get_proxied_value(b))) {
		w.state_proxy_equality_mismatch(equal ? '==' : '!=');
	}

	return (a == b) === equal;
}
