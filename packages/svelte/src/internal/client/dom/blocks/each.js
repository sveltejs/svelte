/** @import { TemplateNode } from '#client' */
import {
	EACH_INDEX_REACTIVE,
	EACH_IS_ANIMATED,
	EACH_IS_CONTROLLED,
	EACH_IS_STRICT_EQUALS,
	EACH_ITEM_REACTIVE,
	EACH_KEYED,
	HYDRATION_END,
	HYDRATION_START_ELSE
} from '../../../../constants.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	remove_nodes,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { clear_text_content, empty } from '../operations.js';
import {
	block,
	branch,
	destroy_effect,
	run_out_transitions,
	pause_children,
	pause_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { source, mutable_source, set } from '../../reactivity/sources.js';
import { is_array, is_frozen } from '../../../shared/utils.js';
import { INERT, STATE_FROZEN_SYMBOL, STATE_SYMBOL } from '../../constants.js';
import { queue_micro_task } from '../task.js';
import { current_effect } from '../../runtime.js';

/**
 * The row of a keyed each block that is currently updating. We track this
 * so that `animate:` directives have something to attach themselves to
 * @type {import('#client').EachItem | null}
 */
export let current_each_item = null;

/** @param {import('#client').EachItem | null} item */
export function set_current_each_item(item) {
	current_each_item = item;
}

/**
 * @param {any} _
 * @param {number} i
 */
export function index(_, i) {
	return i;
}

/**
 * Pause multiple effects simultaneously, and coordinate their
 * subsequent destruction. Used in each blocks
 * @param {import('#client').EachState} state
 * @param {import('#client').EachItem[]} items
 * @param {null | Node} controlled_anchor
 * @param {Map<any, import("#client").EachItem>} items_map
 */
function pause_effects(state, items, controlled_anchor, items_map) {
	/** @type {import('#client').TransitionManager[]} */
	var transitions = [];
	var length = items.length;

	for (var i = 0; i < length; i++) {
		pause_children(items[i].e, transitions, true);
	}

	var is_controlled = length > 0 && transitions.length === 0 && controlled_anchor !== null;
	// If we have a controlled anchor, it means that the each block is inside a single
	// DOM element, so we can apply a fast-path for clearing the contents of the element.
	if (is_controlled) {
		var parent_node = /** @type {Element} */ (
			/** @type {Element} */ (controlled_anchor).parentNode
		);
		clear_text_content(parent_node);
		parent_node.append(/** @type {Element} */ (controlled_anchor));
		items_map.clear();
		link(state, items[0].prev, items[length - 1].next);
	}

	run_out_transitions(transitions, () => {
		for (var i = 0; i < length; i++) {
			var item = items[i];
			if (!is_controlled) {
				items_map.delete(item.k);
				link(state, item.prev, item.next);
			}
			destroy_effect(item.e, !is_controlled);
		}
	});
}

/**
 * @template V
 * @param {Element | Comment} node The next sibling node, or the parent node if this is a 'controlled' block
 * @param {number} flags
 * @param {() => V[]} get_collection
 * @param {(value: V, index: number) => any} get_key
 * @param {(anchor: Node, item: import('#client').MaybeSource<V>, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
	var anchor = node;

	/** @type {import('#client').EachState} */
	var state = { flags, items: new Map(), first: null };

	var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;

	if (is_controlled) {
		var parent_node = /** @type {Element} */ (node);

		anchor = hydrating
			? set_hydrate_node(/** @type {Comment | Text} */ (parent_node.firstChild))
			: parent_node.appendChild(empty());
	}

	if (hydrating) {
		hydrate_next();
	}

	/** @type {import('#client').Effect | null} */
	var fallback = null;

	block(() => {
		var collection = get_collection();

		var array = is_array(collection)
			? collection
			: collection == null
				? []
				: Array.from(collection);

		var length = array.length;

		// If we are working with an array that isn't proxied or frozen, then remove strict equality and ensure the items
		// are treated as reactive, so they get wrapped in a signal.
		var flags = state.flags;
		if (
			(flags & EACH_IS_STRICT_EQUALS) !== 0 &&
			!is_frozen(array) &&
			!(STATE_FROZEN_SYMBOL in array) &&
			!(STATE_SYMBOL in array)
		) {
			flags ^= EACH_IS_STRICT_EQUALS;

			// Additionally if we're in an keyed each block, we'll need ensure the items are all wrapped in signals.
			if ((flags & EACH_KEYED) !== 0 && (flags & EACH_ITEM_REACTIVE) === 0) {
				flags ^= EACH_ITEM_REACTIVE;
			}
		}

		/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			var is_else = /** @type {Comment} */ (anchor).data === HYDRATION_START_ELSE;

			if (is_else !== (length === 0)) {
				// hydration mismatch — remove the server-rendered DOM and start over
				anchor = remove_nodes();

				set_hydrate_node(anchor);
				set_hydrating(false);
				mismatch = true;
			}
		}

		// this is separate to the previous block because `hydrating` might change
		if (hydrating) {
			/** @type {import('#client').EachItem | null} */
			var prev = null;

			/** @type {import('#client').EachItem} */
			var item;

			for (var i = 0; i < length; i++) {
				if (
					hydrate_node.nodeType === 8 &&
					/** @type {Comment} */ (hydrate_node).data === HYDRATION_END
				) {
					// The server rendered fewer items than expected,
					// so break out and continue appending non-hydrated items
					anchor = /** @type {Comment} */ (hydrate_node);
					mismatch = true;
					set_hydrating(false);
					break;
				}

				var value = array[i];
				var key = get_key(value, i);
				item = create_item(hydrate_node, state, prev, null, value, key, i, render_fn, flags);
				state.items.set(key, item);

				prev = item;
			}

			// remove excess nodes
			if (length > 0) {
				set_hydrate_node(remove_nodes());
			}
		}

		if (!hydrating) {
			reconcile(array, state, anchor, render_fn, flags, get_key);
		}

		if (fallback_fn !== null) {
			if (length === 0) {
				if (fallback) {
					resume_effect(fallback);
				} else {
					fallback = branch(() => fallback_fn(anchor));
				}
			} else if (fallback !== null) {
				pause_effect(fallback, () => {
					fallback = null;
				});
			}
		}

		if (mismatch) {
			// continue in hydration mode
			set_hydrating(true);
		}
	});

	if (hydrating) {
		anchor = hydrate_node;
	}
}

/**
 * @template V
 * @param {Array<V>} array
 * @param {import('#client').EachState} state
 * @param {Element | Comment | Text} anchor
 * @param {(anchor: Node, item: import('#client').MaybeSource<V>, index: number | import('#client').Source<number>) => void} render_fn
 * @param {number} flags
 * @param {(value: V, index: number) => any} get_key
 * @returns {void}
 */
function reconcile(array, state, anchor, render_fn, flags, get_key) {
	var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
	var should_update = (flags & (EACH_ITEM_REACTIVE | EACH_INDEX_REACTIVE)) !== 0;

	var length = array.length;
	var items = state.items;
	var first = state.first;
	var current = first;

	/** @type {Set<import('#client').EachItem>} */
	var seen = new Set();

	/** @type {import('#client').EachItem | null} */
	var prev = null;

	/** @type {Set<import('#client').EachItem>} */
	var to_animate = new Set();

	/** @type {import('#client').EachItem[]} */
	var matched = [];

	/** @type {import('#client').EachItem[]} */
	var stashed = [];

	/** @type {V} */
	var value;

	/** @type {any} */
	var key;

	/** @type {import('#client').EachItem | undefined} */
	var item;

	/** @type {number} */
	var i;

	if (is_animated) {
		for (i = 0; i < length; i += 1) {
			value = array[i];
			key = get_key(value, i);
			item = items.get(key);

			if (item !== undefined) {
				item.a?.measure();
				to_animate.add(item);
			}
		}
	}

	for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);
		item = items.get(key);

		if (item === undefined) {
			var child_anchor = current
				? /** @type {import('#client').EffectNodes} */ (current.e.nodes).start
				: anchor;

			prev = create_item(
				child_anchor,
				state,
				prev,
				prev === null ? state.first : prev.next,
				value,
				key,
				i,
				render_fn,
				flags
			);

			items.set(key, prev);

			matched = [];
			stashed = [];

			current = prev.next;
			continue;
		}

		if (should_update) {
			update_item(item, value, i, flags);
		}

		if ((item.e.f & INERT) !== 0) {
			resume_effect(item.e);
			if (is_animated) {
				item.a?.unfix();
				to_animate.delete(item);
			}
		}

		if (item !== current) {
			if (seen.has(item)) {
				if (matched.length < stashed.length) {
					// more efficient to move later items to the front
					var start = stashed[0];
					var j;

					prev = start.prev;

					var a = matched[0];
					var b = matched[matched.length - 1];

					for (j = 0; j < matched.length; j += 1) {
						move(matched[j], start, anchor);
					}

					for (j = 0; j < stashed.length; j += 1) {
						seen.delete(stashed[j]);
					}

					link(state, a.prev, b.next);
					link(state, prev, a);
					link(state, b, start);

					current = start;
					prev = b;
					i -= 1;

					matched = [];
					stashed = [];
				} else {
					// more efficient to move earlier items to the back
					seen.delete(item);
					move(item, current, anchor);

					link(state, item.prev, item.next);
					link(state, item, prev === null ? state.first : prev.next);
					link(state, prev, item);

					prev = item;
				}

				continue;
			}

			matched = [];
			stashed = [];

			while (current !== null && current.k !== key) {
				seen.add(current);
				stashed.push(current);
				current = current.next;
			}

			if (current === null) {
				continue;
			}

			item = current;
		}

		matched.push(item);
		prev = item;
		current = item.next;
	}

	const to_destroy = Array.from(seen);

	while (current !== null) {
		to_destroy.push(current);
		current = current.next;
	}
	var destroy_length = to_destroy.length;

	if (destroy_length > 0) {
		var controlled_anchor = (flags & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;

		if (is_animated) {
			for (i = 0; i < destroy_length; i += 1) {
				to_destroy[i].a?.measure();
			}

			for (i = 0; i < destroy_length; i += 1) {
				to_destroy[i].a?.fix();
			}
		}

		pause_effects(state, to_destroy, controlled_anchor, items);
	}

	if (is_animated) {
		queue_micro_task(() => {
			for (item of to_animate) {
				item.a?.apply();
			}
		});
	}

	/** @type {import('#client').Effect} */ (current_effect).first = state.first && state.first.e;
	/** @type {import('#client').Effect} */ (current_effect).last = prev && prev.e;
}

/**
 * @param {import('#client').EachItem} item
 * @param {any} value
 * @param {number} index
 * @param {number} type
 * @returns {void}
 */
function update_item(item, value, index, type) {
	if ((type & EACH_ITEM_REACTIVE) !== 0) {
		set(item.v, value);
	}

	if ((type & EACH_INDEX_REACTIVE) !== 0) {
		set(/** @type {import('#client').Value<number>} */ (item.i), index);
	} else {
		item.i = index;
	}
}

/**
 * @template V
 * @param {Node} anchor
 * @param {import('#client').EachState} state
 * @param {import('#client').EachItem | null} prev
 * @param {import('#client').EachItem | null} next
 * @param {V} value
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: Node, item: V | import('#client').Source<V>, index: number | import('#client').Value<number>) => void} render_fn
 * @param {number} flags
 * @returns {import('#client').EachItem}
 */
function create_item(anchor, state, prev, next, value, key, index, render_fn, flags) {
	var previous_each_item = current_each_item;

	try {
		var reactive = (flags & EACH_ITEM_REACTIVE) !== 0;
		var mutable = (flags & EACH_IS_STRICT_EQUALS) === 0;

		var v = reactive ? (mutable ? mutable_source(value) : source(value)) : value;
		var i = (flags & EACH_INDEX_REACTIVE) === 0 ? index : source(index);

		/** @type {import('#client').EachItem} */
		var item = {
			i,
			v,
			k: key,
			a: null,
			// @ts-expect-error
			e: null,
			prev,
			next
		};

		current_each_item = item;
		item.e = branch(() => render_fn(anchor, v, i), hydrating);

		item.e.prev = prev && prev.e;
		item.e.next = next && next.e;

		if (prev === null) {
			state.first = item;
		} else {
			prev.next = item;
			prev.e.next = item.e;
		}

		if (next !== null) {
			next.prev = item;
			next.e.prev = item.e;
		}

		return item;
	} finally {
		current_each_item = previous_each_item;
	}
}

/**
 * @param {import('#client').EachItem} item
 * @param {import('#client').EachItem | null} next
 * @param {Text | Element | Comment} anchor
 */
function move(item, next, anchor) {
	var end = item.next
		? /** @type {import('#client').EffectNodes} */ (item.next.e.nodes).start
		: anchor;

	var dest = next ? /** @type {import('#client').EffectNodes} */ (next.e.nodes).start : anchor;
	var node = /** @type {import('#client').EffectNodes} */ (item.e.nodes).start;

	while (node !== end) {
		var next_node = /** @type {import('#client').TemplateNode} */ (node.nextSibling);
		dest.before(node);
		node = next_node;
	}
}

/**
 * @param {import('#client').EachState} state
 * @param {import('#client').EachItem | null} prev
 * @param {import('#client').EachItem | null} next
 */
function link(state, prev, next) {
	if (prev === null) {
		state.first = next;
	} else {
		prev.next = next;
		prev.e.next = next && next.e;
	}

	if (next !== null) {
		next.prev = prev;
		next.e.prev = prev && prev.e;
	}
}
