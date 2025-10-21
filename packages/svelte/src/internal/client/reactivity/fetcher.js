/** @import { StandardSchemaV1 } from '@standard-schema/spec' */
import { cache } from './cache';

/**
 * @template {StandardSchemaV1} TSchema
 * @param {{ schema?: TSchema, url: string | URL, init?: RequestInit }} args
 * @param {string} [key]
 */
async function fetcher_impl({ schema, url, init }, key) {
	const response = await fetch(url, init);
	if (!response.ok) {
		throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
	}
	if (schema) {
		const data = await response.json();
		return schema['~standard'].validate(data);
	}
	return response.json();
}

const cached_fetch = cache('svelte/fetcher', fetcher_impl, {
	hash: (arg) => {
		return `${typeof arg.url === 'string' ? arg.url : arg.url.toString()}}`;
	}
});

/**
 * @template {StandardSchemaV1} TSchema
 * @overload
 * @param {{ schema: TSchema, url: string | URL, init?: RequestInit }} arg
 * @returns {Promise<StandardSchemaV1.InferOutput<TSchema>>}
 */
/**
 * @overload
 * @param {{ schema?: undefined, url: string | URL, init?: RequestInit }} arg
 * @returns {Promise<any>}
 */
/**
 * @template {StandardSchemaV1} TSchema
 * @param {{ schema?: TSchema, url: string | URL, init?: RequestInit }} arg
 */
export function fetcher(arg) {
	return cached_fetch(arg);
}
