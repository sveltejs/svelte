/** @import { Blocker, Effect, TemplateNode, Value } from '#client' */
import { HYDRATION_ERROR } from '../../../../constants.js';
import { capture, flatten } from '../../reactivity/async.js';
import { destroy_effect } from '../../reactivity/effects.js';
import { active_effect, get } from '../../runtime.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	set_hydrate_node,
	set_hydrating,
	skip_nodes
} from '../hydration.js';
import { assign_nodes } from '../template.js';

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
		assign_nodes(node, end); // Necessary if this wraps the sole child of a block, else end marker can be wrong
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

	if (was_hydrating) {
		var previous_hydrate_node = hydrate_node;
		set_hydrate_node(end);
	}

	flatten(blockers, [], expressions, (values) => {
		var restore = capture();
		var parent = /** @type {Effect} */ (active_effect);
		var last = parent.last;

		if (was_hydrating) {
			set_hydrating(true);
			set_hydrate_node(previous_hydrate_node);
		}

		try {
			// get values eagerly to avoid creating blocks if they reject
			for (const d of values) get(d);

			fn(node, ...values);
		} catch (error) {
			// `hydrate(...)` can only recover from mismatches that happen synchronously,
			// so we recover from this one here, by discarding the server-rendered
			// content of this block and rendering it from scratch
			if (!was_hydrating || error !== HYDRATION_ERROR) {
				throw error;
			}

			// the mismatch may have interrupted a component, leaving its context active
			restore(false);

			var effect = last === null ? parent.first : last.next;

			while (effect !== null) {
				var next = effect.next;
				destroy_effect(effect, false);
				effect = next;
			}

			set_hydrate_node(previous_hydrate_node);
			var anchor = skip_nodes();

			set_hydrating(false);
			fn(anchor, ...values);
		} finally {
			if (was_hydrating) {
				set_hydrating(false);
			}
		}
	});
}
