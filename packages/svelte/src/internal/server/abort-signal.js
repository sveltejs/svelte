import { STALE_REACTION } from '#client/constants';

/** @type {AbortController | null} */
let controller = null;

export function abort() {
	controller?.abort(STALE_REACTION);
	controller = null;
}

export function getAbortSignal() {
	return (controller ??= new AbortController()).signal;
}
