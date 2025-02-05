/** @import { Derived, Effect, Source } from '#client' */

import { UNINITIALIZED } from '../../../constants.js';
import { is_array } from '../../shared/utils.js';
import { EFFECT_PRESERVED } from '../constants.js';
import { getContext, setContext } from '../context.js';
import { active_effect, get, handle_error, untrack } from '../runtime.js';
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
						if (current_token !== token) return;
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

	get current() {
		var value = get(this.#current);

		if (value === UNINITIALIZED) {
			throw new Error('Resource is not yet resolved, ensure it is awaited');
		}

		return value;
	}

	/**
	 * @param {(arg0: { readonly current: T; readonly latest: T; }) => void} onfulfilled
	 * @param {((reason: any) => PromiseLike<never>) | null | undefined} onrejected
	 */
	then(onfulfilled, onrejected) {
		return get(this.#fn).then(() => {
			var self = this;
			onfulfilled({
				get current() {
					return get(self.#current);
				},
				get latest() {
					get(self.#fn);
					return get(self.#current);
				}
			});
		}, onrejected);
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

/**
 * @template T, V
 * @param {Resource<T> | Resource<T>[]} resources
 * @param {() => V} fn
 */
export function deferPending(resources, fn) {
	const res = is_array(resources) ? resources : [resources];

	for (let i = 0; i < res.length; i += 1) {
		const resource = res[i];
		const pending = untrack(() => resource.pending);
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		resource.current;
		if (pending) {
			break;
		}
	}
	return untrack(fn);
}
