/** @import { Resource } from './resource.js' */
/** @import { StandardSchemaV1 } from '@standard-schema/spec' */

import { compile } from 'path-to-regexp';
import { create_resource } from './create-resource.js';

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
export function create_fetcher(url, options) {
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
	return create_resource(url.toString(), fn, options);
}
