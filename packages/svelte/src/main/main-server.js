export {
	createRoot,
	createEventDispatcher,
	flushSync,
	getAllContexts,
	getContext,
	hasContext,
	mount,
	onDestroy,
	setContext,
	tick,
	untrack
} from './main-client.js';

/** @returns {void} */
export function onMount() {}

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
