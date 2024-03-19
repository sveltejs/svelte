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
import { clear_text_content, empty } from '../operations.js';
import { insert, remove } from '../reconciler.js';
import { current_block } from '../../runtime.js';
import {
	destroy_effect,
	pause_effect,
	render_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { source, mutable_source, set } from '../../reactivity/sources.js';
import { is_array, is_frozen, map_get, map_set } from '../../utils.js';
import { STATE_SYMBOL } from '../../constants.js';

const NEW_BLOCK = -1;
const LIS_BLOCK = -2;

/**
 * @template V
 * @param {Element | Comment} anchor_node
 * @param {() => V[]} collection
 * @param {number} flags
 * @param {null | ((item: V) => string)} key_fn
 * @param {(anchor: null, item: V, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @param {typeof reconcile_indexed_array | reconcile_tracked_array} reconcile_fn
 * @returns {void}
 */
function each(anchor_node, collection, flags, key_fn, render_fn, fallback_fn, reconcile_fn) {
	const is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;

	/** @type {import('#client').EachBlock} */
	const block = {
		// anchor
		a: anchor_node,
		// dom
		d: null,
		// flags
		f: flags,
		// items
		v: [],
		// effect
		e: null,
		p: /** @type {import('#client').Block} */ (current_block)
	};

	hydrate_block_anchor(anchor_node, is_controlled);

	/** @type {V[]} */
	let array;

	/** @type {Array<string> | null} */
	let keys = null;

	/**
	 * Whether or not there was a "rendered fallback but want to render items" (or vice versa) hydration mismatch.
	 * Needs to be a `let` or else it isn't treeshaken out
	 */
	let mismatch = false;

	const create_fallback_effect = () => {
		return render_effect(
			() => {
				let anchor = block.a;
				const is_controlled = (block.f & EACH_IS_CONTROLLED) !== 0;

				if (is_controlled) {
					// If the each block is controlled, then the anchor node will be the surrounding
					// element in which the each block is rendered, which requires certain handling
					// depending on whether we're in hydration mode or not
					if (!hydrating) {
						// Create a new anchor on the fly because there's none due to the optimization
						// TODO this will happen every time the fallback renders...
						anchor = empty();
						block.a.appendChild(anchor);
					} else {
						// In case of hydration the anchor will be the first child of the surrounding element
						anchor = /** @type {Comment} */ (anchor.firstChild);
					}
				}

				/** @type {(anchor: Node) => void} */ (fallback_fn)(anchor);
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
	};

	/** @type {import('#client').Effect | null} */
	let fallback = null;

	const each = render_effect(
		() => {
			/** @type {V[]} */
			const maybe_array = collection();
			array = is_array(maybe_array)
				? maybe_array
				: maybe_array == null
					? []
					: Array.from(maybe_array);

			const keys = key_fn === null ? array : array.map(key_fn);

			const length = array.length;

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

			if (fallback_fn !== null) {
				if (length === 0) {
					if (fallback) {
						resume_effect(fallback);
					} else {
						fallback = create_fallback_effect();
					}
				} else if (fallback !== null) {
					pause_effect(fallback, () => {
						fallback = null;
					});
				}
			}

			const is_controlled = (block.f & EACH_IS_CONTROLLED) !== 0;

			// If we are working with an array that isn't proxied or frozen, then remove strict equality and ensure the items
			// are treated as reactive, so they get wrapped in a signal.
			var flags = block.f;
			if ((flags & EACH_IS_STRICT_EQUALS) !== 0 && !is_frozen(array) && !(STATE_SYMBOL in array)) {
				flags ^= EACH_IS_STRICT_EQUALS;

				// Additionally if we're in an keyed each block, we'll need ensure the items are all wrapped in signals.
				if ((flags & EACH_KEYED) !== 0 && (flags & EACH_ITEM_REACTIVE) === 0) {
					flags ^= EACH_ITEM_REACTIVE;
				}
			}

			if (hydrating) {
				/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
				let mismatch = false;

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

					b_blocks[i] = create_block(array[i], keys?.[i], i, render_fn, flags);

					hydrating_node = /** @type {import('#client').TemplateNode} */ (
						/** @type {Node} */ (
							/** @type {Node} */ (fragment[fragment.length - 1] || hydrating_node).nextSibling
						).nextSibling
					);
				}

				remove_excess_hydration_nodes(hydration_list, hydrating_node);

				block.v = b_blocks;

				if (mismatch) {
					// Server rendered less nodes than the client -> set empty array so that Svelte continues to operate in hydration mode
					reconcile_fn(array, block, block.a, is_controlled, render_fn, flags, keys);
					set_current_hydration_fragment([]);
				}
			} else {
				reconcile_fn(array, block, block.a, is_controlled, render_fn, flags, keys);
			}
		},
		block,
		false
	);

	if (mismatch) {
		// Set a fragment so that Svelte continues to operate in hydration mode
		set_current_hydration_fragment([]);
	}

	each.ondestroy = () => {
		const flags = block.f;
		const is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;

		for (const b of block.v) {
			if (b.d !== null) {
				destroy_effect(b.e);
				remove(b.d);
			}
		}

		// reconcile_fn([], block, block.a, is_controlled, render_fn, flags, false, keys);
		if (fallback) destroy_effect(fallback);
	};

	block.e = each;
}

/**
 * @template V
 * @param {Element | Comment} anchor_node
 * @param {() => V[]} collection
 * @param {number} flags
 * @param {null | ((item: V) => string)} key_fn
 * @param {(anchor: null, item: V, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each_keyed(anchor_node, collection, flags, key_fn, render_fn, fallback_fn) {
	each(anchor_node, collection, flags, key_fn, render_fn, fallback_fn, reconcile_tracked_array);
}

/**
 * @template V
 * @param {Element | Comment} anchor_node
 * @param {() => V[]} collection
 * @param {number} flags
 * @param {(anchor: null, item: V, index: import('#client').MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each_indexed(anchor_node, collection, flags, render_fn, fallback_fn) {
	each(anchor_node, collection, flags, null, render_fn, fallback_fn, reconcile_indexed_array);
}

/**
 * @template V
 * @param {Array<V>} array
 * @param {import('#client').EachBlock} each_block
 * @param {Element | Comment | Text} dom
 * @param {boolean} is_controlled
 * @param {(anchor: null, item: V, index: number | import('#client').Source<number>) => void} render_fn
 * @param {number} flags
 * @returns {void}
 */
function reconcile_indexed_array(array, each_block, dom, is_controlled, render_fn, flags) {
	var a_blocks = each_block.v;

	var a = a_blocks.length;
	var b = array.length;
	var min = Math.min(a, b);

	/** @type {typeof a_blocks} */
	var b_blocks = Array(b);

	var block;
	var item;

	// update items
	for (var i = 0; i < min; i += 1) {
		item = array[i];
		block = a_blocks[i];
		b_blocks[i] = block;
		update_block(block, item, i, flags);
		resume_effect(block.e);
	}

	if (b > a) {
		// add items
		for (; i < b; i += 1) {
			item = array[i];
			block = create_block(item, null, i, render_fn, flags);
			b_blocks[i] = block;
			insert_block(block, dom, is_controlled, null);
		}

		each_block.v = b_blocks;
	} else if (a > b) {
		// remove items
		let remaining = a - b;

		const clear = () => {
			// TODO optimization for controlled case — just do `clear_text_content(dom)`

			for (let i = b; i < a; i += 1) {
				let block = a_blocks[i];
				if (block.d) remove(block.d);
			}

			each_block.v = each_block.v.slice(0, b);
		};

		const check = () => {
			if (--remaining === 0) {
				clear();
			}
		};

		for (; i < a; i += 1) {
			block = a_blocks[i];
			if (block.e) pause_effect(block.e, check);
		}
	}
}

/**
 * Reconcile arrays by the equality of the elements in the array. This algorithm
 * is based on Ivi's reconcilation logic:
 * https://github.com/localvoid/ivi/blob/9f1bd0918f487da5b131941228604763c5d8ef56/packages/ivi/src/client/core.ts#L968
 * @template V
 * @param {Array<V>} array
 * @param {import('#client').EachBlock} each_block
 * @param {Element | Comment | Text} dom
 * @param {boolean} is_controlled
 * @param {(anchor: null, item: V, index: number | import('#client').Source<number>) => void} render_fn
 * @param {number} flags
 * @param {any[]} keys
 * @returns {void}
 */
function reconcile_tracked_array(array, each_block, dom, is_controlled, render_fn, flags, keys) {
	var a_blocks = each_block.v;

	var a = a_blocks.length;
	var b = array.length;

	/** @type {Array<import('#client').EachItemBlock>} */
	var b_blocks = Array(b);

	var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
	var should_update = is_animated || (flags & (EACH_ITEM_REACTIVE | EACH_INDEX_REACTIVE)) !== 0;
	var start = 0;
	var block;

	/** @type {null | Text | Element | Comment} */
	var sibling = null;

	// Step 1 — trim common suffix
	while (a > 0 && b > 0 && a_blocks[a - 1].k === keys[b - 1]) {
		block = b_blocks[--b] = a_blocks[--a];
		sibling = get_first_child(block);

		if (should_update) {
			update_block(block, array[b], b, flags);
		}
	}

	// Step 2 — trim common prefix
	while (start < a && start < b && a_blocks[start].k === keys[start]) {
		block = b_blocks[start] = a_blocks[start];

		if (should_update) {
			update_block(block, array[start], start, flags);
		}

		start += 1;
	}

	// Step 3 — update
	if (start === a) {
		// add only
		while (--b >= start) {
			block = create_block(array[b], keys[b], b, render_fn, flags);
			b_blocks[b] = block;
			sibling = insert_block(block, dom, is_controlled, sibling);
		}
	} else if (start === b) {
		// remove only
		while (start < a) {
			destroy_block(a_blocks[start++]);
		}
	} else {
		// reconcile
		var moved = false;
		var sources = new Int32Array(b - start);
		var indexes = new Map();
		var i;
		var index;

		for (i = start; i < b; i += 1) {
			sources[i - start] = NEW_BLOCK;
			map_set(indexes, keys[i], i);
		}

		for (i = start; i < a; i += 1) {
			block = a_blocks[i];
			index = map_get(indexes, block.k);

			if (index === undefined) {
				destroy_block(block);
			} else {
				moved = true;
				sources[index - start] = i;
				b_blocks[index] = block;

				if (is_animated) {
					// If keys are animated, we need to do updates before actual moves
					update_block(block, array[index], index, flags);
				}
			}
		}

		if (moved) {
			mark_lis(sources);
		}

		var last_block;
		var last_sibling;

		while (b-- > start) {
			index = sources[b - start];
			var insert = index === NEW_BLOCK;

			if (insert) {
				block = create_block(array[b], keys[b], b, render_fn, flags);
			} else {
				block = b_blocks[b];
				if (!is_animated && should_update) {
					update_block(block, array[b], b, flags);
				}
			}

			if (insert || (moved && index !== LIS_BLOCK)) {
				last_sibling = last_block === undefined ? sibling : get_first_child(last_block);
				sibling = insert_block(block, dom, is_controlled, last_sibling);
			}

			b_blocks[b] = block;
			last_block = block;
		}
	}

	each_block.v = b_blocks;
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
 * @param {import('#client').Block} block
 * @param {Element | Comment | Text} dom
 * @param {boolean} is_controlled
 * @param {null | Text | Element | Comment} sibling
 * @returns {Text | Element | Comment}
 */
function insert_block(block, dom, is_controlled, sibling) {
	var current = /** @type {import('#client').TemplateNode} */ (block.d);

	if (sibling === null) {
		if (is_controlled) {
			return insert(current, /** @type {Element} */ (dom), null);
		} else {
			return insert(current, /** @type {Element} */ (dom.parentNode), dom);
		}
	}

	return insert(current, null, sibling);
}

/**
 * @param {import('#client').Block} block
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
 * @param {import('#client').EachItemBlock} block
 * @param {any} item
 * @param {number} index
 * @param {number} type
 * @returns {void}
 */
function update_block(block, item, index, type) {
	if ((type & EACH_ITEM_REACTIVE) !== 0) {
		set(block.v, item);
	}

	if ((type & EACH_INDEX_REACTIVE) !== 0) {
		set(/** @type {import('#client').Value<number>} */ (block.i), index);
	} else {
		block.i = index;
	}

	// TODO animations
}

/**
 * @param {import('#client').EachItemBlock} block
 * @param {any} controlled
 * @returns {void}
 */
function destroy_block(block, controlled = false) {
	const dom = block.d;
	if (!controlled && dom !== null) {
		remove(dom);
	}
	destroy_effect(/** @type {import('#client').Effect} */ (block.e));
}

/**
 * @template V
 * @param {V} item
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: null, item: V, index: number | import('#client').Value<number>) => void} render_fn
 * @param {number} flags
 * @returns {import('#client').EachItemBlock}
 */
function create_block(item, key, index, render_fn, flags) {
	const each_item_not_reactive = (flags & EACH_ITEM_REACTIVE) === 0;

	const item_value = each_item_not_reactive
		? item
		: (flags & EACH_IS_STRICT_EQUALS) !== 0
			? source(item)
			: mutable_source(item);

	/** @type {import('#client').EachItemBlock} */
	const block = {
		// animate transition
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
		v: item_value,
		// parent
		p: /** @type {import('#client').EachBlock} */ (current_block)
	};

	block.e = render_effect(
		/** @param {import('#client').EachItemBlock} block */
		(block) => {
			render_fn(null, block.v, block.i);
		},
		block,
		true
	);

	return block;
}
