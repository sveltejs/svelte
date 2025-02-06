/** @import { Derived, Effect, Source } from '#client' */

import { DEV } from 'esm-env';
import { UNINITIALIZED } from '../../../constants.js';
import { is_array } from '../../shared/utils.js';
import { EFFECT_PRESERVED } from '../constants.js';
import { getContext, setContext } from '../context.js';
import { active_effect, active_reaction, get, handle_error, untrack } from '../runtime.js';
import { derived } from './deriveds.js';
import { block } from './effects.js';
import { internal_set, source } from './sources.js';

const resource_symbol = Symbol('resource');

/**
 * @template T
 */
export class Resource {
	/** @type {Source<T>} */
	#current = source(/** @type {T} */ (UNINITIALIZED));
	/** @type {Derived<Promise<T>>} */
	#fn;
	/** @type {Source<boolean>} */
	#pending = source(true);

	/**
	 * @param {() => Promise<T>} fn
	 */
	constructor(fn) {
		let parent = /** @type {Effect | null} */ (active_effect);

		if (parent === null) {
			throw new Error('TODO cannot create resources outside of an effect');
		}

		/** @type {{}} */
		var current_token;

		this.#fn = derived(() => Promise.resolve(fn()));

		block(() => {
			var token = (current_token = {});
			internal_set(this.#pending, true);

			get(this.#fn)
				.then(
					(value) => {
						if (current_token !== token) {
							if (this.#current.v === UNINITIALIZED) {
								internal_set(this.#current, value);
							}
							return;
						}
						internal_set(this.#current, value);
						internal_set(this.#pending, false);
						return value;
					},
					(error) => {
						if (current_token !== token) return;
						internal_set(this.#pending, false);
						throw error;
					}
				)
				.catch((e) => {
					handle_error(e, parent, null, parent.ctx);
				});
		}, EFFECT_PRESERVED);
	}

	get pending() {
		return get(this.#pending);
	}

	get latest() {
		return get(this.#fn);
	}

	get current() {
		var value = get(this.#current);

		if (value === UNINITIALIZED) {
			throw new Error('Resource is not yet resolved, ensure it is awaited');
		}

		return value;
	}

	/**
	 * @param {(arg0: { readonly current: T; }) => void} onfulfilled
	 * @param {((reason: any) => PromiseLike<never>) | null | undefined} onrejected
	 */
	then(onfulfilled, onrejected) {
		return this.#fn.v.then(() => {
			var self = this;

			if (DEV) {
				onfulfilled({
					// @ts-ignore
					get latest() {
						throw new Error('Use `await resource.latest` instead of `(await resource).latest`');
					},
					get current() {
						return self.current;
					}
				});
			} else {
				onfulfilled({
					get current() {
						return self.current;
					}
				});
			}

		}, onrejected);
	}

	/**
	 * @template T, V
	 * @param {Resource<T> | Resource<T>[]} resources
	 * @param {() => V} fn
	 */
	static deferred(resources, fn) {
		const res = is_array(resources) ? resources : [resources];

		var deferred = derived(() => {
			var prev = /** @type {Derived} */ (active_reaction)?.v;

			for (let i = 0; i < res.length; i += 1) {
				const resource = res[i];
				const pending = untrack(() => resource.pending);

				get(resource.#current);

				if (pending) {
					if (prev !== UNINITIALIZED) {
						return prev;
					}
					return untrack(fn);
				}
			}
			return fn();
		});

		get(deferred);

		return {
			get current() {
				return get(deferred);
			}
		};
	}
}

/**
 * @template T
 * @returns {[set_resource: (resource: Resource<T>) => void, get_resource: () => Resource<T>]}
 */
export function createResourceContext() {
	const key = {};

	const set_resource = (/** @type {Resource<T>} */ resource) => {
		let resources = getContext(resource_symbol);

		if (resources === undefined) {
			resources = new Map();
			setContext(resource_symbol, resources);
		}
		resources.set(key, resource);
	};

	const get_resource = () => {
		var resource = getContext(resource_symbol)?.get(key);
		if (resource === undefined) {
			throw new Error('TODO: No resource found');
		}
		return resource;
	};

	return [set_resource, get_resource];
}
