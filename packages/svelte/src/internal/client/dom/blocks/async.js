/** @import { TemplateNode, Value } from '#client' */

import { async_derived } from '../../reactivity/deriveds.js';
import { capture, suspend } from './boundary.js';

/**
 * @param {TemplateNode} node
 * @param {Array<() => Promise<any>>} expressions
 * @param {(anchor: TemplateNode, ...deriveds: Value[]) => void} fn
 */
export function async(node, expressions, fn) {
	// TODO handle hydration

	var restore = capture();
	var unsuspend = suspend();

	Promise.all(expressions.map((fn) => async_derived(fn))).then((result) => {
		restore();
		fn(node, ...result);
		unsuspend();
	});
}
