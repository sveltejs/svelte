/** @import { StandardSchemaV1 } from '@standard-schema/spec' */
/** @import { Transport } from '#shared' */
import { uneval } from 'devalue';
import { hydratable } from '../internal/server/context.js';

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

/** @type {Map<string, Resource<any>>} */
// TODO scope to render, clear after render
const cache = new Map();

/**
 * @template TReturn
 * @template {unknown[]} [TArgs=[]]
 * @template {typeof Resource} [TResource=typeof Resource]
 * @param {string} name
 * @param {(...args: TArgs) => TReturn} fn
 * @param {{ Resource?: TResource, transport?: Transport }} [options]
 * @returns {(...args: TArgs) => Resource<TReturn>}
 */
export function defineResource(name, fn, options = {}) {
	const ResolvedResource = options?.Resource ?? Resource;
	return (...args) => {
		const stringified_args = (options.transport?.stringify ?? JSON.stringify)(args);
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

/**
 * @template {Record<string, unknown>} TPathParams
 * @typedef {{ searchParams?: ConstructorParameters<typeof URLSearchParams>[0], pathParams?: TPathParams } & RequestInit} FetcherInit
 */
/**
 * @template TReturn
 * @template {Record<string, unknown>} TPathParams
 * @typedef {(init: FetcherInit<TPathParams>) => Resource<TReturn>} Fetcher
 */

/**
 * @template {Record<string, unknown>} TPathParams
 * @template {typeof Resource} TResource
 * @overload
 * @param {string} url
 * @param {{ Resource?: TResource, schema?: undefined }} [options] - TODO what options should we support?
 * @returns {Fetcher<string | number | Record<string, unknown> | unknown[] | boolean | null, TPathParams>} - TODO this return type has to be gnarly unless we do schema validation, as it could be any JSON value (including string, number, etc)
 */
/**
 * @template {Record<string, unknown>} TPathParams
 * @template {StandardSchemaV1} TSchema
 * @template {typeof Resource} TResource
 * @overload
 * @param {string} url
 * @param {{ Resource?: TResource, schema: StandardSchemaV1 }} options
 * @returns {Fetcher<StandardSchemaV1.InferOutput<TSchema>, TPathParams>} - TODO this return type has to be gnarly unless we do schema validation, as it could be any JSON value (including string, number, etc)
 */
/**
 * @template {Record<string, unknown>} TPathParams
 * @template {typeof Resource} TResource
 * @template {StandardSchemaV1} TSchema
 * @param {string} url
 * @param {{ Resource?: TResource, schema?: StandardSchemaV1 }} [options]
 */
export function createFetcher(url, options) {
	const raw_pathname = url.split('//')[1].match(/(\/[^?#]*)/)?.[1] ?? '';
	const populate_path = compile(raw_pathname);
	/**
	 * @param {Parameters<Fetcher<any, any>>[0]} args
	 * @returns {Promise<any>}
	 */
	const fn = async (args) => {
		const cloned_url = new URL(url);
		const new_params = new URLSearchParams(args.searchParams);
		const combined_params = new URLSearchParams([...cloned_url.searchParams, ...new_params]);
		cloned_url.search = combined_params.toString();
		cloned_url.pathname = populate_path(args.pathParams ?? {}); // TODO we definitely should get rid of this lib for launch, I just wanted to play with the API
		// TODO how to populate path params
		const resp = await fetch(cloned_url, args);
		if (!resp.ok) {
			throw new Error(`Fetch error: ${resp.status} ${resp.statusText}`);
		}
		const json = await resp.json();
		if (options?.schema) {
			return options.schema['~standard'].validate(json);
		}
		return json;
	};
	return createResource(url.toString(), fn, options);
}
