export const SvelteDate = globalThis.Date;
export const SvelteSet = globalThis.Set;
export const SvelteMap = globalThis.Map;
export const SvelteURL = globalThis.URL;
export const SvelteURLSearchParams = globalThis.URLSearchParams;

export class MediaQuery {
	current;
	/**
	 * @param {string} query
	 * @param {boolean} [matches]
	 */
	constructor(query, matches = false) {
		this.current = matches;
	}
}

/**
 * @param {any} _
 */
export function createSubscriber(_) {
	return () => {};
}

/**
 * Returns `false` on the server because `$state` proxies are a client runtime concept.
 *
 * @param {unknown} _value
 */
export function isStateProxy(_value) {
	return false;
}
