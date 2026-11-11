/** @import { Blocker, Collector, Effect, Source, Value } from '#client' */
/** @import { Batch } from './batch.js' */
import { DESTROYED, STALE_REACTION } from '#client/constants';
import { DEV } from 'esm-env';
import {
	component_context,
	dev_stack,
	is_runes,
	set_component_context,
	set_dev_stack
} from '../context.js';
import { invoke_error_boundary } from '../error-handling.js';
import {
	active_effect,
	active_reaction,
	set_active_effect,
	set_active_reaction
} from '../runtime.js';
import { current_batch } from './batch.js';
import {
	async_derived,
	reactivity_loss_tracker,
	derived,
	derived_safe_equal,
	set_reactivity_loss_tracker
} from './deriveds.js';
import { aborted } from './effects.js';
import { deferred } from '../../shared/utils.js';

/**
 * @param {Blocker[]} blockers
 * @param {Array<() => any>} sync
 * @param {Array<() => Promise<any>>} async
 * @param {(values: Value[]) => any} fn
 */
export function flatten(blockers, sync, async, fn) {
	const d = is_runes() ? derived : derived_safe_equal;

	// Filter out already-settled blockers - no need to wait for them
	var pending = blockers.filter((b) => !b.settled);

	var deriveds = sync.map(d);

	if (DEV) {
		deriveds.forEach((d, i) => {
			// TODO this is kinda useful for debugging but a lousy implementation —
			// maybe the compiler could pass through the template string
			d.label = sync[i]
				.toString()
				.replace('() => ', '')
				.replaceAll('$.eager(() => ', '$state.eager(')
				.replace(/\$\.get\((.+?)\)/g, (_, id) => id);
		});
	}

	if (async.length === 0 && pending.length === 0) {
		fn(deriveds);
		return;
	}

	var parent = /** @type {Effect} */ (active_effect);
	var collector = collector_for();

	var restore = capture();
	var blocker_promise =
		pending.length === 1
			? pending[0].promise
			: pending.length > 1
				? Promise.all(pending.map((b) => b.promise))
				: null;

	/**
	 * Create the content, in the view of the batch whose results the async deriveds resolved with
	 * @param {Source[]} async
	 */
	function finish(async) {
		if ((parent.f & DESTROYED) === 0) {
			restore(true, collector.batch);

			try {
				fn([...deriveds, ...async]);
			} catch (error) {
				invoke_error_boundary(error, parent);
			}

			unset_context();
		}

		done(collector);
	}

	var decrement_pending = increment_pending();

	// Fast path: blockers but no async expressions
	if (async.length === 0) {
		/** @type {Promise<any>} */ (blocker_promise)
			.then(() => {
				resume();
				finish([]);
			})
			.finally(decrement_pending);
		return;
	}

	// Full path: has async expressions
	function run() {
		Promise.all(collect(collector, () => async.map((expression) => async_derived(expression))))
			.then(finish)
			.catch((error) => invoke_error_boundary(error, parent))
			.finally(decrement_pending);
	}

	if (blocker_promise) {
		blocker_promise.then(() => {
			if ((parent.f & DESTROYED) !== 0) {
				done(collector);
				decrement_pending();
				return;
			}

			resume();
			restore(true, collector.batch);
			run();
			unset_context();
		});
	} else {
		run();
	}

	/** continue in the batch that the code of the script that the blockers belong to continued in */
	function resume() {
		for (const blocker of pending) {
			if (blocker.collector) collector.batch = blocker.collector.batch;
		}
	}
}

/**
 * @param {Blocker[]} blockers
 * @param {(values: Value[]) => any} fn
 */
export function run_after_blockers(blockers, fn) {
	flatten(blockers, [], [], fn);
}

/**
 * Captures the current effect context so that we can restore it after
 * some asynchronous work has happened (so that e.g. `await a + b`
 * causes `b` to be registered as a dependency).
 */
export function capture() {
	var previous_effect = /** @type {Effect} */ (active_effect);
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;
	var previous_batch = /** @type {Batch} */ (current_batch);

	if (DEV) {
		var previous_dev_stack = dev_stack;
	}

	/**
	 * @param {boolean} [activate_batch]
	 * @param {Batch | null} [batch] the batch to continue in, if not the one that was active before
	 */
	return function restore(activate_batch = true, batch = previous_batch) {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);

		if (activate_batch && (previous_effect.f & DESTROYED) === 0) {
			// TODO we only need optional chaining here because `{#await ...}` blocks
			// are anomalous. Once we retire them we can get rid of it
			batch?.activate();
		}

		if (DEV) {
			set_reactivity_loss_tracker(null);
			set_dev_stack(previous_dev_stack);
		}
	};
}

/** `true` between a `save` thunk restoring a context and the end of that synchronous segment */
var restored = false;

/**
 * Wraps an `await` expression in such a way that the effect context that was
 * active before the expression evaluated can be reapplied afterwards —
 * `await a + b` becomes `(await $.save(a))() + b`
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<() => T>}
 */
export async function save(promise) {
	var restore = capture();
	// the context restored by an earlier `save` in this expression must not
	// outlive the synchronous segment that is about to end at this `await`
	unsave();
	var value = await promise;

	return () => {
		restore();
		restored = true;
		return value;
	};
}

/**
 * Unset the context if a `save` thunk restored it in the current synchronous segment,
 * so that a foreign microtask can never run inside a restored reaction context.
 * Called at every suspension point, and at the end of async expression bodies —
 * `async () => (await $.save(a))().b` becomes `async () => { try { return (await $.save(a))().b; } finally { $.unsave(); } }`
 * @template T
 * @param {T} [value]
 * @returns {T}
 */
export function unsave(value) {
	if (restored) unset_context();
	return /** @type {T} */ (value);
}

/**
 * Reset `current_async_effect` after the `promise` resolves, so
 * that we can emit `await_reactivity_loss` warnings
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<() => T>}
 */
export async function track_reactivity_loss(promise) {
	unsave();
	var previous_reactivity_loss_tracker = reactivity_loss_tracker;
	// Ensure that unrelated reads after an async operation is kicked off don't cause false positives
	queueMicrotask(() => {
		if (reactivity_loss_tracker === previous_reactivity_loss_tracker) {
			set_reactivity_loss_tracker(null);
		}
	});

	var value = await promise;

	return () => {
		set_reactivity_loss_tracker(previous_reactivity_loss_tracker);
		// While this can result in false negatives it also guards against the more important
		// false positives that would occur if this is the last in a chain of async operations,
		// and the reactivity_loss_tracker would then stay around until the next async operation happens.
		queueMicrotask(() => {
			if (reactivity_loss_tracker === previous_reactivity_loss_tracker) {
				set_reactivity_loss_tracker(null);
			}
		});

		return value;
	};
}

/**
 * Used in `for await` loops in DEV, so
 * that we can emit `await_reactivity_loss` warnings
 * after each `async_iterator` result resolves and
 * after the `async_iterator` return resolves (if it runs)
 * @template T
 * @template TReturn
 * @param {Iterable<T> | AsyncIterable<T>} iterable
 * @returns {AsyncGenerator<T, TReturn | undefined>}
 */
export async function* for_await_track_reactivity_loss(iterable) {
	// This is based on the algorithms described in ECMA-262:
	// ForIn/OfBodyEvaluation
	// https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-runtime-semantics-forin-div-ofbodyevaluation-lhs-stmt-iterator-lhskind-labelset
	// AsyncIteratorClose
	// https://tc39.es/ecma262/multipage/abstract-operations.html#sec-asynciteratorclose

	/** @type {AsyncIterator<T, TReturn>} */
	// @ts-ignore
	const iterator = iterable[Symbol.asyncIterator]?.() ?? iterable[Symbol.iterator]?.();

	if (iterator === undefined) {
		throw new TypeError('value is not async iterable');
	}

	// eslint-disable-next-line no-useless-assignment
	let invoke_return = true;

	try {
		while (true) {
			const { done, value } = (await track_reactivity_loss(iterator.next()))();
			if (done) {
				invoke_return = false;
				break;
			}
			var prev = reactivity_loss_tracker;
			try {
				yield value;
			} catch (e) {
				set_reactivity_loss_tracker(prev);
				// If the yield throws, we need to call `return` but not return its value, instead rethrow
				if (iterator.return !== undefined) {
					(await track_reactivity_loss(iterator.return()))();
				}
				throw e;
			}
			set_reactivity_loss_tracker(prev);
		}
	} catch (error) {
		invoke_return = false;
		throw error;
	} finally {
		// If the iterator had an abrupt completion (break) and `return` is defined on the iterator, call it and return the value
		if (invoke_return && iterator.return !== undefined) {
			// eslint-disable-next-line no-unsafe-finally
			return /** @type {TReturn} */ ((await track_reactivity_loss(iterator.return()))().value);
		}
	}
}

export function unset_context(deactivate_batch = true) {
	restored = false;
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);
	if (deactivate_batch) current_batch?.deactivate();

	if (DEV) {
		set_reactivity_loss_tracker(null);
		set_dev_stack(null);
	}
}

/**
 * @param {Array<() => void | Promise<void>>} thunks
 */
export function run(thunks) {
	const restore = capture();

	const decrement_pending = increment_pending();

	var active = /** @type {Effect} */ (active_effect);
	var collector = collector_for();

	/**
	 * Continue with `fn`, in the view of the batch whose results the async deriveds awaited so far resolved
	 * with — collecting the async deriveds that it creates
	 * @param {() => any} fn
	 */
	function step(fn) {
		restore(true, collector.batch);

		try {
			if (errored) throw errored.error;
			if (aborted(active)) throw STALE_REACTION;
			var result = collect(collector, fn);
		} finally {
			// Unset context before awaiting the result, which may itself restore it
			unset_context();
		}

		return result;
	}

	/** @type {null | { error: any }} */
	var errored = null;

	/** @param {any} error */
	const handle_error = (error) => {
		errored = { error }; // wrap in object in case a promise rejects with a falsy value

		if (!aborted(active)) {
			invoke_error_boundary(error, active);
		}
	};

	var promise = Promise.resolve(collect(collector, thunks[0])).catch(handle_error);

	var blockers = thunks.map((fn, i) => {
		if (i > 0) {
			promise = promise.then(() => step(fn)).catch(handle_error);
		}

		const blocker = { promise, settled: false, collector };

		promise.finally(() => {
			blocker.settled = true;
			// We also need to unset after a promise has resolved in case it restores our context
			unset_context();
		});

		return blocker;
	});

	promise
		// wait one more tick, so that template effects are
		// guaranteed to run before `$effect(...)`
		.then(() => Promise.resolve())
		.finally(() => {
			done(collector);
			decrement_pending();
		});

	return blockers;
}

/**
 * The content that the executing code creates, which awaits the async deriveds that it creates (see `run`, `flatten`).
 * It's created in the view of the batch whose results they resolved with, typically the one that started creating it
 * (see `async_derived`). Until it exists, the other batches that ran them can't commit, as they'd commit it without
 * the content. Afterwards, they re-validate it in their own views
 * @type {Collector | null}
 */
export let async_collected = null;

/** @returns {Collector} */
function collector_for() {
	return { batch: current_batch, created: deferred() };
}

/**
 * Call `fn`, collecting the async deriveds that it creates in `collector`
 * @template T
 * @param {Collector | null} collector
 * @param {() => T} fn
 * @returns {T}
 */
function collect(collector, fn) {
	var previous = async_collected;
	async_collected = collector;

	try {
		return fn();
	} finally {
		async_collected = previous;
	}
}

/**
 * The content was created (or destroyed)
 * @param {Collector} collector
 */
function done(collector) {
	collector.created?.resolve();
	collector.created = null;
}

/**
 * @param {Blocker[]} blockers
 */
export function wait(blockers) {
	return Promise.all(blockers.map((b) => b.promise));
}

/**
 * @param {boolean} [count] whether the work counts towards the pending work inside the boundary (see `$effect.pending()`)
 * @returns {(skip?: boolean) => void}
 */
export function increment_pending(count = true) {
	var effect = /** @type {Effect} */ (active_effect);
	var blocking = !!effect.b?.is_rendered();
	var boundary = count ? effect.b : null; // undefined if called outside the render tree, e.g. a standalone $effect.root
	var batch = merge_target(/** @type {Batch} */ (current_batch));

	boundary?.update_pending_count(1, batch);
	batch.increment(blocking, effect);

	return () => {
		batch = merge_target(batch);
		boundary?.update_pending_count(-1, batch);
		batch.decrement(blocking, effect);
	};
}

/**
 * The batch that `batch` was merged into, if any (transitively), else `batch` itself
 * @param {Batch} batch
 */
export function merge_target(batch) {
	while (batch.merged !== null) batch = batch.merged;
	return batch;
}
