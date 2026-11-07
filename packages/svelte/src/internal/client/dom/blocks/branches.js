/** @import { Effect, TemplateNode } from '#client' */
/** @import { Batch, TeardownContext } from '../../reactivity/batch.js' */
import {
	current_batch,
	eager_block_effects,
	set_teardown_context,
	teardown_context
} from '../../reactivity/batch.js';
import { active_effect } from '../../runtime.js';
import {
	branch,
	destroy_effect,
	move_effect,
	pause_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { DIRTY, HMR_ANCHOR } from '../../constants.js';
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
	 * Per-batch teardown contexts, for the edge case in which block effects are
	 * triggered from `flush_queued_effects` with partial teardown contexts
	 * @type {Map<Batch, TeardownContext | null> | null}
	 */
	#teardown_contexts = null;

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
	 * @param {Batch} batch
	 * @param {boolean} commit
	 */
	#resolve = (batch, commit) => {
		var context = this.#teardown_contexts?.get(batch);
		var fn = commit ? this.#commit : this.#discard;

		if (context) {
			var previous = teardown_context;

			// the view may have cached deriveds before writes that its `reverted_values` doesn't
			// include, so evaluate them afresh
			context.derived_cache.clear();
			set_teardown_context(context);

			try {
				fn(batch);
			} finally {
				set_teardown_context(previous);
				/** @type {Map<Batch, TeardownContext>} */ (this.#teardown_contexts).delete(batch);
			}
		} else {
			fn(batch);
		}
	};

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

		// other batches can still commit (in any order), so their selections remain
		this.#discard(batch);

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

			if (this.#transition || !onscreen) {
				this.#outroing.add(k);
				pause_effect(effect, on_destroy, false);
			} else {
				on_destroy();
			}
		}
	};

	/**
	 * @param {Batch} batch
	 */
	#discard = (batch) => {
		for (const b of this.#batches.keys()) {
			// (batches that were merged into another one don't select anything anymore)
			if (b === batch || !b.linked) this.#batches.delete(b);
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

		if (eager_block_effects !== null) {
			// We came here from `flush_queued_effects`: don't create the branch yet, but
			// remember the partial teardown view this run sees
			(this.#teardown_contexts ??= new Map()).set(batch, teardown_context);
		}

		if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) {
			if (eager_block_effects !== null) {
				// come back here when the newly-created batch is processed
				batch.schedule(/** @type {Effect} */ (active_effect), DIRTY);
			} else if (defer) {
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

			batch.oncommit((batch) => this.#resolve(batch, true));
			batch.ondiscard((batch) => this.#resolve(batch, false));
		} else {
			if (hydrating) {
				this.anchor = hydrate_node;
			}

			// use the teardown view saved by an eager run, if there is one: in non-async
			// mode, the branch is created and committed here rather than when the batch
			// commits, but its teardowns should still see that view
			// TODO when we remove non-async mode this can just be `this.#commit(batch)`
			this.#resolve(batch, true);
		}
	}
}
