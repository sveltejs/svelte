/** @import { StandardSchemaV1 } from '@standard-schema/spec' */
/** @import { Transport } from '#shared' */
import { uneval } from 'devalue';
import { get_render_store, hydratable } from '../internal/server/context.js';

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
 * @template T
 * @implements {Partial<Promise<T>>}
 */
export class Resource {
	/** @type {Promise<void>} */
	#promise;
	#ready = false;
	#loading = true;

	/** @type {T | undefined} */
	#current = undefined;
	#error = undefined;

	/**
	 * @param {() => Promise<T>} fn
	 */
	constructor(fn) {
		this.#promise = Promise.resolve(fn()).then(
			(val) => {
				this.#ready = true;
				this.#loading = false;
				this.#current = val;
				this.#error = undefined;
			},
			(error) => {
				this.#error = error;
				this.#loading = false;
			}
		);
	}

	get then() {
		// @ts-expect-error
		return (onfulfilled, onrejected) =>
			this.#promise.then(
				() => onfulfilled?.(this.#current),
				() => onrejected?.(this.#error)
			);
	}

	get catch() {
		return (/** @type {any} */ onrejected) => this.then(undefined, onrejected);
	}

	get finally() {
		return (/** @type {any} */ onfinally) => this.then(onfinally, onfinally);
	}

	get current() {
		return this.#current;
	}

	get error() {
		return this.#error;
	}

	/**
	 * Returns true if the resource is loading or reloading.
	 */
	get loading() {
		return this.#loading;
	}

	/**
	 * Returns true once the resource has been loaded for the first time.
	 */
	get ready() {
		return this.#ready;
	}

	refresh = () => {
		throw new Error('TODO Cannot refresh a resource on the server');
	};

	/**
	 * @param {T} value
	 */
	set = (value) => {
		this.#ready = true;
		this.#loading = false;
		this.#error = undefined;
		this.#current = value;
		this.#promise = Promise.resolve();
	};
}

/**
 * @template TReturn
 * @template {unknown[]} [TArgs=[]]
 * @template {typeof Resource} [TResource=typeof Resource]
 * @param {string} name
 * @param {(...args: TArgs) => TReturn} fn
 * @param {{ Resource?: TResource, transport?: Transport, hash?: (args: TArgs) => string }} [options]
 * @returns {(...args: TArgs) => Resource<TReturn>}
 */
export function defineResource(name, fn, options = {}) {
	const ResolvedResource = options?.Resource ?? Resource;
	return (...args) => {
		const cache = get_render_store().resources;
		const stringified_args = (options.hash ?? JSON.stringify)(args);
		const cache_key = `${name}:${stringified_args}`;
		const entry = cache.get(cache_key);
		if (entry) {
			return entry;
		}
		const resource = new ResolvedResource(() =>
			hydratable(cache_key, () => fn(...args), { transport: options.transport })
		);
		cache.set(cache_key, resource);
		return resource;
	};
}
