/** @import { Effect, TemplateNode, Value } from '#client' */

import { DESTROYED } from '../../constants.js';
import { async_derived } from '../../reactivity/deriveds.js';
import { active_effect } from '../../runtime.js';
import { capture, suspend } from './boundary.js';

/**
 * @param {TemplateNode} node
 * @param {Array<() => Promise<any>>} expressions
 * @param {(anchor: TemplateNode, ...deriveds: Value[]) => void} fn
 */
export function async(node, expressions, fn) {
	// TODO handle hydration

	var effect = /** @type {Effect} */ (active_effect);

	var restore = capture();
	var { unsuspend } = suspend();

	Promise.all(expressions.map((fn) => async_derived(fn))).then((result) => {
		restore();

		if ((effect.f & DESTROYED) !== 0) {
			return;
		}

		fn(node, ...result);
		unsuspend();
	});
}
