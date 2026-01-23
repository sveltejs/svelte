/** @import { Blocker, TemplateNode, Value } from '#client' */
import { COMMENT_NODE } from '#client/constants';
import { HYDRATION_START, HYDRATION_START_ELSE } from '../../../../constants.js';
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
	if (expressions.length === 0 && blockers.every((b) => b.settled)) {
		fn(node);
		return;
	}

	var boundary = get_boundary();
	var batch = /** @type {Batch} */ (current_batch);
	var blocking = boundary.is_rendered();

	boundary.update_pending_count(1);
	batch.increment(blocking);

	var was_hydrating = hydrating;

	if (was_hydrating) {
		// Check if this is an `@html` block by looking at the current comment
		// `@html` uses a hash comment (not `[` or `[!`) with empty comment as end marker
		var is_html =
			hydrate_node.nodeType === COMMENT_NODE &&
			/** @type {Comment} */ (hydrate_node).data !== HYDRATION_START &&
			/** @type {Comment} */ (hydrate_node).data !== HYDRATION_START_ELSE;

		hydrate_next();

		var previous_hydrate_node = hydrate_node;
		var end = skip_nodes(false, is_html);
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
