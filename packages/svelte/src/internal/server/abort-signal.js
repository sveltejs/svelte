import { StaleReactionError } from '../client/reactivity/async.js';

/** @type {AbortController | null} */
let controller = null;

export function abort() {
	controller?.abort(new StaleReactionError());
	controller = null;
}

export function getAbortSignal() {
	return (controller ??= new AbortController()).signal;
}
