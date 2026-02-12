/** @import { Blocker, TemplateNode, Value } from '#client' */
import { flatten } from '../../reactivity/async.js';
import { Batch, current_batch } from '../../reactivity/batch.js';
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
 * @param {Blocker[]} blockers
 * @param {Array<() => Promise<any>>} expressions
 * @param {(anchor: TemplateNode, ...deriveds: Value[]) => void} fn
 */
export function async(node, blockers = [], expressions = [], fn) {
	var was_hydrating = hydrating;
	var end = null;

	if (was_hydrating) {
		hydrate_next();
		end = skip_nodes(false);
	}

	if (expressions.length === 0 && blockers.every((b) => b.settled)) {
		fn(node);

		// This is necessary because it is not guaranteed that the render function will
		// advance the hydration node to $.async's end marker: it may stop at an inner
		// block's end marker (in case of an inner if block for example), but it also may
		// stop at the correct $.async end marker (in case of component child) - hence
		// we can't just use hydrate_next()
		// TODO this feels indicative of a bug elsewhere; ideally we wouldn't need
		// to double-traverse in the already-resolved case
		if (was_hydrating) {
			set_hydrate_node(end);
		}

		return;
	}

	var boundary = get_boundary();
	var batch = /** @type {Batch} */ (current_batch);
	var blocking = boundary.is_rendered();

	boundary.update_pending_count(1);
	batch.increment(blocking);

	if (was_hydrating) {
		var previous_hydrate_node = hydrate_node;
		set_hydrate_node(end);
	}

	flatten(blockers, [], expressions, (values) => {
		if (was_hydrating) {
			set_hydrating(true);
			set_hydrate_node(previous_hydrate_node);
		}

		try {
			// get values eagerly to avoid creating blocks if they reject
			for (const d of values) get(d);

			fn(node, ...values);
		} finally {
			if (was_hydrating) {
				set_hydrating(false);
			}

			boundary.update_pending_count(-1);
			batch.decrement(blocking);
		}
	});
}
