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
const current_map = new WeakMap();

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
	 * @param {symbol} [symbol]
	 */
	constructor(fn, symbol) {
		let parent = /** @type {Effect | null} */ (active_effect);
		current_map.set(this, this.#current);

		if (parent === null) {
			throw new Error('TODO cannot create resources outside of an effect');
		}

		if (typeof symbol === 'symbol') {
			let resources = getContext(resource_symbol);

			if (resources === undefined) {
				resources = new Map();
				setContext(resource_symbol, resources);
			}
			resources.set(symbol, this);
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
					get(self.#pending);
					return get(self.#current);
				}
			});
		}, onrejected);
	}
}

/**
 * @template T
 * @param {symbol} symbol
 * @returns {Resource<T> | null}
 */
export function getResource(symbol) {
	return getContext(resource_symbol)?.get(symbol) ?? null;
}

/**
 * @template T
 * @template V
 * @param {Resource<T> | Resource<T>[]} resources
 * @param {() => V} fn
 */
export function deferPending(resources, fn) {
	const res = is_array(resources) ? resources : [resources];

	for (let i = 0; i < res.length; i += 1) {
		const resource = res[i];
		const pending = untrack(() => resource.pending);
		get(/** @type {Source} */ (current_map.get(resource)));
		if (pending) {
			break;
		}
	}
	return untrack(fn);
}
