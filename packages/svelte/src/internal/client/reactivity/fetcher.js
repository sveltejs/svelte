/** @import { GetRequestInit, Resource } from '#shared' */
import { cache } from './cache';
import { fetch_json } from '../../shared/utils.js';
import { hydratable } from '../hydratable';
import { resource } from './resource';
import { async_mode_flag } from '../../flags';
import * as e from '../errors.js';

/**
 * @template TReturn
 * @param {string | URL} url
 * @param {GetRequestInit} [init]
 * @returns {Resource<TReturn>}
 */
export function fetcher(url, init) {
	if (!async_mode_flag) {
		e.experimental_async_required('fetcher');
	}

	const key = `svelte/fetcher/${typeof url === 'string' ? url : url.toString()}`;
	return cache(key, () => resource(() => hydratable(key, () => fetch_json(url, init))));
}
