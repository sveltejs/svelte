import * as w from '../warnings.js';
import { get_proxied_value } from '../proxy.js';

export function init_array_prototype_warnings() {
	const array_prototype = Array.prototype;
	const { indexOf, lastIndexOf, includes } = array_prototype;

	array_prototype.indexOf = function (item, from_index) {
		const index = indexOf.call(this, item, from_index);

		if (index === -1) {
			const test = indexOf.call(get_proxied_value(this), get_proxied_value(item), from_index);

			if (test !== -1) {
				w.state_proxy_equality_mismatch('Array.indexOf');

				// eslint-disable-next-line no-console
				console.trace();
			}
		}

		return index;
	};

	array_prototype.lastIndexOf = function (item, from_index) {
		const index = lastIndexOf.call(this, item, from_index);

		if (index === -1) {
			const test = lastIndexOf.call(get_proxied_value(this), get_proxied_value(item), from_index);

			if (test !== -1) {
				w.state_proxy_equality_mismatch('Array.lastIndexOf');

				// eslint-disable-next-line no-console
				console.trace();
			}
		}

		return index;
	};

	array_prototype.includes = function (item, from_index) {
		const has = includes.call(this, item, from_index);

		if (!has) {
			const test = includes.call(get_proxied_value(this), get_proxied_value(item), from_index);

			if (test) {
				w.state_proxy_equality_mismatch('Array.includes');

				// eslint-disable-next-line no-console
				console.trace();
			}
		}

		return has;
	};
}

/**
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function strict_equals(a, b) {
	if (a !== b && get_proxied_value(a) === get_proxied_value(b)) {
		w.state_proxy_equality_mismatch('=== operator');

		// eslint-disable-next-line no-console
		console.trace();
	}

	return a === b;
}

/**
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function equals(a, b) {
	if (a != b && get_proxied_value(a) == get_proxied_value(b)) {
		w.state_proxy_equality_mismatch('== operator');

		// eslint-disable-next-line no-console
		console.trace();
	}

	return a == b;
}
