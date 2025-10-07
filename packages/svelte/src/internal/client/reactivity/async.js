/** @import { Effect, Value } from '#client' */

import { DESTROYED } from '#client/constants';
import { DEV } from 'esm-env';
import { component_context, is_runes, set_component_context } from '../context.js';
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
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	set_hydrate_node,
	set_hydrating,
	skip_nodes
} from '../dom/hydration.js';

/**
 *
 * @param {Array<() => any>} sync
 * @param {Array<() => Promise<any>>} async
 * @param {(values: Value[]) => any} fn
 */
export function flatten(sync, async, fn) {
	const d = is_runes() ? derived : derived_safe_equal;

	if (async.length === 0) {
		fn(sync.map(d));
		return;
	}

	var batch = current_batch;
	var parent = /** @type {Effect} */ (active_effect);

	var restore = capture();

	var was_hydrating = hydrating;

	Promise.all(async.map((expression) => async_derived(expression)))
		.then((result) => {
			restore();

			try {
				fn([...sync.map(d), ...result]);
			} catch (error) {
				// ignore errors in blocks that have already been destroyed
				if ((parent.f & DESTROYED) === 0) {
					invoke_error_boundary(error, parent);
				}
			}

			if (was_hydrating) {
				set_hydrating(false);
			}

			batch?.deactivate();
			unset_context();
		})
		.catch((error) => {
			invoke_error_boundary(error, parent);
		});
}

/**
 * Captures the current effect context so that we can restore it after
 * some asynchronous work has happened (so that e.g. `await a + b`
 * causes `b` to be registered as a dependency).
 */
function capture() {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;
	var previous_batch = current_batch;

	var was_hydrating = hydrating;

	if (was_hydrating) {
		var previous_hydrate_node = hydrate_node;
	}

	return function restore() {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);
		previous_batch?.activate();

		if (was_hydrating) {
			set_hydrating(true);
			set_hydrate_node(previous_hydrate_node);
		}

		if (DEV) {
			set_from_async_derived(null);
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
	if (DEV) set_from_async_derived(null);
}

/**
 * @param {() => Promise<void>} fn
 */
export async function async_body(fn) {
	var boundary = get_boundary();
	var batch = /** @type {Batch} */ (current_batch);
	var pending = boundary.is_pending();

	boundary.update_pending_count(1);
	if (!pending) batch.increment();

	var active = /** @type {Effect} */ (active_effect);

	var was_hydrating = hydrating;
	var next_hydrate_node = undefined;

	if (was_hydrating) {
		hydrate_next();
		next_hydrate_node = skip_nodes(false);
	}

	try {
		var promise = fn();
	} finally {
		if (next_hydrate_node) {
			set_hydrate_node(next_hydrate_node);
			hydrate_next();
		}
	}

	try {
		await promise;
	} catch (error) {
		if (!aborted(active)) {
			invoke_error_boundary(error, active);
		}
	} finally {
		if (was_hydrating) {
			set_hydrating(false);
		}

		boundary.update_pending_count(-1);

		if (pending) {
			batch.flush();
		} else {
			batch.decrement();
		}

		unset_context();
	}
}
