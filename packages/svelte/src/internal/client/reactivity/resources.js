/** @import { Derived, Effect, Source } from '#client' */

import { UNINITIALIZED } from '../../../constants.js';
import { EFFECT_PRESERVED } from '../constants.js';
import { active_effect, get, handle_error } from '../runtime.js';
import { derived } from './deriveds.js';
import { block } from './effects.js';
import { internal_set, source } from './sources.js';

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

	get latest() {
		var value = get(this.#current);
		get(this.#pending);

		if (value === UNINITIALIZED) {
			throw new Error('Resource is not yet resolved, ensure it is awaited');
		}

		return value;
	}

	/**
	 * @param {(arg0: { readonly current: T; readonly pending: boolean; readonly latest: T; }) => void} onfulfilled
	 * @param {((reason: any) => PromiseLike<never>) | null | undefined} onrejected
	 */
	then(onfulfilled, onrejected) {
		return get(this.#fn).then(() => {
			var self = this;
			onfulfilled({
				get current() { return self.current },
				get pending() { return self.pending },
				get latest() { return self.latest }
			});
		}, onrejected);
	}
}
