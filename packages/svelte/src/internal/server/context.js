/** @import { RenderContext, SSRContext } from '#server' */
/** @import { AsyncLocalStorage } from 'node:async_hooks' */
/** @import { Transport } from '#shared' */
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
	return [() => getContext(key), (context) => setContext(key, context)];
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
	var previous_sync_store = sync_store;
	var value = await promise;

	return () => {
		ssr_context = previous_context;
		sync_store = previous_sync_store;
		return value;
	};
}

/** @type {string | null} */
export let hydratable_key = null;

/** @param {string | null} key */
export function set_hydratable_key(key) {
	hydratable_key = key;
}

/**
 * @template T
 * @overload
 * @param {string} key
 * @param {() => Promise<T>} fn
 * @param {{ transport?: Transport<T> }} [options]
 * @returns {Promise<T>}
 */
/**
 * @template T
 * @overload
 * @param {() => Promise<T>} fn
 * @param {{ transport?: Transport<T> }} [options]
 * @returns {Promise<T>}
 */
/**
 * @template T
 * @param {string | (() => Promise<T>)} key_or_fn
 * @param {(() => Promise<T>) | { transport?: Transport<T> }} [fn_or_options]
 * @param {{ transport?: Transport<T> }} [maybe_options]
 * @returns {Promise<T>}
 */
export function hydratable(key_or_fn, fn_or_options = {}, maybe_options = {}) {
	// TODO DRY out with #shared
	/** @type {string} */
	let key;
	/** @type {() => Promise<T>} */
	let fn;
	/** @type {{ transport?: Transport<T> }} */
	let options;

	if (typeof key_or_fn === 'string') {
		key = key_or_fn;
		fn = /** @type {() => Promise<T>} */ (fn_or_options);
		options = /** @type {{ transport?: Transport<T> }} */ (maybe_options);
	} else {
		if (hydratable_key === null) {
			throw new Error(
				'TODO error: `hydratable` must be called synchronously within `cache` in order to omit the key'
			);
		} else {
			key = hydratable_key;
		}
		fn = /** @type {() => Promise<T>} */ (key_or_fn);
		options = /** @type {{ transport?: Transport<T> }} */ (fn_or_options);
	}
	const store = get_render_store();

	if (store.hydratables.has(key)) {
		// TODO error
		throw new Error("can't have two hydratables with the same key");
	}

	const result = fn();
	store.hydratables.set(key, { value: result, transport: options.transport });
	return Promise.resolve(result);
}

/** @type {RenderContext | null} */
export let sync_store = null;

/** @param {RenderContext | null} store */
export function set_sync_store(store) {
	sync_store = store;
}

/** @type {AsyncLocalStorage<RenderContext | null> | null} */
let als = null;

import('node:async_hooks')
	.then((hooks) => (als = new hooks.AsyncLocalStorage()))
	.catch(() => {
		// can't use ALS but can still use manual context preservation
		return null;
	});

/** @returns {RenderContext | null} */
function try_get_render_store() {
	return sync_store ?? als?.getStore() ?? null;
}

/** @returns {RenderContext} */
export function get_render_store() {
	const store = try_get_render_store();

	if (!store) {
		// TODO make this a proper e.error
		let message = 'Could not get rendering context.';

		if (als) {
			message += ' This is an internal error.';
		} else {
			message +=
				' In environments without `AsyncLocalStorage`, `hydratable` must be accessed synchronously, not after an `await`.' +
				' If it was accessed synchronously then this is an internal error.';
		}

		throw new Error(message);
	}

	return store;
}

/**
 * @template T
 * @param {RenderContext} store
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
export function with_render_store(store, fn) {
	try {
		sync_store = store;
		const storage = als;
		return storage ? storage.run(store, fn) : fn();
	} finally {
		sync_store = null;
	}
}
