import {
	EACH_INDEX_REACTIVE,
	EACH_IS_ANIMATED,
	EACH_IS_CONTROLLED,
	EACH_IS_STRICT_EQUALS,
	EACH_ITEM_REACTIVE,
	EACH_KEYED,
	HYDRATION_END_ELSE,
	HYDRATION_START
} from '../../../../constants.js';
import { hydrate_anchor, hydrate_nodes, hydrating, set_hydrating } from '../hydration.js';
import { empty } from '../operations.js';
import { remove } from '../reconciler.js';
import { untrack } from '../../runtime.js';
import {
	block,
	branch,
	destroy_effect,
	effect,
	run_out_transitions,
	pause_children,
	pause_effect,
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
 * @template T
 * @param {T} item
 */
export function identity(item) {
	return item;
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
 * @param {import('#client').Effect[]} effects
 * @param {null | Node} controlled_anchor
 * @param {() => void} [callback]
 */
function pause_effects(effects, controlled_anchor, callback) {
	/** @type {import('#client').TransitionManager[]} */
	var transitions = [];
	var length = effects.length;

	for (var i = 0; i < length; i++) {
		pause_children(effects[i], transitions, true);
	}

	// If we have a controlled anchor, it means that the each block is inside a single
	// DOM element, so we can apply a fast-path for clearing the contents of the element.
	if (effects.length > 0 && transitions.length === 0 && controlled_anchor !== null) {
		var parent_node = /** @type {Element} */ (controlled_anchor.parentNode);
		parent_node.textContent = '';
		parent_node.append(controlled_anchor);
	}

	run_out_transitions(transitions, () => {
		for (var i = 0; i < length; i++) {
			destroy_effect(effects[i]);
		}

		if (callback !== undefined) callback();
	});
}

/**
 * @template V
 * @param {Element | Comment} anchor The next sibling node, or the parent node if this is a 'controlled' block
 * @param {number} flags
 * @param {() => V[]} get_collection
 * @param {(value: V, index: number) => any} get_key
 * @param {(anchor: Node, item: import('#client').MaybeSource<V>, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each(anchor, flags, get_collection, get_key, render_fn, fallback_fn = null) {
	/** @type {import('#client').EachState} */
	var state = { flags, next: null };

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
			var is_else = /** @type {Comment} */ (anchor).data === HYDRATION_END_ELSE;

			if (is_else !== (length === 0)) {
				// hydration mismatch — remove the server-rendered DOM and start over
				remove(hydrate_nodes);
				set_hydrating(false);
				mismatch = true;
			}
		}

		// this is separate to the previous block because `hydrating` might change
		if (hydrating) {
			/** @type {Node} */
			var child_anchor = hydrate_nodes[0];

			/** @type {import('#client').EachItem | import('#client').EachState} */
			var prev = state;

			for (var i = 0; i < length; i++) {
				if (
					child_anchor.nodeType !== 8 ||
					/** @type {Comment} */ (child_anchor).data !== HYDRATION_START
				) {
					// If `nodes` is null, then that means that the server rendered fewer items than what
					// expected, so break out and continue appending non-hydrated items
					mismatch = true;
					set_hydrating(false);
					break;
				}

				child_anchor = hydrate_anchor(child_anchor);
				var item = create_item(child_anchor, prev, null, array[i], keys?.[i], i, render_fn, flags);
				child_anchor = /** @type {Comment} */ (child_anchor.nextSibling);

				prev = item;
			}

			// remove excess nodes
			if (length > 0) {
				while (child_anchor !== anchor) {
					var next = /** @type {import('#client').TemplateNode} */ (child_anchor.nextSibling);
					/** @type {import('#client').TemplateNode} */ (child_anchor).remove();
					child_anchor = next;
				}
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
 * @param {(value: V, index: number) => any} get_key
 * @returns {void}
 */
function reconcile(array, state, anchor, render_fn, flags, get_key) {
	var first = state.next;
	var current = first;
	var lookup = new Map();

	while (current) {
		lookup.set(current.k, current);
		current = current.next;
	}

	current = first;

	/** @type {import('#client').EachState | import('#client').EachItem} */
	var prev = state;

	for (let i = 0; i < array.length; i += 1) {
		var value = array[i];
		var key = get_key(value, i);

		/** @type {import('#client').EachItem} */
		var item;

		if (!current) {
			// append
			item = create_item(anchor, prev, prev.next, value, key, i, render_fn, flags);
			prev = item;
			current = item.next;
			continue;
		}

		if (key === current.k) {
			// noop
			current = current.next;
			continue;
		}

		item = lookup.get(key);

		if (item !== undefined) {
			// move
			prev.next = item;
			current.prev = item;
			item.prev = prev;
			item.next = current;

			move(/** @type {import('#client').Dom} */ (item.e.dom), get_first_child(current));
		} else {
			// create
			item = create_item(
				get_first_child(current),
				prev,
				prev.next,
				value,
				key,
				i,
				render_fn,
				flags
			);
			prev = item;
			current = item.next;
		}
	}
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
 * @param {import('#client').EachItem | import('#client').EachState | null} prev
 * @param {import('#client').EachItem | null} next
 * @param {V} value
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: Node, item: V | import('#client').Source<V>, index: number | import('#client').Value<number>) => void} render_fn
 * @param {number} flags
 * @returns {import('#client').EachItem}
 */
function create_item(anchor, prev, next, value, key, index, render_fn, flags) {
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

		if (prev) prev.next = item;
		if (next) next.prev = item;

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
