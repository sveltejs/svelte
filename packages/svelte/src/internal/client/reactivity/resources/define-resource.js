/** @import { Transport } from '#shared' */
import { hydratable } from '../../context.js';
import { tick } from '../../runtime.js';
import { render_effect } from '../effects.js';
import { Resource } from './resource.js';

/** @typedef {{ count: number, resource: Resource<any> }} Entry */
/** @type {Map<string, Entry>} */
const cache = new Map();

/**
 * @template TReturn
 * @template {unknown[]} [TArgs=[]]
 * @template {typeof Resource} [TResource=typeof Resource]
 * @param {string} name
 * @param {(...args: TArgs) => TReturn} fn
 * @param {{ Resource?: TResource, transport?: Transport, hash?: (args: TArgs) => string }} [options]
 * @returns {(...args: TArgs) => Resource<TReturn>}
 */
export function define_resource(name, fn, options = {}) {
	const ResolvedResource = options?.Resource ?? Resource;
	return (...args) => {
		const stringified_args = (options.hash ?? JSON.stringify)(args);
		const cache_key = `${name}:${stringified_args}`;
		let entry = cache.get(cache_key);
		const maybe_remove = create_remover(cache_key);

		let tracking = true;
		try {
			render_effect(() => {
				if (entry) entry.count++;
				return () => {
					const entry = cache.get(cache_key);
					if (!entry) return;
					entry.count--;
					maybe_remove(entry, cache);
				};
			});
		} catch {
			tracking = false;
		}

		let resource = entry?.resource;
		if (!resource) {
			resource = new ResolvedResource(() =>
				hydratable(cache_key, () => fn(...args), { transport: options.transport })
			);
			const entry = {
				resource,
				count: tracking ? 1 : 0
			};
			cache.set(cache_key, entry);

			resource.then(
				() => maybe_remove(entry, cache),
				() => maybe_remove(entry, cache)
			);
		}

		return resource;
	};
}

/**
 * @param {string} key
 */
function create_remover(key) {
	/**
	 * @param {Entry | undefined} entry
	 * @param {Map<string, Entry>} cache
	 */
	return (entry, cache) =>
		tick().then(() => {
			if (!entry?.count && entry === cache.get(key)) {
				cache.delete(key);
			}
		});
}
