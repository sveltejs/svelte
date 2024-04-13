import { current_component } from './internal/server/context.js';
import { noop } from './internal/shared/utils.js';

/** @param {() => void} fn */
export function onDestroy(fn) {
	var context = /** @type {import('#server').Component} */ (current_component);
	(context.d ??= []).push(fn);
}

export {
	noop as beforeUpdate,
	noop as afterUpdate,
	noop as onMount,
	noop as flushSync,
	run as untrack
} from './internal/shared/utils.js';

export function createEventDispatcher() {
	return noop;
}

export function mount() {
	throw new Error('mount(...) is not available on the server');
}

export function hydrate() {
	throw new Error('hydrate(...) is not available on the server');
}

export function unmount() {
	throw new Error('unmount(...) is not available on the server');
}

export async function tick() {}

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function unstate(value) {
	// There's no signals/proxies on the server, so just return the value
	return value;
}

export { getAllContexts, getContext, hasContext, setContext } from './internal/server/context.js';
