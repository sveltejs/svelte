/** @import { Effect, TemplateNode, Value } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js' */
import { async_derived } from '../../reactivity/deriveds.js';
import { current_batch } from '../../reactivity/batch.js';
import { active_effect, schedule_effect } from '../../runtime.js';
import { capture, get_pending_boundary } from './boundary.js';

/**
 * @param {TemplateNode} node
 * @param {Array<() => Promise<any>>} expressions
 * @param {(anchor: TemplateNode, ...deriveds: Value[]) => void} fn
 */
export function async(node, expressions, fn) {
	// TODO handle hydration

	var batch = /** @type {Batch} */ (current_batch);
	var effect = /** @type {Effect} */ (active_effect);
	var boundary = get_pending_boundary(effect);

	var restore = capture();

	boundary.increment();

	Promise.all(expressions.map((fn) => async_derived(fn))).then((result) => {
		batch?.restore();

		restore();
		fn(node, ...result);

		// TODO is this necessary?
		schedule_effect(effect);

		batch?.flush();
		boundary.decrement();
	});
}
