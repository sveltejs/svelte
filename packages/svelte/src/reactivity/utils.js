/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import { set } from '../internal/client/reactivity/sources.js';
import { tag } from '../internal/client/index.js';

/** @param {Source<number>} source */
export function increment(source) {
	set(source, source.v + 1);
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
