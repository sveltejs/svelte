/** @import { Derived, Effect, Source } from '#client' */

import { UNINITIALIZED } from '../../../constants';
import { EFFECT_PRESERVED, IS_PENDING } from '../constants';
import { active_effect, captured_signals, get, handle_error } from '../runtime';
import { derived } from './deriveds';
import { block } from './effects';
import { internal_set, source } from './sources';

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

	/** @param {() => Promise<T>} fn */
	constructor(fn) {
		let parent = /** @type {Effect | null} */ (active_effect);

		if (parent === null) {
			throw new Error('TODO cannot create resources outside of an effect');
		}

		/** @type {{}} */
		var current_token;

		this.#current.f ^= IS_PENDING;
		this.#fn = derived(() => Promise.resolve(fn()));

		block(() => {
			var current = this.#current;
			if ((current.f & IS_PENDING) === 0) {
				current.f ^= IS_PENDING;
			}
			var token = (current_token = {});
			internal_set(this.#pending, true);

			get(this.#fn).then(
				(value) => {
					if (current_token !== token) return;
					internal_set(this.#current, value);
					internal_set(this.#pending, false);
					this.#current.f ^= IS_PENDING;
					return value;
				},
				(error) => {
					if (current_token !== token) return;
					internal_set(this.#pending, false);
					throw error;
				}
			).catch((e) => {
				handle_error(e, parent, null, parent.ctx);
			});
		}, EFFECT_PRESERVED);
	}

	get pending() {
		return get(this.#pending);
	}

	get current() {
		var value = get(this.#current);

		if (captured_signals !== null) {
			get(this.#fn);
		}

		if (value === UNINITIALIZED) {
			return this.#fn.v;
		}

		return value;
	}

	get latest() {
		var current = this.#current;
		var value = get(current);
		var promise = get(this.#fn);

		if ((current.f & IS_PENDING) === 0) {
			return value;
		}

		return promise;
	}
}
