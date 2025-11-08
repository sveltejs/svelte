/** @import { Resource as ResourceType } from '#shared' */
export { SvelteDate } from './date.js';
export { SvelteSet } from './set.js';
export { SvelteMap } from './map.js';
export { SvelteURL } from './url.js';
export { SvelteURLSearchParams } from './url-search-params.js';
export { MediaQuery } from './media-query.js';
export { createSubscriber } from './create-subscriber.js';
export { resource } from '../internal/client/reactivity/resource.js';
export { ReactiveCache } from '../internal/client/reactivity/cache.js';
export { fetcher } from '../internal/client/reactivity/fetcher.js';

/**
 * @template T
 * @typedef {ResourceType<T>} Resource
 */
