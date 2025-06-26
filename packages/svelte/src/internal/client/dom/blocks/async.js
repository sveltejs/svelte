/** @import { Effect, TemplateNode, Value } from '#client' */
import { DESTROYED } from '#client/constants';
import { async_derived } from '../../reactivity/deriveds.js';
import { active_effect, get } from '../../runtime.js';
import { capture, get_pending_boundary } from './boundary.js';

/**
 * @param {TemplateNode} node
 * @param {Array<() => Promise<any>>} expressions
 * @param {(anchor: TemplateNode, ...deriveds: Value[]) => void} fn
 */
export async function async(node, expressions, fn) {
	// TODO handle hydration

	var parent = /** @type {Effect} */ (active_effect);

	var restore = capture();
	var boundary = get_pending_boundary();

	boundary.update_pending_count(1);

	try {
		const deriveds = await Promise.all(expressions.map((fn) => async_derived(fn)));

		// get deriveds eagerly to avoid creating blocks if they reject
		for (const d of deriveds) get(d);

		if ((parent.f & DESTROYED) !== 0) return;

		restore();
		fn(node, ...deriveds);
	} catch (error) {
		boundary.error(error);
	} finally {
		boundary.update_pending_count(-1);
	}
}
