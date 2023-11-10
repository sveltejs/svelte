export {
	createRoot,
	createEventDispatcher,
	flushSync,
	getAllContexts,
	getContext,
	hasContext,
	mount,
	onDestroy,
	selector,
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
