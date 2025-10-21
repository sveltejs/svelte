/** @import { SSRContext } from '#server' */
/** @import { Renderer } from './internal/server/renderer.js' */
import { ssr_context } from './internal/server/context.js';
import { noop } from './internal/shared/utils.js';
import * as e from './internal/server/errors.js';

/** @param {() => void} fn */
export function onDestroy(fn) {
	/** @type {Renderer} */ (/** @type {SSRContext} */ (ssr_context).r).on_destroy(fn);
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

export function fork() {
	e.lifecycle_function_unavailable('fork');
}

export async function tick() {}

export async function settled() {}

export { getAbortSignal } from './internal/server/abort-signal.js';

export {
	createContext,
	getAllContexts,
	getContext,
	hasContext,
	setContext
} from './internal/server/context.js';

export { createRawSnippet } from './internal/server/blocks/snippet.js';
