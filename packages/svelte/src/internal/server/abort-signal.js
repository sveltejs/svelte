import { STALE_REACTION } from '#client/constants';

/** @type {AbortController | null} */
export let controller = null;

export function abort() {
	if (controller !== null) {
		controller.abort(STALE_REACTION);
		controller = null;
	}
}

export function getAbortSignal() {
	return (controller ??= new AbortController()).signal;
}
