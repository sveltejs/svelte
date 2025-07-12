/** @import { Effect, Value } from '#client' */

import { DESTROYED } from '#client/constants';
import { is_runes } from '../context.js';
import { capture, get_pending_boundary } from '../dom/blocks/boundary.js';
import { invoke_error_boundary } from '../error-handling.js';
import { active_effect } from '../runtime.js';
import { current_batch } from './batch.js';
import { async_derived, derived, derived_safe_equal } from './deriveds.js';

/**
 *
 * @param {Array<() => any>} sync
 * @param {Array<() => Promise<any>>} async
 * @param {(values: Value[]) => any} fn
 */
export function flatten(sync, async, fn) {
	const d = is_runes() ? derived : derived_safe_equal;

	if (async.length > 0) {
		var batch = current_batch;
		var parent = /** @type {Effect} */ (active_effect);

		var restore = capture();

		var boundary = get_pending_boundary();

		Promise.all(async.map((expression) => async_derived(expression)))
			.then((result) => {
				if ((parent.f & DESTROYED) !== 0) return;

				batch?.activate();

				restore();

				try {
					fn([...sync.map(d), ...result]);
				} catch (error) {
					invoke_error_boundary(error, parent);
				}

				batch?.deactivate();
			})
			.catch((error) => {
				boundary.error(error);
			});
	} else {
		fn(sync.map(d));
	}
}
