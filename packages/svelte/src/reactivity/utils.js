/** @import { Source } from '#client' */
import { set } from '../internal/client/reactivity/sources.js';

/** @param {Source<number>} source */
export function increment(source) {
	set(source, source.v + 1);
}
