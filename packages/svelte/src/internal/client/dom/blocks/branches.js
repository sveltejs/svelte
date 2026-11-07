/** @import { Effect, TemplateNode } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js' */
import { current_batch, eager_block_effects } from '../../reactivity/batch.js';
import {
	branch,
	destroy_effect,
	move_effect,
	pause_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { HMR_ANCHOR } from '../../constants.js';
import { EFFECT_OFFSCREEN } from '#client/constants';
import { hydrate_node, hydrating } from '../hydration.js';
import { create_text, should_defer_append } from '../operations.js';
import { DEV } from 'esm-env';

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

	/**
	 * Map of keys to effects that are currently rendered in the DOM.
	 * These effects are visible and actively part of the document tree.
	 * Example:
	 * ```
	 * {#if condition}
	 * 	foo
	 * {:else}
	 * 	bar
	 * {/if}
	 * ```
	 * Can result in the entries `true->Effect` and `false->Effect`
	 * @type {Map<Key, Effect>}
	 */
	#onscreen = new Map();

	/**
	 * Similar to #onscreen with respect to the keys, but contains branches that are not yet
	 * in the DOM, because their insertion is deferred.
	 * @type {Map<Key, Branch>}
	 */
	#offscreen = new Map();

	/**
	 * Keys of effects that are currently outroing
	 * @type {Set<Key>}
	 */
	#outroing = new Set();

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

	/**
	 * Outro or destroy every onscreen branch except the one for `key`, keeping branches
	 * offscreen for other batches that select them. When a block re-runs eagerly, this
	 * takes the branches that it no longer selects out of the DOM before the rest of the
	 * flush runs their effects, while the branch it selects is committed by the batch
	 * @param {Batch} batch
	 * @param {Key} key
	 * @param {boolean} has_selected Whether the block has a branch for `key` (rather than selecting none)
	 * @param {boolean} [keep_batch] Whether `batch` still selects `key` and is yet to commit it
	 */
	#prune(batch, key, has_selected, keep_batch = false) {
		// other batches can still commit (in any order), so their selections remain
		this.#discard(batch, keep_batch);

		// outro/destroy all onscreen effects...
		for (const [k, effect] of this.#onscreen) {
			// ...except the one that was just committed
			//    or those that are already outroing (else the transition is aborted and the effect destroyed right away)
			if (k === key || this.#outroing.has(k)) continue;

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

				this.#outroing.delete(k);
				this.#onscreen.delete(k);
			};

			if (this.#transition || !has_selected) {
				this.#outroing.add(k);
				pause_effect(effect, on_destroy, false);
			} else {
				on_destroy();
			}
		}
	}

	/**
	 * @param {Batch} batch
	 */
	#commit = (batch) => {
		// if this batch was made obsolete, bail
		if (!this.#batches.has(batch)) return;

		var key = /** @type {Key} */ (this.#batches.get(batch));

		var onscreen = this.#onscreen.get(key);

		if (onscreen) {
			// effect is already in the DOM — abort any current outro
			resume_effect(onscreen);
			this.#outroing.delete(key);
		} else {
			// effect is currently offscreen. put it in the DOM
			var offscreen = this.#offscreen.get(key);

			if (offscreen) {
				// effect could have been outro'ed before through a prior batch — resume if necessary
				resume_effect(offscreen.effect);
				this.#onscreen.set(key, offscreen.effect);
				this.#offscreen.delete(key);

				if (DEV) {
					// Tell hmr.js about the anchor it should use for updates,
					// since the initial one will be removed
					/** @type {any} */ (offscreen.fragment.lastChild)[HMR_ANCHOR] = this.anchor;
				}

				// remove the anchor...
				/** @type {TemplateNode} */ (offscreen.fragment.lastChild).remove();

				// ...and append the fragment
				this.anchor.before(offscreen.fragment);
				onscreen = offscreen.effect;
				onscreen.f &= ~EFFECT_OFFSCREEN;
			}
		}

		this.#prune(batch, key, onscreen !== undefined);
	};

	/**
	 * @param {Batch} batch
	 * @param {boolean} [keep_batch] Whether `batch` still selects `key` and is yet to commit it
	 */
	#discard = (batch, keep_batch = false) => {
		for (const b of this.#batches.keys()) {
			// (batches that were merged into another one don't select anything anymore)
			if (!b.linked || (b === batch && !keep_batch)) this.#batches.delete(b);
		}

		const keys = Array.from(this.#batches.values());

		for (const [k, branch] of this.#offscreen) {
			if (!keys.includes(k)) {
				destroy_effect(branch.effect);
				this.#offscreen.delete(k);
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

				var effect = branch(() => fn(target));

				// until it is committed, the branch only exists for the batches that select it
				effect.f |= EFFECT_OFFSCREEN;
				batch.unskip_new_effect(effect);

				this.#offscreen.set(key, { effect, fragment });
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
					batch.unskip_effect(effect);
				} else {
					batch.skip_effect(effect);
				}
			}

			for (const [k, branch] of this.#offscreen) {
				if (k === key) {
					batch.unskip_effect(branch.effect);
				} else {
					batch.skip_effect(branch.effect);
				}
			}

			batch.oncommit(this.#commit);
			batch.ondiscard(this.#discard);

			if (eager_block_effects !== null) {
				// This run only exists to find out which branches the rest of the current flush must skip.
				// Removing those can't wait for the batch to commit: effects inside them would otherwise
				// run with values that the block no longer selects. The branch that was selected is
				// appended by the batch, like any other (see `should_defer_append`)
				this.#prune(batch, key, this.#onscreen.has(key) || this.#offscreen.has(key), true);
			}
		} else {
			if (hydrating) {
				this.anchor = hydrate_node;
			}

			this.#commit(batch);
		}
	}
}
