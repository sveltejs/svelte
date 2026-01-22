/** @import { Blocker, Effect, Value } from '#client' */
import { DESTROYED, STALE_REACTION } from '#client/constants';
import { DEV } from 'esm-env';
import {
	component_context,
	dev_stack,
	is_runes,
	set_component_context,
	set_dev_stack
} from '../context.js';
import { get_boundary } from '../dom/blocks/boundary.js';
import { invoke_error_boundary } from '../error-handling.js';
import {
	active_effect,
	active_reaction,
	set_active_effect,
	set_active_reaction
} from '../runtime.js';
import { Batch, current_batch } from './batch.js';
import {
	async_derived,
	current_async_effect,
	derived,
	derived_safe_equal,
	set_from_async_derived
} from './deriveds.js';
import { aborted } from './effects.js';

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

	if (async.length === 0 && pending.length === 0) {
		fn(sync.map(d));
		return;
	}

	var batch = current_batch;
	var parent = /** @type {Effect} */ (active_effect);

	var restore = capture();
	var blocker_promise =
		pending.length === 1
			? pending[0].promise
			: pending.length > 1
				? Promise.all(pending.map((b) => b.promise))
				: null;

	/** @param {Value[]} values */
	function finish(values) {
		restore();

		try {
			fn(values);
		} catch (error) {
			if ((parent.f & DESTROYED) === 0) {
				invoke_error_boundary(error, parent);
			}
		}

		batch?.deactivate();
		unset_context();
	}

	// Fast path: blockers but no async expressions
	if (async.length === 0) {
		/** @type {Promise<any>} */ (blocker_promise).then(() => finish(sync.map(d)));
		return;
	}

	// Full path: has async expressions
	function run() {
		restore();
		Promise.all(async.map((expression) => async_derived(expression)))
			.then((result) => finish([...sync.map(d), ...result]))
			.catch((error) => invoke_error_boundary(error, parent));
	}

	if (blocker_promise) {
		blocker_promise.then(run);
	} else {
		run();
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
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;
	var previous_batch = current_batch;

	if (DEV) {
		var previous_dev_stack = dev_stack;
	}

	return function restore(activate_batch = true) {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);
		if (activate_batch) previous_batch?.activate();

		if (DEV) {
			set_from_async_derived(null);
			set_dev_stack(previous_dev_stack);
		}
	};
}

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
	var value = await promise;

	return () => {
		restore();
		return value;
	};
}

/**
 * Reset `current_async_effect` after the `promise` resolves, so
 * that we can emit `await_reactivity_loss` warnings
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<() => T>}
 */
export async function track_reactivity_loss(promise) {
	var previous_async_effect = current_async_effect;
	var value = await promise;

	return () => {
		set_from_async_derived(previous_async_effect);
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

	/** Whether the completion of the iterator was "normal", meaning it wasn't ended via `break` or a similar method */
	let normal_completion = false;
	try {
		while (true) {
			const { done, value } = (await track_reactivity_loss(iterator.next()))();
			if (done) {
				normal_completion = true;
				break;
			}
			yield value;
		}
	} finally {
		// If the iterator had a normal completion and `return` is defined on the iterator, call it and return the value
		if (normal_completion && iterator.return !== undefined) {
			// eslint-disable-next-line no-unsafe-finally
			return /** @type {TReturn} */ ((await track_reactivity_loss(iterator.return()))().value);
		}
	}
}

export function unset_context() {
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);

	if (DEV) {
		set_from_async_derived(null);
		set_dev_stack(null);
	}
}

/**
 * @param {Array<() => void | Promise<void>>} thunks
 */
export function run(thunks) {
	const restore = capture();

	var boundary = get_boundary();
	var batch = /** @type {Batch} */ (current_batch);
	var blocking = boundary.is_rendered();

	boundary.update_pending_count(1);
	batch.increment(blocking);

	var active = /** @type {Effect} */ (active_effect);

	/** @type {null | { error: any }} */
	var errored = null;

	/** @param {any} error */
	const handle_error = (error) => {
		errored = { error }; // wrap in object in case a promise rejects with a falsy value

		if (!aborted(active)) {
			invoke_error_boundary(error, active);
		}
	};

	var promise = Promise.resolve(thunks[0]()).catch(handle_error);

	/** @type {Blocker} */
	var blocker = { promise, settled: false };
	var blockers = [blocker];

	promise.finally(() => {
		blocker.settled = true;
	});

	for (const fn of thunks.slice(1)) {
		promise = promise
			.then(() => {
				if (errored) {
					throw errored.error;
				}

				if (aborted(active)) {
					throw STALE_REACTION;
				}

				restore();
				return fn();
			})
			.catch(handle_error);

		const blocker = { promise, settled: false };
		blockers.push(blocker);

		promise.finally(() => {
			blocker.settled = true;

			unset_context();
			current_batch?.deactivate();
		});
	}

	promise
		// wait one more tick, so that template effects are
		// guaranteed to run before `$effect(...)`
		.then(() => Promise.resolve())
		.finally(() => {
			boundary.update_pending_count(-1);
			batch.decrement(blocking);
		});

	return blockers;
}

/**
 * @param {Blocker[]} blockers
 */
export function wait(blockers) {
	return Promise.all(blockers.map((b) => b.promise));
}
