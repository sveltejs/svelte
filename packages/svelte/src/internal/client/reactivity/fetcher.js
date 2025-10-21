/** @import { GetRequestInit, Resource } from '#shared' */
import { cache } from './cache';
import { fetch_json } from '../../shared/utils.js';
import { hydratable } from '../context';
import { resource } from './resource';

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
