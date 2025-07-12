/** @import { TemplateNode, Value } from '#client' */
import { flatten } from '../../reactivity/async.js';
import { get } from '../../runtime.js';
import { get_pending_boundary } from './boundary.js';

/**
 * @param {TemplateNode} node
 * @param {Array<() => Promise<any>>} expressions
 * @param {(anchor: TemplateNode, ...deriveds: Value[]) => void} fn
 */
export function async(node, expressions, fn) {
	var boundary = get_pending_boundary();

	boundary.update_pending_count(1);

	flatten([], expressions, (values) => {
		try {
			// get values eagerly to avoid creating blocks if they reject
			for (const d of values) get(d);

			fn(node, ...values);
		} finally {
			boundary.update_pending_count(-1);
		}
	});
}
