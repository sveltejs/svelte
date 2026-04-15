import { get_proxied_value } from '../internal/client/proxy.js';

/**
 * Returns `true` if `value` is a Svelte `$state` proxy.
 *
 * @param {unknown} value
 */
export function isStateProxy(value) {
	return !Object.is(value, get_proxied_value(value));
}
