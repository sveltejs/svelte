/** @import { Effect, TemplateNode } from '#client' */
import { is_runes } from '../../context.js';
import { Batch, current_batch } from '../../reactivity/batch.js';
import {
	branch,
	destroy_effect,
	move_effect,
	pause_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { set_should_intro, should_intro } from '../../render.js';
import { hydrate_node, hydrating } from '../hydration.js';
import { create_text, should_defer_append } from '../operations.js';

/**
 * @typedef {{ effect: Effect, fragment: DocumentFragment }} Branch
 */

/**
 * @template Key
 */
export class BranchManager {
	/** @type {TemplateNode} */
	anchor;

	/** @type {Map<Batch, Key>} */
	#batches = new Map();

	/** @type {Map<Key, Effect>} */
	#onscreen = new Map();

	/** @type {Map<Key, Branch>} */
	#offscreen = new Map();

	/**
	 * Whether to pause (i.e. outro) on change, or destroy immediately.
	 * This is necessary for `<svelte:element>`
	 */
	#transition = true;

	/**
	 * @param {TemplateNode} anchor
	 * @param {boolean} transition
	 */
	constructor(anchor, transition = true) {
		this.anchor = anchor;
		this.#transition = transition;
	}

	#commit = () => {
		var batch = /** @type {Batch} */ (current_batch);

		// if this batch was made obsolete, bail
		if (!this.#batches.has(batch)) return;

		var key = /** @type {Key} */ (this.#batches.get(batch));

		var onscreen = this.#onscreen.get(key);

		if (onscreen) {
			// effect is already in the DOM — abort any current outro
			resume_effect(onscreen);
		} else {
			// effect is currently offscreen. put it in the DOM
			var offscreen = this.#offscreen.get(key);

			if (offscreen) {
				this.#onscreen.set(key, offscreen.effect);
				this.#offscreen.delete(key);

				// remove the anchor...
				/** @type {TemplateNode} */ (offscreen.fragment.lastChild).remove();

				// ...and append the fragment
				this.anchor.before(offscreen.fragment);
				onscreen = offscreen.effect;
			}
		}

		for (const [b, k] of this.#batches) {
			this.#batches.delete(b);

			if (b === batch) {
				// keep values for newer batches
				break;
			}

			const offscreen = this.#offscreen.get(k);

			if (offscreen) {
				// for older batches, destroy offscreen effects
				// as they will never be committed
				destroy_effect(offscreen.effect);
				this.#offscreen.delete(k);
			}
		}

		// outro/destroy all onscreen effects...
		for (const [k, effect] of this.#onscreen) {
			// ...except the one that was just committed
			if (k === key) continue;

			const on_destroy = () => {
				const keys = Array.from(this.#batches.values());

				if (keys.includes(k)) {
					// keep the effect offscreen, as another batch will need it
					var fragment = document.createDocumentFragment();
					move_effect(effect, fragment);

					fragment.append(create_text()); // TODO can we avoid this?

					this.#offscreen.set(k, { effect, fragment });
				} else {
					destroy_effect(effect);
				}

				this.#onscreen.delete(k);
			};

			if (this.#transition || !onscreen) {
				pause_effect(effect, on_destroy, false);
			} else {
				on_destroy();
			}
		}
	};

	/**
	 *
	 * @param {any} key
	 * @param {null | ((target: TemplateNode) => void)} fn
	 */
	ensure(key, fn) {
		var batch = /** @type {Batch} */ (current_batch);
		var defer = should_defer_append();

		if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) {
			if (defer) {
				var fragment = document.createDocumentFragment();
				var target = create_text();

				fragment.append(target);

				this.#offscreen.set(key, {
					effect: branch(() => fn(target)),
					fragment
				});
			} else {
				this.#onscreen.set(
					key,
					branch(() => fn(this.anchor))
				);
			}
		}

		this.#batches.set(batch, key);

		if (defer) {
			for (const [k, effect] of this.#onscreen) {
				if (k === key) {
					batch.skipped_effects.delete(effect);
				} else {
					batch.skipped_effects.add(effect);
				}
			}

			for (const [k, branch] of this.#offscreen) {
				if (k === key) {
					batch.skipped_effects.delete(branch.effect);
				} else {
					batch.skipped_effects.add(branch.effect);
				}
			}

			batch.add_callback(this.#commit);
		} else {
			if (hydrating) {
				this.anchor = hydrate_node;
			}

			this.#commit();
		}
	}
}
