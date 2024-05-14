import { DEV } from 'esm-env';
import { STATE_SYMBOL } from '../constants';
import * as w from '../warnings.js';
import { raw } from '../proxy';

export function init_array_prototype_warnings() {
	const array_prototype = Array.prototype;

	const original_index_of = array_prototype.indexOf;

	array_prototype.indexOf = function (search_element, from_index) {
		const index = original_index_of.call(this, search_element, from_index);
		if (index === -1) {
			if (original_index_of.call(raw(this), search_element, from_index) !== -1) {
				w.state_proxy_equality_mismatch('Array.indexOf');
			}
		}
		return index;
	};

	const original_last_index_of = array_prototype.lastIndexOf;

	array_prototype.lastIndexOf = function (search_element, from_index) {
		const index = original_last_index_of.call(this, search_element, from_index);
		if (index === -1) {
			if (original_last_index_of.call(raw(this), search_element, from_index) !== -1) {
				w.state_proxy_equality_mismatch('Array.lastIndexOf');
			}
		}
		return index;
	};

	const original_includes = array_prototype.includes;

	array_prototype.includes = function (search_element, from_index) {
		const has = original_includes.call(this, search_element, from_index);
		if (!has) {
			if (original_includes.call(raw(this), search_element, from_index)) {
				w.state_proxy_equality_mismatch('Array.includes');
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
	if (DEV) {
		if (a !== b && raw(a) === raw(b)) {
			w.state_proxy_equality_mismatch('=== operator');
		}
	}
	return a === b;
}

/**
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function equals(a, b) {
	if (DEV) {
		if (a != b && raw(a) == raw(b)) {
			w.state_proxy_equality_mismatch('== operator');
		}
	}
	return a == b;
}
