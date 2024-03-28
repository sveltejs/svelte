import { current_component_context } from './internal/client/runtime.js';

export {
	createEventDispatcher,
	flushSync,
	getAllContexts,
	getContext,
	hasContext,
	mount,
	hydrate,
	setContext,
	tick,
	unmount,
	untrack,
	createRoot
} from './index-client.js';

/** @returns {void} */
export function onMount() {}

/** @param {() => void} fn */
export function onDestroy(fn) {
	const context = /** @type {import('#client').ComponentContext} */ (current_component_context);
	(context.ondestroy ??= []).push(fn);
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
