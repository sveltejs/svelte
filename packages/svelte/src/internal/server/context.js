/** @import { SSRContext } from '#server' */
import { DEV } from 'esm-env';
import * as e from './errors.js';

/** @type {SSRContext | null} */
export var ssr_context = null;

/** @param {SSRContext | null} v */
export function set_ssr_context(v) {
	ssr_context = v;
}

/**
 * @template T
 * @returns {[() => T, (context: T) => T]}
 * @since 5.40.0
 */
export function createContext() {
	const key = {};

	return [
		() => {
			if (!hasContext(key)) {
				e.missing_context();
			}

			return getContext(key);
		},
		(context) => setContext(key, context)
	];
}

/**
 * @template T
 * @param {any} key
 * @returns {T}
 */
export function getContext(key) {
	const context_map = get_or_init_context_map('getContext');
	const result = /** @type {T} */ (context_map.get(key));

	return result;
}

/**
 * @template T
 * @param {any} key
 * @param {T} context
 * @returns {T}
 */
export function setContext(key, context) {
	get_or_init_context_map('setContext').set(key, context);
	return context;
}

/**
 * @param {any} key
 * @returns {boolean}
 */
export function hasContext(key) {
	return get_or_init_context_map('hasContext').has(key);
}

/** @returns {Map<any, any>} */
export function getAllContexts() {
	return get_or_init_context_map('getAllContexts');
}

/**
 * @param {string} name
 * @returns {Map<unknown, unknown>}
 */
function get_or_init_context_map(name) {
	if (ssr_context === null) {
		e.lifecycle_outside_component(name);
	}

	return (ssr_context.c ??= new Map(get_parent_context(ssr_context) || undefined));
}

/**
 * @param {Function} [fn]
 */
export function push(fn) {
	ssr_context = { p: ssr_context, c: null, r: null };

	if (DEV) {
		ssr_context.function = fn;
		ssr_context.element = ssr_context.p?.element;
	}
}

export function pop() {
	ssr_context = /** @type {SSRContext} */ (ssr_context).p;
}

/**
 * @param {SSRContext} ssr_context
 * @returns {Map<unknown, unknown> | null}
 */
function get_parent_context(ssr_context) {
	let parent = ssr_context.p;

	while (parent !== null) {
		const context_map = parent.c;
		if (context_map !== null) {
			return context_map;
		}
		parent = parent.p;
	}

	return null;
}

/**
 * Wraps an `await` expression in such a way that the component context that was
 * active before the expression evaluated can be reapplied afterwards —
 * `await a + b()` becomes `(await $.save(a))() + b()`, meaning `b()` will have access
 * to the context of its component.
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<() => T>}
 */
export async function save(promise) {
	var previous_context = ssr_context;
	var value = await promise;

	return () => {
		ssr_context = previous_context;
		return value;
	};
}
