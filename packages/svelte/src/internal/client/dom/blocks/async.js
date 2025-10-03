/** @import { TemplateNode, Value } from '#client' */
import { flatten } from '../../reactivity/async.js';
import { get } from '../../runtime.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	set_hydrate_node,
	set_hydrating,
	skip_nodes
} from '../hydration.js';
import { get_boundary } from './boundary.js';

/**
 * @param {TemplateNode} node
 * @param {Array<() => Promise<any>>} expressions
 * @param {(anchor: TemplateNode, ...deriveds: Value[]) => void} fn
 */
export function async(node, expressions, fn) {
	var boundary = get_boundary();

	boundary.update_pending_count(1);

	var was_hydrating = hydrating;

	if (was_hydrating) {
		hydrate_next();

		var previous_hydrate_node = hydrate_node;
		var end = skip_nodes(false);
		set_hydrate_node(end);
	}

	flatten([], expressions, (values) => {
		if (was_hydrating) {
			set_hydrating(true);
			set_hydrate_node(previous_hydrate_node);
		}

		try {
			// get values eagerly to avoid creating blocks if they reject
			for (const d of values) get(d);

			fn(node, ...values);
		} finally {
			boundary.update_pending_count(-1);
		}

		if (was_hydrating) {
			set_hydrating(false);
		}
	});
}
