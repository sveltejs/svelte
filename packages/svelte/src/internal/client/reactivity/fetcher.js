/** @import { GetRequestInit, Resource } from '#shared' */
import { cache } from './cache';
import { fetch_json } from '../../shared/utils.js';
import { hydratable } from '../hydratable';
import { resource } from './resource';

/**
 * @template TReturn
 * @param {string | URL} url
 * @param {GetRequestInit} [init]
 * @returns {Resource<TReturn>}
 */
export function fetcher(url, init) {
	const key = `svelte/fetcher/${typeof url === 'string' ? url : url.toString()}`;
	return cache(key, () => resource(() => hydratable(key, () => fetch_json(url, init))));
}
