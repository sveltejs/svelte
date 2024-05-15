import { current_component } from './internal/server/context.js';
import { noop } from './internal/shared/utils.js';
import * as e from './internal/server/errors.js';

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
	e.lifecycle_function_unavailable('mount');
}

export function hydrate() {
	e.lifecycle_function_unavailable('hydrate');
}

export function unmount() {
	e.lifecycle_function_unavailable('unmount');
}

export async function tick() {}

export { getAllContexts, getContext, hasContext, setContext } from './internal/server/context.js';
