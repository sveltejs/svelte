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
