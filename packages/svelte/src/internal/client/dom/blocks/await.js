/** @import { Effect, Source, TemplateNode } from '#client' */
import { is_promise } from '../../../shared/utils.js';
import { block } from '../../reactivity/effects.js';
import { internal_set, mutable_source, source } from '../../reactivity/sources.js';
import {
	hydrate_next,
	hydrating,
	skip_nodes,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { queue_micro_task } from '../task.js';
import { should_defer_append } from '../operations.js';
import { HYDRATION_START_ELSE, UNINITIALIZED } from '../../../../constants.js';
import { DESTROYED, EFFECT_PRESERVED } from '#client/constants';
import { is_runes } from '../../context.js';
import { Batch, current_batch, flushSync, is_flushing_sync } from '../../reactivity/batch.js';
import { BranchManager } from './branches.js';
import { capture, merge_target, unset_context } from '../../reactivity/async.js';
import { DEV } from 'esm-env';
import { active_effect } from '../../runtime.js';

const PENDING = 0;
const THEN = 1;
const CATCH = 2;

/** @typedef {typeof PENDING | typeof THEN | typeof CATCH} AwaitState */

/**
 * @template V
 * @param {TemplateNode} node
 * @param {(() => any)} get_input
 * @param {null | ((anchor: Node) => void)} pending_fn
 * @param {null | ((anchor: Node, value: Source<V>) => void)} then_fn
 * @param {null | ((anchor: Node, error: unknown) => void)} catch_fn
 * @returns {void}
 */
export function await_block(node, get_input, pending_fn, then_fn, catch_fn) {
	if (hydrating) {
		hydrate_next();
	}

	var runes = is_runes();

	var v = /** @type {V} */ (UNINITIALIZED);
	var value = runes ? source(v) : mutable_source(v, false, false);
	var error = runes ? source(v) : mutable_source(v, false, false);

	if (DEV) {
		value.label = '{#await ...} value';
		error.label = '{#await ...} error';
	}

	var branches = new BranchManager(node);

	/** The latest run of the block in the real world */
	var current = {};

	/**
	 * The latest run of the block in each fork that ran it. Once the fork is committed, that's a run of the real
	 * world (and so are its later runs), until a later run in the real world supersedes it (`null`)
	 * @type {Map<Batch, {} | null>}
	 */
	var forks = new Map();

	/** @param {Batch} batch */
	var settle = (batch) => {
		var run = forks.get(batch);
		if (batch.committed && run) current = run;
		forks.delete(batch);
	};

	/**
	 * @param {{}} run
	 * @param {Batch} batch
	 */
	var is_latest = (run, batch) => {
		if (forks.has(batch)) return forks.get(batch) === run;
		if (run !== current) return false;

		// a fork that was committed since supersedes it
		for (const [b, r] of forks) {
			if (!b.is_fork && r !== null) return false;
		}

		return true;
	};

	/**
	 * The batch that the states of a run in `batch` go into, if they aren't their own batch: the fork, so that they
	 * don't show before it's committed — and once it is, the batch it became, so that they land along with the rest
	 * of its changes while those are pending (its later runs, too: they replace the states it holds)
	 * @param {Batch} batch
	 */
	var owner = (batch) => {
		var target = merge_target(batch);
		return forks.has(batch) && target.linked && !target.committed ? target : null;
	};

	block(() => {
		var effect = /** @type {Effect} */ (active_effect);
		var batch = /** @type {Batch} */ (current_batch);
		var input = get_input();
		var run = {};

		// (not the first run, which creates the block for every batch's view, see `should_defer_append`)
		var fork = batch.is_fork && should_defer_append();

		if (fork || forks.has(batch)) {
			forks.set(batch, run);
			batch.oncommit(settle);
			batch.ondiscard(settle);
		}

		if (!fork) {
			for (const b of forks.keys()) {
				if (!b.is_fork && b !== batch) forks.set(b, null);
			}

			current = run;
		}

		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		// @ts-ignore coercing `node` to a `Comment` causes TypeScript and Prettier to fight
		let mismatch = hydrating && is_promise(input) === (node.data === HYDRATION_START_ELSE);

		if (mismatch) {
			// Hydration mismatch: remove everything inside the anchor and start fresh
			set_hydrate_node(skip_nodes());
			set_hydrating(false);
		}

		if (is_promise(input)) {
			var restore = capture();
			var resolved = false;

			/**
			 * @param {(set: (source: Source, value: any) => void) => void} fn
			 */
			const resolve = (fn) => {
				if ((effect.f & DESTROYED) !== 0 || !is_latest(run, batch)) return;

				resolved = true;

				var target = owner(batch);

				if (target !== null) {
					var previous = current_batch;
					restore(true, target);

					try {
						fn((source, v) => /** @type {Batch} */ (target).capture_result(source, v));
					} finally {
						unset_context(false);
						target.flush();
						if (previous?.linked) previous.activate();
					}

					return;
				}

				// We don't want to restore the previous batch here; {#await} blocks don't follow the async logic
				// we have elsewhere, instead pending/resolve/fail states are each their own batch so to speak.
				restore(false);
				// ...but it might still be set here. That means a `save(...)` has restored it — but that batch will
				// likely already have been committed by the time it resolves, and this resolve should be processed
				// in a separate batch. We're not using batch.deactivate()/activate() above because get_input()
				// could write to sources, which would then incorrectly create a new batch or could mess with
				// async_derived expecting a current_batch to exist.
				if (current_batch === batch) {
					batch.deactivate();
				}
				// Make sure we have a batch, since the branch manager expects one to exist
				Batch.ensure();

				try {
					fn(internal_set);
				} finally {
					unset_context(false);

					// without this, the DOM does not update until two ticks after the promise
					// resolves, which is unexpected behaviour (and somewhat irksome to test)
					if (!is_flushing_sync) flushSync();
				}
			};

			input.then(
				(v) => {
					resolve((set) => {
						set(value, v);
						branches.ensure(THEN, then_fn && ((target) => then_fn(target, value)));
					});
				},
				(e) => {
					resolve((set) => {
						set(error, e);
						branches.ensure(CATCH, catch_fn && ((target) => catch_fn(target, error)));

						if (!catch_fn) {
							// Rethrow the error if no catch block exists
							throw e;
						}
					});
				}
			);

			if (hydrating) {
				branches.ensure(PENDING, pending_fn);
			} else {
				// Wait a microtask before checking if we should show the pending state as
				// the promise might have resolved by then
				queue_micro_task(() => {
					if (!resolved) {
						resolve(() => {
							branches.ensure(PENDING, pending_fn);
						});
					}
				});
			}
		} else {
			if (owner(batch) === batch) batch.capture_result(value, input);
			else internal_set(value, input);

			branches.ensure(THEN, then_fn && ((target) => then_fn(target, value)));
		}

		if (mismatch) {
			// continue in hydration mode
			set_hydrating(true);
		}
	}, EFFECT_PRESERVED); // states are selected asynchronously: keep the effect even without dependencies
}
