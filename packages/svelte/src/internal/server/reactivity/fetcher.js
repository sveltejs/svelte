/** @import { GetRequestInit, Resource } from '#shared' */
import { fetch_json } from '../../shared/utils.js';
import { hydratable } from '../hydratable.js';
import { cache } from './cache';
import { resource } from './resource.js';

/**
 * @template TReturn
 * @param {string | URL} url
 * @param {GetRequestInit} [init]
 * @returns {Resource<TReturn>}
 */
export function fetcher(url, init) {
	return cache(`svelte/fetcher::::${typeof url === 'string' ? url : url.toString()}`, () =>
		resource(() => hydratable(() => fetch_json(url, init)))
	);
}
