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

	Promise.all(expressions.map((fn) => async_derived(fn))).then((result) => {
		restore();
		fn(node, ...result);

		batch.run(() => {
			schedule_effect(effect);
		});
	});
}
