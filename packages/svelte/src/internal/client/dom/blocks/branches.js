/** @import { Effect, TemplateNode } from '#client' */
import { Batch, current_batch } from '../../reactivity/batch.js';
import { branch, pause_effect, resume_effect } from '../../reactivity/effects.js';
import { create_text, should_defer_append } from '../operations.js';

/**
 * @typedef {{ effect: Effect, fragment: DocumentFragment }} Branch
 */

/**
 * @template Key
 */
export class BranchManager {
	/** @type {TemplateNode} */
	#anchor;

	/** @type {Map<Batch, Key>} */
	#batches = new Map();

	/** @type {Map<Key, Effect>} */
	#onscreen = new Map();

	/** @type {Map<Key, Branch>} */
	#offscreen = new Map();

	/**
	 *
	 * @param {TemplateNode} anchor
	 */
	constructor(anchor) {
		this.#anchor = anchor;
	}

	#commit = () => {
		var batch = /** @type {Batch} */ (current_batch);
		var key = /** @type {Key} */ (this.#batches.get(batch));

		var onscreen = this.#onscreen.get(key);

		if (onscreen) {
			// effect is already in the DOM — abort any current outro
			resume_effect(onscreen);
		} else {
			// effect is currently offscreen. put it in the DOM
			var offscreen = this.#offscreen.get(key);
			if (!offscreen) throw new Error('This should never happen!');

			this.#onscreen.set(key, offscreen.effect);
			this.#offscreen.delete(key);

			// remove the anchor...
			/** @type {TemplateNode} */ (offscreen.fragment.lastChild).remove();

			// ...and append the fragment
			this.#anchor.before(offscreen.fragment);
		}

		this.#batches.delete(batch);

		for (const [k, e] of this.#onscreen) {
			if (k === key) continue;

			pause_effect(e, () => {
				// TODO if this needed by a pending batch, move the effect to
				// a fragment and put it on this.#offscreen

				this.#onscreen.delete(k);
			});
		}
	};

	/**
	 *
	 * @param {any} key
	 * @param {(target: TemplateNode) => void} fn
	 */
	ensure(key, fn) {
		if (should_defer_append()) {
			var batch = /** @type {Batch} */ (current_batch);

			if (!this.#onscreen.has(key) && !this.#offscreen.has(key)) {
				var fragment = document.createDocumentFragment();
				var target = create_text();

				fragment.append(target);

				this.#offscreen.set(key, {
					effect: branch(() => fn(target)),
					fragment
				});
			}

			this.#batches.set(batch, key);

			batch.add_callback(this.#commit);
		} else {
			this.#onscreen.set(
				key,
				branch(() => fn(this.#anchor))
			);
		}
	}
}
