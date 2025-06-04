/** @import { Effect, TemplateNode, Value } from '#client' */
import { DESTROYED } from '#client/constants';
import { async_derived } from '../../reactivity/deriveds.js';
import { active_effect } from '../../runtime.js';
import { capture, get_pending_boundary } from './boundary.js';

/**
 * @param {TemplateNode} node
 * @param {Array<() => Promise<any>>} expressions
 * @param {(anchor: TemplateNode, ...deriveds: Value[]) => void} fn
 */
export function async(node, expressions, fn) {
	// TODO handle hydration

	var parent = /** @type {Effect} */ (active_effect);

	var restore = capture();
	var boundary = get_pending_boundary();

	boundary.increment();

	Promise.all(expressions.map((fn) => async_derived(fn))).then((result) => {
		if ((parent.f & DESTROYED) !== 0) return;

		restore();
		fn(node, ...result);

		boundary.decrement();
	});
}
