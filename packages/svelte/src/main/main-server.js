import { on_destroy } from '../internal/server/index.js';

export {
	createRoot,
	createEventDispatcher,
	flushSync,
	getAllContexts,
	getContext,
	hasContext,
	mount,
	hydrate,
	setContext,
	tick,
	untrack
} from './main-client.js';

/** @returns {void} */
export function onMount() {}

/** @param {Function} fn */
export function onDestroy(fn) {
	on_destroy.push(fn);
}

/** @returns {void} */
export function beforeUpdate() {}

/** @returns {void} */
export function afterUpdate() {}

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function unstate(value) {
	// There's no signals/proxies on the server, so just return the value
	return value;
}
