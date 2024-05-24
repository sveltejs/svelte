import * as w from '../warnings.js';
import { get_proxied_value } from '../proxy.js';

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
			const test = indexOf.call(get_proxied_value(this), get_proxied_value(item), from_index);

			if (test !== -1) {
				w.state_proxy_equality_mismatch('array.indexOf(...)');
			}
		}

		return index;
	};

	array_prototype.lastIndexOf = function (item, from_index) {
		// we need to specify this.length - 1 because it's probably using something like
		// `arguments` inside so passing undefined is different from not passing anything
		const index = lastIndexOf.call(this, item, from_index ?? this.length - 1);

		if (index === -1) {
			// we need to specify this.length - 1 because it's probably using something like
			// `arguments` inside so passing undefined is different from not passing anything
			const test = lastIndexOf.call(
				get_proxied_value(this),
				get_proxied_value(item),
				from_index ?? this.length - 1
			);

			if (test !== -1) {
				w.state_proxy_equality_mismatch('array.lastIndexOf(...)');
			}
		}

		return index;
	};

	array_prototype.includes = function (item, from_index) {
		const has = includes.call(this, item, from_index);

		if (!has) {
			const test = includes.call(get_proxied_value(this), get_proxied_value(item), from_index);

			if (test) {
				w.state_proxy_equality_mismatch('array.includes(...)');
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
	if ((a === b) !== (get_proxied_value(a) === get_proxied_value(b))) {
		w.state_proxy_equality_mismatch(equal ? '===' : '!==');
	}

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
