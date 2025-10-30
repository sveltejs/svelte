/** @import { Parse, Transport } from '#shared' */
import { hydrating } from './dom/hydration';

/**
 * @template T
 * @param {string} key
 * @param {() => T} fn
 * @param {{ transport?: Transport<T> }} [options]
 * @returns {T}
 */
export function hydratable(key, fn, options = {}) {
	if (!hydrating) {
		return fn();
	}
	var store = window.__svelte?.h;
	if (store === undefined) {
		throw new Error('TODO this should be impossible?');
	}
	const val = store.get(key);
	if (val === undefined) {
		throw new Error(
			`TODO Expected hydratable key "${key}" to exist during hydration, but it does not`
		);
	}
	return parse(val, options.transport?.parse);
}

/**
 * @template T
 * @param {string} key
 * @param {{ parse?: Parse<T> }} [options]
 * @returns {T | undefined}
 */
export function get_hydratable_value(key, options = {}) {
	// TODO probably can DRY this out with the above
	if (!hydrating) {
		return undefined;
	}

	var store = window.__svelte?.h;
	if (store === undefined) {
		throw new Error('TODO this should be impossible?');
	}
	const val = store.get(key);
	if (val === undefined) {
		return undefined;
	}

	return parse(val, options.parse);
}

/**
 * @template T
 * @param {string} val
 * @param {Parse<T> | undefined} parse
 * @returns {T}
 */
function parse(val, parse) {
	return (parse ?? ((val) => new Function(`return (${val})`)()))(val);
}
