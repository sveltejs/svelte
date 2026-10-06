/** @import { Source, TemplateNode } from '#client' */
import { is_promise } from '../../../shared/utils.js';
import { block } from '../../reactivity/effects.js';
import { internal_set, mutable_source, source } from '../../reactivity/sources.js';
import {
	hydrate_next,
	hydrating,
	skip_nodes,
	set_hydrate_node,
	set_hydrating,
	hydrate_node
} from '../hydration.js';
import { queue_micro_task } from '../task.js';
import { should_defer_append } from '../operations.js';
import { HYDRATION_START_ELSE, UNINITIALIZED } from '../../../../constants.js';
import { ASYNC, DESTROYED, EFFECT_PRESERVED } from '#client/constants';
import { is_runes } from '../../context.js';
import { Batch, current_batch, flushSync, is_flushing_sync } from '../../reactivity/batch.js';
import { BranchManager } from './branches.js';
import { capture, unset_context } from '../../reactivity/async.js';
import { DEV } from 'esm-env';

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

	// The latest run of the block in the real world, and in each fork. A run is superseded
	// by later runs in the same world; a fork's run joins the real world once it is committed
	var current = {};
	/** @type {Map<Batch, {}>} */
	var forks = new Map();

	/** @param {Batch} batch */
	var settle = (batch) => {
		// committed (as opposed to discarded)?
		if (!batch.is_fork && forks.has(batch)) current = /** @type {{}} */ (forks.get(batch));
		forks.delete(batch);
	};

	var effect = block(() => {
		var batch = /** @type {Batch} */ (current_batch);
		var input = get_input();
		var run = {};

		// Like other async work, a fork's promise resolves into the fork, so that its pending/then/catch
		// state stays in the fork until it's committed — unless the block is terminal (has no dependencies),
		// in which case it can't re-run and is the same in every batch (see `should_defer_append`)
		var fork = should_defer_append() && batch.is_fork;

		if (fork) {
			forks.set(batch, run);
			batch.oncommit(settle);
			batch.ondiscard(settle);
		} else {
			current = run;
			// supersedes the runs of forks that have since been committed
			for (const b of forks.keys()) if (!b.is_fork) forks.delete(b);
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
			 * @param {() => void} fn
			 */
			const resolve = (fn) => {
				if ((effect.f & DESTROYED) !== 0 || (run !== current && forks.get(batch) !== run)) return;

				resolved = true;
				// a committed fork's run is now the real world's run (no-op for real runs)
				if (!batch.is_fork) current = run;

				// A fork's promise resolves into the fork — and once committed, into the batch the fork became (or was
				// merged into) while that is still pending, so that it lands along with the rest of the fork's state
				restore(fork);
				var pending = fork && /** @type {Batch} */ (current_batch).linked;

				if (!pending) {
					// Otherwise, we don't want to restore the previous batch here; {#await} blocks don't follow the async
					// logic we have elsewhere, instead pending/resolve/fail states are each their own batch so to speak.
					// ...but it might still be set here. That means a `save(...)` has restored it — but that batch will
					// likely already have been committed by the time it resolves, and this resolve should be processed
					// in a separate batch. We're not using batch.deactivate()/activate() above because get_input()
					// could write to sources, which would then incorrectly create a new batch or could mess with
					// async_derived expecting a current_batch to exist.
					if (fork || current_batch === batch) {
						current_batch?.deactivate();
					}
				}

				// Make sure we have a batch, since the branch manager expects one to exist
				var target = Batch.ensure();

				try {
					fn();
				} finally {
					unset_context(false);

					// without this, the DOM does not update until two ticks after the promise
					// resolves, which is unexpected behaviour (and somewhat irksome to test).
					// A pending batch is flushed directly, so that no other work runs while it is active
					if (pending) target.flush();
					else if (!is_flushing_sync) flushSync();
				}
			};

			input.then(
				(v) => {
					resolve(() => {
						internal_set(value, v);
						branches.ensure(THEN, then_fn && ((target) => then_fn(target, value)));
					});
				},
				(e) => {
					resolve(() => {
						internal_set(error, e);
						branches.ensure(CATCH, catch_fn && ((target) => catch_fn(target, error)));

						if (!catch_fn) {
							// Rethrow the error if no catch block exists (in a fork, `error.v` isn't it)
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
			internal_set(value, input);
			branches.ensure(THEN, then_fn && ((target) => then_fn(target, value)));
		}

		if (mismatch) {
			// continue in hydration mode
			set_hydrating(true);
		}
	}, EFFECT_PRESERVED); // branches are created asynchronously: keep the effect even without dependencies

	// Like the results of async deriveds, the value/error are those of the batch whose run produced
	// them: the real world writing them must not overtake a fork's own result (see `Batch#overtake`)
	value.e = error.e = effect;
	value.f |= ASYNC;
	error.f |= ASYNC;
}
