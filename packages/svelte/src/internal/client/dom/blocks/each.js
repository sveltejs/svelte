import {
	EACH_INDEX_REACTIVE,
	EACH_IS_ANIMATED,
	EACH_IS_CONTROLLED,
	EACH_IS_STRICT_EQUALS,
	EACH_ITEM_REACTIVE,
	EACH_KEYED
} from '../../../../constants.js';
import { hydrate_anchor, hydrate_nodes, hydrating, set_hydrating } from '../hydration.js';
import { empty } from '../operations.js';
import { remove } from '../reconciler.js';
import { untrack } from '../../runtime.js';
import {
	block,
	branch,
	effect,
	pause_effect,
	pause_effects,
	resume_effect
} from '../../reactivity/effects.js';
import { source, mutable_source, set } from '../../reactivity/sources.js';
import { is_array, is_frozen, map_get, map_set } from '../../utils.js';
import { STATE_SYMBOL } from '../../constants.js';

var NEW_ITEM = -1;
var LIS_ITEM = -2;

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
 * @template V
 * @param {Element | Comment} anchor The next sibling node, or the parent node if this is a 'controlled' block
 * @param {number} flags
 * @param {() => V[]} get_collection
 * @param {null | ((item: V) => string)} get_key
 * @param {(anchor: Node, item: import('#client').MaybeSource<V>, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @param {typeof reconcile_indexed_array | reconcile_tracked_array} reconcile_fn
 * @returns {void}
 */
function each(anchor, flags, get_collection, get_key, render_fn, fallback_fn, reconcile_fn) {
	/** @type {import('#client').EachState} */
	var state = { flags, items: [] };

	var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;

	if (is_controlled) {
		var parent_node = /** @type {Element} */ (anchor);

		anchor = hydrating
			? /** @type {Comment | Text} */ (
					hydrate_anchor(/** @type {Comment | Text} */ (parent_node.firstChild))
				)
			: parent_node.appendChild(empty());
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

		var keys = get_key === null ? array : array.map(get_key);

		var length = array.length;

		// If we are working with an array that isn't proxied or frozen, then remove strict equality and ensure the items
		// are treated as reactive, so they get wrapped in a signal.
		var flags = state.flags;
		if ((flags & EACH_IS_STRICT_EQUALS) !== 0 && !is_frozen(array) && !(STATE_SYMBOL in array)) {
			flags ^= EACH_IS_STRICT_EQUALS;

			// Additionally if we're in an keyed each block, we'll need ensure the items are all wrapped in signals.
			if ((flags & EACH_KEYED) !== 0 && (flags & EACH_ITEM_REACTIVE) === 0) {
				flags ^= EACH_ITEM_REACTIVE;
			}
		}

		/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			var is_else = /** @type {Comment} */ (hydrate_nodes?.[0])?.data === 'ssr:each_else';

			if (is_else !== (length === 0)) {
				// hydration mismatch — remove the server-rendered DOM and start over
				remove(hydrate_nodes);
				set_hydrating(false);
				mismatch = true;
			} else if (is_else) {
				// Remove the each_else comment node or else it will confuse the subsequent hydration algorithm
				/** @type {import('#client').TemplateNode[]} */ (hydrate_nodes).shift();
			}
		}

		// this is separate to the previous block because `hydrating` might change
		if (hydrating) {
			var b_items = [];

			/** @type {Node} */
			var child_anchor = hydrate_nodes[0];

			for (var i = 0; i < length; i++) {
				if (child_anchor.nodeType !== 8 || /** @type {Comment} */ (child_anchor).data !== '[') {
					// If `nodes` is null, then that means that the server rendered fewer items than what
					// expected, so break out and continue appending non-hydrated items
					mismatch = true;
					set_hydrating(false);
					break;
				}

				child_anchor = hydrate_anchor(child_anchor);
				b_items[i] = create_item(child_anchor, array[i], keys?.[i], i, render_fn, flags);
				child_anchor = /** @type {Comment} */ (child_anchor.nextSibling);
			}

			// remove excess nodes
			if (length > 0) {
				while (child_anchor !== anchor) {
					var next = /** @type {import('#client').TemplateNode} */ (child_anchor.nextSibling);
					/** @type {import('#client').TemplateNode} */ (child_anchor).remove();
					child_anchor = next;
				}
			}

			state.items = b_items;
		}

		if (!hydrating) {
			// TODO add 'empty controlled block' optimisation here
			reconcile_fn(array, state, anchor, render_fn, flags, keys);
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
}

/**
 * @template V
 * @param {Element | Comment} anchor
 * @param {number} flags
 * @param {() => V[]} get_collection
 * @param {null | ((item: V) => string)} get_key
 * @param {(anchor: Node, item: import('#client').MaybeSource<V>, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} [fallback_fn]
 * @returns {void}
 */
export function each_keyed(anchor, flags, get_collection, get_key, render_fn, fallback_fn = null) {
	each(anchor, flags, get_collection, get_key, render_fn, fallback_fn, reconcile_tracked_array);
}

/**
 * @template V
 * @param {Element | Comment} anchor
 * @param {number} flags
 * @param {() => V[]} get_collection
 * @param {(anchor: Node, item: import('#client').MaybeSource<V>, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} [fallback_fn]
 * @returns {void}
 */
export function each_indexed(anchor, flags, get_collection, render_fn, fallback_fn = null) {
	each(anchor, flags, get_collection, null, render_fn, fallback_fn, reconcile_indexed_array);
}

/**
 * @template V
 * @param {Array<V>} array
 * @param {import('#client').EachState} state
 * @param {Element | Comment | Text} anchor
 * @param {(anchor: Node, item: import('#client').MaybeSource<V>, index: number | import('#client').Source<number>) => void} render_fn
 * @param {number} flags
 * @returns {void}
 */
function reconcile_indexed_array(array, state, anchor, render_fn, flags) {
	var a_items = state.items;

	var a = a_items.length;
	var b = array.length;
	var min = Math.min(a, b);

	/** @type {typeof a_items} */
	var b_items = Array(b);

	var item;
	var value;

	// update items
	for (var i = 0; i < min; i += 1) {
		value = array[i];
		item = a_items[i];
		b_items[i] = item;
		update_item(item, value, i, flags);
		resume_effect(item.e);
	}

	if (b > a) {
		// add items
		for (; i < b; i += 1) {
			value = array[i];
			item = create_item(anchor, value, null, i, render_fn, flags);
			b_items[i] = item;
		}

		state.items = b_items;
	} else if (a > b) {
		// remove items
		var effects = [];
		for (i = b; i < a; i += 1) {
			effects.push(a_items[i].e);
		}

		pause_effects(effects, () => {
			state.items.length = b;
		});
	}
}

/**
 * Reconcile arrays by the equality of the elements in the array. This algorithm
 * is based on Ivi's reconcilation logic:
 * https://github.com/localvoid/ivi/blob/9f1bd0918f487da5b131941228604763c5d8ef56/packages/ivi/src/client/core.ts#L968
 * @template V
 * @param {Array<V>} array
 * @param {import('#client').EachState} state
 * @param {Element | Comment | Text} anchor
 * @param {(anchor: Node, item: import('#client').MaybeSource<V>, index: number | import('#client').Source<number>) => void} render_fn
 * @param {number} flags
 * @param {any[]} keys
 * @returns {void}
 */
function reconcile_tracked_array(array, state, anchor, render_fn, flags, keys) {
	var a_items = state.items;

	var a = a_items.length;
	var b = array.length;

	/** @type {Array<import('#client').EachItem>} */
	var b_items = Array(b);

	var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
	var should_update = (flags & (EACH_ITEM_REACTIVE | EACH_INDEX_REACTIVE)) !== 0;
	var start = 0;
	var item;

	/** @type {import('#client').Effect[]} */
	var to_destroy = [];
	/** @type {Array<import('#client').EachItem>} */
	var to_animate = [];

	// Step 1 — trim common suffix
	while (a > 0 && b > 0 && a_items[a - 1].k === keys[b - 1]) {
		item = b_items[--b] = a_items[--a];
		anchor = get_first_child(item);

		resume_effect(item.e);

		if (should_update) {
			update_item(item, array[b], b, flags);
		}
		if (is_animated) {
			item.a?.measure();
			to_animate.push(item);
		}
	}

	// Step 2 — trim common prefix
	while (start < a && start < b && a_items[start].k === keys[start]) {
		item = b_items[start] = a_items[start];

		resume_effect(item.e);

		if (should_update) {
			update_item(item, array[start], start, flags);
		}
		if (is_animated) {
			item.a?.measure();
			to_animate.push(item);
		}

		start += 1;
	}

	// Step 3 — update
	if (start === a) {
		// add only
		while (start < b) {
			item = create_item(anchor, array[start], keys[start], start, render_fn, flags);
			b_items[start++] = item;
		}
	} else if (start === b) {
		// remove only
		while (start < a) {
			to_destroy.push(a_items[start++].e);
		}
	} else {
		// reconcile
		var moved = false;
		var sources = new Int32Array(b - start);
		var indexes = new Map();
		var i;
		var index;
		var last_item;

		// store the indexes of each item in the new world
		for (i = start; i < b; i += 1) {
			sources[i - start] = NEW_ITEM;
			map_set(indexes, keys[i], i);
		}

		if (is_animated) {
			// for all items that were in both the old and the new list,
			// measure them and store them in `to_animate` so we can
			// apply animations once the DOM has been updated
			for (i = 0; i < a_items.length; i += 1) {
				item = a_items[i];
				if (indexes.has(item.k)) {
					item.a?.measure();
					to_animate.push(item);
				}
			}
		}

		// populate the `sources` array for each old item with
		// its new index, so that we can calculate moves
		for (i = start; i < a; i += 1) {
			item = a_items[i];
			index = map_get(indexes, item.k);

			resume_effect(item.e);

			if (index === undefined) {
				to_destroy.push(item.e);
			} else {
				moved = true;
				sources[index - start] = i;
				b_items[index] = item;

				if (is_animated) {
					to_animate.push(item);
				}
			}
		}

		// if we need to move items (as opposed to just adding/removing),
		// figure out how to do so efficiently (I would be lying if I said
		// I fully understand this part)
		if (moved) {
			mark_lis(sources);
		}

		// working from the back, insert new or moved items
		while (b-- > start) {
			index = sources[b - start];
			var should_insert = index === NEW_ITEM;

			if (should_insert) {
				if (last_item !== undefined) anchor = get_first_child(last_item);
				item = create_item(anchor, array[b], keys[b], b, render_fn, flags);
			} else {
				item = b_items[b];
				if (should_update) {
					update_item(item, array[b], b, flags);
				}

				if (moved && index !== LIS_ITEM) {
					if (last_item !== undefined) anchor = get_first_child(last_item);
					move(/** @type {import('#client').Dom} */ (item.e.dom), anchor);
				}
			}

			last_item = b_items[b] = item;
		}
	}

	if (to_animate.length > 0) {
		// TODO we need to briefly take any outroing elements out of the flow, so that
		// we can figure out the eventual destination of the animating elements
		// - https://github.com/sveltejs/svelte/pull/10798#issuecomment-2013681778
		// - https://svelte.dev/repl/6e891305e9644a7ca7065fa95c79d2d2?version=4.2.9
		effect(() => {
			untrack(() => {
				for (item of to_animate) {
					item.a?.apply();
				}
			});
		});
	}

	pause_effects(to_destroy, () => {
		state.items = b_items;
	});
}

/**
 * Longest Increased Subsequence algorithm
 * @param {Int32Array} a
 * @returns {void}
 */
function mark_lis(a) {
	var length = a.length;
	var parent = new Int32Array(length);
	var index = new Int32Array(length);
	var index_length = 0;
	var i = 0;

	/** @type {number} */
	var j;

	/** @type {number} */
	var k;

	/** @type {number} */
	var lo;

	/** @type {number} */
	var hi;

	// Skip -1 values at the start of the input array `a`.
	for (; a[i] === NEW_ITEM; ++i) {
		/**/
	}

	index[0] = i++;

	for (; i < length; ++i) {
		k = a[i];

		if (k !== NEW_ITEM) {
			// Ignore -1 values.
			j = index[index_length];

			if (a[j] < k) {
				parent[i] = j;
				index[++index_length] = i;
			} else {
				lo = 0;
				hi = index_length;

				while (lo < hi) {
					j = (lo + hi) >> 1;
					if (a[index[j]] < k) {
						lo = j + 1;
					} else {
						hi = j;
					}
				}

				if (k < a[index[lo]]) {
					if (lo > 0) {
						parent[i] = index[lo - 1];
					}
					index[lo] = i;
				}
			}
		}
	}

	// Mutate input array `a` and assign -2 value to all nodes that are part of LIS.
	j = index[index_length];

	while (index_length-- >= 0) {
		a[j] = LIS_ITEM;
		j = parent[j];
	}
}

/**
 * @param {import('#client').EachItem} item
 * @returns {Text | Element | Comment}
 */
function get_first_child(item) {
	var current = item.e.dom;

	if (is_array(current)) {
		return /** @type {Text | Element | Comment} */ (current[0]);
	}

	return /** @type {Text | Element | Comment} */ (current);
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
 * @param {V} value
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: Node, item: V | import('#client').Source<V>, index: number | import('#client').Value<number>) => void} render_fn
 * @param {number} flags
 * @returns {import('#client').EachItem}
 */
function create_item(anchor, value, key, index, render_fn, flags) {
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
			e: null
		};

		current_each_item = item;
		item.e = branch(() => render_fn(anchor, v, i));

		return item;
	} finally {
		current_each_item = previous_each_item;
	}
}

/**
 * @param {import('#client').Dom} current
 * @param {Text | Element | Comment} anchor
 */
function move(current, anchor) {
	if (is_array(current)) {
		for (var i = 0; i < current.length; i++) {
			anchor.before(current[i]);
		}
	} else {
		anchor.before(current);
	}
}
