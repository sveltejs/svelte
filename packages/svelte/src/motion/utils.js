/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import { tag } from '../internal/client/dev/tracing.js';

/**
 * @param {any} obj
 * @returns {obj is Date}
 */
export function is_date(obj) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}

/**
 * @template {Source<any>} T
 * @param {T} source
 * @param {string} name
 * @returns {T}
 */
export function tag_if_necessary(source, name) {
	if (DEV) {
		return /** @type {T} */ (tag(source, name));
	}
	return source;
}
