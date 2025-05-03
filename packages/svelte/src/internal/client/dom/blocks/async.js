/** @import { Effect, TemplateNode, Value } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js' */
import { async_derived } from '../../reactivity/deriveds.js';
import { current_batch } from '../../reactivity/batch.js';
import { active_effect, schedule_effect } from '../../runtime.js';
import { capture } from './boundary.js';

/**
 * @param {TemplateNode} node
 * @param {Array<() => Promise<any>>} expressions
 * @param {(anchor: TemplateNode, ...deriveds: Value[]) => void} fn
 */
export function async(node, expressions, fn) {
	// TODO handle hydration

	var batch = /** @type {Batch} */ (current_batch);
	var effect = /** @type {Effect} */ (active_effect);

	var restore = capture();

	let boundary = effect.b;

	while (boundary !== null && !boundary.has_pending_snippet()) {
		boundary = boundary.parent;
	}

	if (boundary === null) {
		throw new Error('TODO cannot create async derived outside a boundary with a pending snippet');
	}

	boundary.increment();

	Promise.all(expressions.map((fn) => async_derived(fn))).then((result) => {
		batch.run(() => {
			restore();
			fn(node, ...result);

			// TODO is this necessary?
			schedule_effect(effect);
		});

		boundary.decrement();
	});
}
