import { DEV } from 'esm-env';
import { STATE_SYMBOL } from '../constants';
import * as w from '../warnings.js';

if (DEV) {
	const array_prototype = Array.prototype;

	const original_index_of = array_prototype.indexOf;

	array_prototype.indexOf = function (search_element, from_index) {
		const index = original_index_of.call(this, search_element, from_index);
		if (
			index === -1 &&
			search_element != null &&
			typeof search_element === 'object' &&
			STATE_SYMBOL in search_element
		) {
			const o = search_element[STATE_SYMBOL];
			if (o != null) {
				if (original_index_of.call(this, o.p, from_index) !== -1) {
					// fire warning
					console.warn('TODO: $state referenced non-state');
				}
			}
		}
		return index;
	};

	const original_last_index_of = array_prototype.lastIndexOf;

	array_prototype.lastIndexOf = function (search_element, from_index) {
		const index = original_last_index_of.call(this, search_element, from_index);
		if (
			index === -1 &&
			search_element != null &&
			typeof search_element === 'object' &&
			STATE_SYMBOL in search_element
		) {
			const o = search_element[STATE_SYMBOL];
			if (o != null) {
				if (original_last_index_of.call(this, o.p, from_index) !== -1) {
					// fire warning
					console.warn('TODO: $state referenced non-state');
				}
			}
		}
		return index;
	};

	const original_includes = array_prototype.includes;

	array_prototype.includes = function (search_element, from_index) {
		const has = original_includes.call(this, search_element, from_index);
		if (
			has &&
			search_element != null &&
			typeof search_element === 'object' &&
			STATE_SYMBOL in search_element
		) {
			const o = search_element[STATE_SYMBOL];
			if (o != null) {
				if (original_includes.call(this, o.p, from_index)) {
					// fire warning
					console.warn('TODO: $state referenced non-state');
				}
			}
		}
		return has;
	};
}

/**
 * @param {any} a
 * @param {any} b
 */
function check_dev_equals(a, b) {
	if (a != null && typeof a === 'object' && STATE_SYMBOL in a) {
		const o = a[STATE_SYMBOL];
		if (o != null) {
			if (o.p === b) {
				// fire warning
				console.warn('TODO: $state referenced non-state');
			}
		}
	} else if (b != null && typeof b === 'object' && STATE_SYMBOL in b) {
		const o = b[STATE_SYMBOL];
		if (o != null) {
			if (o.p === a) {
				// fire warning
				console.warn('TODO: $state referenced non-state');
			}
		}
	}
}

/**
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function strict_equals(a, b) {
	if (DEV) {
		check_dev_equals(a, b);
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
		check_dev_equals(a, b);
	}
	return a == b;
}
