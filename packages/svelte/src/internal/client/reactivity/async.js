/** @import { Effect, Value } from '#client' */

import { DESTROYED } from '#client/constants';
import { DEV } from 'esm-env';
import { component_context, is_runes, set_component_context } from '../context.js';
import { get_pending_boundary } from '../dom/blocks/boundary.js';
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
	current_async_effect,
	derived,
	derived_safe_equal,
	set_from_async_derived
} from './deriveds.js';

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
	var boundary = get_pending_boundary();

	Promise.all(async.map((expression) => async_derived(expression)))
		.then((result) => {
			batch?.activate();

			restore();

			try {
				fn([...sync.map(d), ...result]);
			} catch (error) {
				// ignore errors in blocks that have already been destroyed
				if ((parent.f & DESTROYED) === 0) {
					invoke_error_boundary(error, parent);
				}
			}

			batch?.deactivate();
			unset_context();
		})
		.catch((error) => {
			boundary.error(error);
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

	return function restore() {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);

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

export function unset_context() {
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);
	if (DEV) set_from_async_derived(null);
}
