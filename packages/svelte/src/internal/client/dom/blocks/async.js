/** @import { Effect, TemplateNode, Value } from '#client' */
/** @import { Fork } from '../../reactivity/forks.js' */
import { async_derived } from '../../reactivity/deriveds.js';
import { active_fork } from '../../reactivity/forks.js';
import { active_effect, schedule_effect } from '../../runtime.js';
import { capture } from './boundary.js';

/**
 * @param {TemplateNode} node
 * @param {Array<() => Promise<any>>} expressions
 * @param {(anchor: TemplateNode, ...deriveds: Value[]) => void} fn
 */
export function async(node, expressions, fn) {
	// TODO handle hydration

	var fork = /** @type {Fork} */ (active_fork);
	var effect = /** @type {Effect} */ (active_effect);

	var restore = capture();

	Promise.all(expressions.map((fn) => async_derived(fn))).then((result) => {
		restore();
		fn(node, ...result);

		fork.run(() => {
			schedule_effect(effect);
		});
	});
}
