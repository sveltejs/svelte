import {
	EACH_INDEX_REACTIVE,
	EACH_IS_ANIMATED,
	EACH_IS_CONTROLLED,
	EACH_IS_STRICT_EQUALS,
	EACH_ITEM_REACTIVE,
	EACH_KEYED
} from '../../../../constants.js';
import {
	current_hydration_fragment,
	get_hydration_fragment,
	hydrate_block_anchor,
	hydrating,
	set_current_hydration_fragment
} from '../hydration.js';
import { empty } from '../operations.js';
import { insert, remove } from '../reconciler.js';
import { untrack } from '../../runtime.js';
import {
	destroy_effect,
	pause_effect,
	render_effect,
	resume_effect,
	user_effect
} from '../../reactivity/effects.js';
import { source, mutable_source, set } from '../../reactivity/sources.js';
import { is_array, is_frozen, map_get, map_set } from '../../utils.js';
import { STATE_SYMBOL } from '../../constants.js';
import { create_block } from './utils.js';

var NEW_BLOCK = -1;
var LIS_BLOCK = -2;

/**
 * The row of a keyed each block that is currently updating. We track this
 * so that `animate:` directives have something to attach themselves to
 * @type {import('#client').EachItem | null}
 */
export let current_each_item_block = null;

/** @param {import('#client').EachItem | null} block */
export function set_current_each_item_block(block) {
	current_each_item_block = block;
}

/**
 * @template V
 * @param {Element | Comment} anchor The next sibling node, or the parent node if this is a 'controlled' block
 * @param {() => V[]} get_collection
 * @param {number} flags
 * @param {null | ((item: V) => string)} get_key
 * @param {(anchor: null, item: V, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @param {typeof reconcile_indexed_array | reconcile_tracked_array} reconcile_fn
 * @returns {void}
 */
function each(anchor, get_collection, flags, get_key, render_fn, fallback_fn, reconcile_fn) {
	var block = create_block();

	/** @type {import('#client').EachState} */
	var state = { flags, items: [] };

	var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
	hydrate_block_anchor(is_controlled ? /** @type {Node} */ (anchor.firstChild) : anchor);

	if (is_controlled) {
		var parent_node = /** @type {Element} */ (anchor);
		parent_node.append((anchor = empty()));
	}

	/** @type {import('#client').Effect | null} */
	var fallback = null;

	var effect = render_effect(
		() => {
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
				var is_else =
					/** @type {Comment} */ (current_hydration_fragment?.[0])?.data === 'ssr:each_else';

				if (is_else !== (length === 0)) {
					// hydration mismatch — remove the server-rendered DOM and start over
					remove(current_hydration_fragment);
					set_current_hydration_fragment(null);
					mismatch = true;
				} else if (is_else) {
					// Remove the each_else comment node or else it will confuse the subsequent hydration algorithm
					/** @type {import('#client').TemplateNode[]} */ (current_hydration_fragment).shift();
				}
			}

			// this is separate to the previous block because `hydrating` might change
			if (hydrating) {
				var b_blocks = [];

				// Hydrate block
				var hydration_list = /** @type {import('#client').TemplateNode[]} */ (
					current_hydration_fragment
				);
				var hydrating_node = hydration_list[0];

				for (var i = 0; i < length; i++) {
					var fragment = get_hydration_fragment(hydrating_node);
					set_current_hydration_fragment(fragment);
					if (!fragment) {
						// If fragment is null, then that means that the server rendered less items than what
						// the client code specifies -> break out and continue with client-side node creation
						mismatch = true;
						break;
					}

					b_blocks[i] = create_item(array[i], keys?.[i], i, render_fn, flags);

					// TODO helperise this
					hydrating_node = /** @type {import('#client').TemplateNode} */ (
						/** @type {Node} */ (
							/** @type {Node} */ (fragment[fragment.length - 1] || hydrating_node).nextSibling
						).nextSibling
					);
				}

				remove_excess_hydration_nodes(hydration_list, hydrating_node);

				state.items = b_blocks;
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
						fallback = render_effect(
							() => {
								fallback_fn(anchor);
								var dom = block.d; // TODO would be nice if this was just returned from the managed effect function...

								return () => {
									if (dom !== null) {
										remove(dom);
										dom = null;
									}
								};
							},
							block,
							true
						);
					}
				} else if (fallback !== null) {
					pause_effect(fallback, () => {
						fallback = null;
					});
				}
			}

			if (mismatch) {
				// Set a fragment so that Svelte continues to operate in hydration mode
				set_current_hydration_fragment([]);
			}
		},
		block,
		false
	);

	effect.ondestroy = () => {
		for (var item of state.items) {
			if (item.d !== null) {
				destroy_effect(item.e);
				remove(item.d);
			}
		}

		if (fallback) destroy_effect(fallback);
	};
}

/**
 * @template V
 * @param {Element | Comment} anchor
 * @param {() => V[]} get_collection
 * @param {number} flags
 * @param {null | ((item: V) => string)} get_key
 * @param {(anchor: null, item: V, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each_keyed(anchor, get_collection, flags, get_key, render_fn, fallback_fn) {
	each(anchor, get_collection, flags, get_key, render_fn, fallback_fn, reconcile_tracked_array);
}

/**
 * @template V
 * @param {Element | Comment} anchor
 * @param {() => V[]} get_collection
 * @param {number} flags
 * @param {(anchor: null, item: V, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each_indexed(anchor, get_collection, flags, render_fn, fallback_fn) {
	each(anchor, get_collection, flags, null, render_fn, fallback_fn, reconcile_indexed_array);
}

/**
 * @template V
 * @param {Array<V>} array
 * @param {import('#client').EachState} state
 * @param {Element | Comment | Text} anchor
 * @param {(anchor: null, item: V, index: number | import('#client').Source<number>) => void} render_fn
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
			item = create_item(value, null, i, render_fn, flags);
			b_items[i] = item;
			insert_item(item, anchor);
		}

		state.items = b_items;
	} else if (a > b) {
		// remove items
		var remaining = a - b;

		var clear = () => {
			for (var i = b; i < a; i += 1) {
				var block = a_items[i];
				if (block.d) remove(block.d);
			}

			state.items.length = b;
		};

		var check = () => {
			if (--remaining === 0) {
				clear();
			}
		};

		for (; i < a; i += 1) {
			pause_effect(a_items[i].e, check);
		}
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
 * @param {(anchor: null, item: V, index: number | import('#client').Source<number>) => void} render_fn
 * @param {number} flags
 * @param {any[]} keys
 * @returns {void}
 */
function reconcile_tracked_array(array, state, anchor, render_fn, flags, keys) {
	var a_blocks = state.items;

	var a = a_blocks.length;
	var b = array.length;

	/** @type {Array<import('#client').EachItem>} */
	var b_blocks = Array(b);

	var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
	var should_update = (flags & (EACH_ITEM_REACTIVE | EACH_INDEX_REACTIVE)) !== 0;
	var start = 0;
	var block;

	/** @type {Array<import('#client').EachItem>} */
	var to_destroy = [];

	// Step 1 — trim common suffix
	while (a > 0 && b > 0 && a_blocks[a - 1].k === keys[b - 1]) {
		block = b_blocks[--b] = a_blocks[--a];
		anchor = get_first_child(block);

		resume_effect(block.e);

		if (should_update) {
			update_item(block, array[b], b, flags);
		}
	}

	// Step 2 — trim common prefix
	while (start < a && start < b && a_blocks[start].k === keys[start]) {
		block = b_blocks[start] = a_blocks[start];

		resume_effect(block.e);

		if (should_update) {
			update_item(block, array[start], start, flags);
		}

		start += 1;
	}

	// Step 3 — update
	if (start === a) {
		// add only
		while (start < b) {
			block = create_item(array[start], keys[start], start, render_fn, flags);
			b_blocks[start++] = block;
			insert_item(block, anchor);
		}
	} else if (start === b) {
		// remove only
		while (start < a) {
			to_destroy.push(a_blocks[start++]);
		}
	} else {
		// reconcile
		var moved = false;
		var sources = new Int32Array(b - start);
		var indexes = new Map();
		var i;
		var index;
		var last_block;
		var last_sibling;

		// store the indexes of each block in the new world
		for (i = start; i < b; i += 1) {
			sources[i - start] = NEW_BLOCK;
			map_set(indexes, keys[i], i);
		}

		/** @type {Array<import('#client').EachItem>} */
		var to_animate = [];
		if (is_animated) {
			// for all blocks that were in both the old and the new list,
			// measure them and store them in `to_animate` so we can
			// apply animations once the DOM has been updated
			for (i = 0; i < a_blocks.length; i += 1) {
				block = a_blocks[i];
				if (indexes.has(block.k)) {
					block.a?.measure();
					to_animate.push(block);
				}
			}
		}

		// populate the `sources` array for each old block with
		// its new index, so that we can calculate moves
		for (i = start; i < a; i += 1) {
			block = a_blocks[i];
			index = map_get(indexes, block.k);

			resume_effect(block.e);

			if (index === undefined) {
				to_destroy.push(block);
			} else {
				moved = true;
				sources[index - start] = i;
				b_blocks[index] = block;

				if (is_animated) {
					to_animate.push(block);
				}
			}
		}

		// if we need to move blocks (as opposed to just adding/removing),
		// figure out how to do so efficiently (I would be lying if I said
		// I fully understand this part)
		if (moved) {
			mark_lis(sources);
		}

		// working from the back, insert new or moved blocks
		while (b-- > start) {
			index = sources[b - start];
			var insert = index === NEW_BLOCK;

			if (insert) {
				block = create_item(array[b], keys[b], b, render_fn, flags);
			} else {
				block = b_blocks[b];
				if (should_update) {
					update_item(block, array[b], b, flags);
				}
			}

			if (insert || (moved && index !== LIS_BLOCK)) {
				last_sibling = last_block === undefined ? anchor : get_first_child(last_block);
				anchor = insert_item(block, last_sibling);
			}

			last_block = b_blocks[b] = block;
		}

		if (to_animate.length > 0) {
			// TODO we need to briefly take any outroing elements out of the flow, so that
			// we can figure out the eventual destination of the animating elements
			// - https://github.com/sveltejs/svelte/pull/10798#issuecomment-2013681778
			// - https://svelte.dev/repl/6e891305e9644a7ca7065fa95c79d2d2?version=4.2.9
			user_effect(() => {
				untrack(() => {
					for (block of to_animate) {
						block.a?.apply();
					}
				});
			});
		}
	}

	var remaining = to_destroy.length;
	if (remaining > 0) {
		var clear = () => {
			for (block of to_destroy) {
				if (block.d) remove(block.d);
			}

			state.items = b_blocks;
		};

		var check = () => {
			if (--remaining === 0) {
				clear();
			}
		};

		for (block of to_destroy) {
			pause_effect(block.e, check);
		}
	} else {
		state.items = b_blocks;
	}
}

/**
 * The server could have rendered more list items than the client specifies.
 * In that case, we need to remove the remaining server-rendered nodes.
 * @param {import('#client').TemplateNode[]} hydration_list
 * @param {import('#client').TemplateNode | null} next_node
 */
function remove_excess_hydration_nodes(hydration_list, next_node) {
	if (next_node === null) return;
	var idx = hydration_list.indexOf(next_node);
	if (idx !== -1 && hydration_list.length > idx + 1) {
		remove(hydration_list.slice(idx));
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
	for (; a[i] === NEW_BLOCK; ++i) {
		/**/
	}

	index[0] = i++;

	for (; i < length; ++i) {
		k = a[i];

		if (k !== NEW_BLOCK) {
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
		a[j] = LIS_BLOCK;
		j = parent[j];
	}
}

/**
 * @param {import('#client').EachItem} block
 * @param {Text | Element | Comment} sibling
 * @returns {Text | Element | Comment}
 */
function insert_item(block, sibling) {
	var current = /** @type {import('#client').TemplateNode} */ (block.d);
	return insert(current, sibling);
}

/**
 * @param {import('#client').EachItem} block
 * @returns {Text | Element | Comment}
 */
function get_first_child(block) {
	var current = block.d;

	if (is_array(current)) {
		return /** @type {Text | Element | Comment} */ (current[0]);
	}

	return /** @type {Text | Element | Comment} */ (current);
}

/**
 * @param {import('#client').EachItem} block
 * @param {any} item
 * @param {number} index
 * @param {number} type
 * @returns {void}
 */
function update_item(block, item, index, type) {
	if ((type & EACH_ITEM_REACTIVE) !== 0) {
		set(block.v, item);
	}

	if ((type & EACH_INDEX_REACTIVE) !== 0) {
		set(/** @type {import('#client').Value<number>} */ (block.i), index);
	} else {
		block.i = index;
	}
}

/**
 * @template V
 * @param {V} item
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: null, item: V, index: number | import('#client').Value<number>) => void} render_fn
 * @param {number} flags
 * @returns {import('#client').EachItem}
 */
function create_item(item, key, index, render_fn, flags) {
	var each_item_not_reactive = (flags & EACH_ITEM_REACTIVE) === 0;

	var item_value = each_item_not_reactive
		? item
		: (flags & EACH_IS_STRICT_EQUALS) !== 0
			? source(item)
			: mutable_source(item);

	/** @type {import('#client').EachItem} */
	var block = {
		a: null,
		// dom
		d: null,
		// effect
		// @ts-expect-error
		e: null,
		// index
		i: (flags & EACH_INDEX_REACTIVE) === 0 ? index : source(index),
		// key
		k: key,
		// item
		v: item_value
	};

	var previous_each_item_block = current_each_item_block;

	try {
		current_each_item_block = block;

		block.e = render_effect(
			() => {
				render_fn(null, block.v, block.i);
			},
			block,
			true
		);

		return block;
	} finally {
		current_each_item_block = previous_each_item_block;
	}
}
