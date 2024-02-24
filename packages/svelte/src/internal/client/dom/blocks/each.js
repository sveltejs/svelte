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
} from '../../hydration.js';
import { empty, map_get, map_set } from '../../operations.js';
import { insert, remove } from '../../reconciler.js';
import {
	destroy_effect,
	pause_effect,
	render_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { source, mutable_source, set } from '../../reactivity/sources.js';
import { is_array } from '../../utils.js';
import { BRANCH_EFFECT } from '../../constants.js';

const NEW_BLOCK = -1;
const MOVED_BLOCK = 99999999;
const LIS_BLOCK = -2;

/**
 * @template T
 * @typedef {T | import('#client').ValueSignal<T>} MaybeSignal
 */

/**
 * Reconcile arrays by the equality of the elements in the array. This algorithm
 * is based on Ivi's reconcilation logic:
 * https://github.com/localvoid/ivi/blob/9f1bd0918f487da5b131941228604763c5d8ef56/packages/ivi/src/client/core.ts#L968
 * @template V
 * @param {Element | Comment} anchor_node
 * @param {() => V[]} collection
 * @param {number} flags
 * @param { ((item: V) => string)} key_fn
 * @param {(anchor: null, item: V, index: MaybeSignal<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each_keyed(anchor_node, collection, flags, key_fn, render_fn, fallback_fn) {
	const is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;

	hydrate_block_anchor(anchor_node, is_controlled);

	if (is_controlled) {
		if (hydrating) {
			anchor_node = /** @type {Comment} */ (anchor_node.firstChild);
		} else {
			anchor_node.appendChild((anchor_node = empty()));
		}
	}

	/** @type {import('#client').EachItemBlock[]} */
	var a_blocks = [];

	render_effect(() => {
		/** @type {V[]} */
		const maybe_array = collection();
		var array = is_array(maybe_array)
			? maybe_array
			: maybe_array == null
				? []
				: Array.from(maybe_array);

		const is_computed_key = true;

		/** @type {number | void} */
		var a = a_blocks.length;

		/** @type {number} */
		var b = array.length;

		/** @type {Array<import('#client').EachItemBlock>} */
		var b_blocks;

		var a_end = a - 1;
		var b_end = b - 1;
		var key;
		var item;
		var idx;

		/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		b_blocks = Array(b);

		var keys = array.map(key_fn);
		var block;

		if (hydrating) {
			// Hydrate block
			var fragment;
			var hydration_list = /** @type {import('#client').TemplateNode[]} */ (
				current_hydration_fragment
			);
			var hydrating_node = hydration_list[0];
			while (b > 0) {
				fragment = get_hydration_fragment(hydrating_node);
				set_current_hydration_fragment(fragment);
				if (!fragment) {
					// If fragment is null, then that means that the server rendered less items than what
					// the client code specifies -> break out and continue with client-side node creation
					mismatch = true;
					break;
				}

				idx = b_end - --b;
				item = array[idx];
				key = is_computed_key ? keys[idx] : item;
				block = each_item_block(item, key, idx, render_fn, flags);
				b_blocks[idx] = block;

				// Get the <!--ssr:..--> tag of the next item in the list
				// The fragment array can be empty if each block has no content
				hydrating_node = /** @type {import('#client').TemplateNode} */ (
					/** @type {Node} */ ((fragment.at(-1) || hydrating_node).nextSibling).nextSibling
				);
			}

			remove_excess_hydration_nodes(hydration_list, hydrating_node);
		}

		if (a === 0) {
			// Create new blocks
			while (b > 0) {
				idx = b_end - --b;
				item = array[idx];
				key = is_computed_key ? keys[idx] : item;
				block = each_item_block(item, key, idx, render_fn, flags);
				b_blocks[idx] = block;
				insert_each_item_block(block, anchor_node, is_controlled, null);
			}
		} else {
			var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
			var should_update_block =
				(flags & (EACH_ITEM_REACTIVE | EACH_INDEX_REACTIVE)) !== 0 || is_animated;
			var start = 0;

			/** @type {null | Text | Element | Comment} */
			var sibling = null;
			item = array[b_end];
			key = is_computed_key ? keys[b_end] : item;

			// Step 1
			outer: while (true) {
				// From the end
				while (a_blocks[a_end].k === key) {
					block = a_blocks[a_end--];
					item = array[b_end];
					if (should_update_block) {
						update_each_item_block(block, item, b_end, flags);
					}
					sibling = get_first_child(block);
					b_blocks[b_end] = block;
					if (start > --b_end || start > a_end) {
						break outer;
					}
					key = is_computed_key ? keys[b_end] : item;
				}
				item = array[start];
				key = is_computed_key ? keys[start] : item;
				// At the start
				while (start <= a_end && start <= b_end && a_blocks[start].k === key) {
					item = array[start];
					block = a_blocks[start];
					if (should_update_block) {
						update_each_item_block(block, item, start, flags);
					}
					b_blocks[start] = block;
					++start;
					key = is_computed_key ? keys[start] : array[start];
				}
				break;
			}

			// Step 2
			if (start > a_end) {
				while (b_end >= start) {
					item = array[b_end];
					key = is_computed_key ? keys[b_end] : item;
					block = each_item_block(item, key, b_end, render_fn, flags);
					b_blocks[b_end--] = block;
					sibling = insert_each_item_block(block, anchor_node, is_controlled, sibling);
				}
			} else if (start > b_end) {
				b = start;
				do {
					if ((block = a_blocks[b++]) !== null) {
						// destroy_each_item_block(block, [], false);
						destroy_effect(block.e);
					}
				} while (b <= a_end);
			} else {
				// Step 3
				var pos = 0;
				var b_length = b_end - start + 1;
				var sources = new Int32Array(b_length);
				var item_index = new Map();
				for (b = 0; b < b_length; ++b) {
					a = b + start;
					sources[b] = NEW_BLOCK;
					item = array[a];
					key = is_computed_key ? keys[a] : item;
					map_set(item_index, key, a);
				}

				// If keys are animated, we need to do updates before actual moves
				if (is_animated) {
					for (b = start; b <= a_end; ++b) {
						a = map_get(item_index, /** @type {V} */ (a_blocks[b].k));
						if (a !== undefined) {
							item = array[a];
							block = a_blocks[b];
							update_each_item_block(block, item, a, flags);
						}
					}
				}

				for (b = start; b <= a_end; ++b) {
					a = map_get(item_index, /** @type {V} */ (a_blocks[b].k));
					block = a_blocks[b];
					if (a !== undefined) {
						pos = pos < a ? a : MOVED_BLOCK;
						sources[a - start] = b;
						b_blocks[a] = block;
					} else if (block !== null) {
						// destroy_each_item_block(block, [], false);
						destroy_effect(block.e);
					}
				}

				// Step 4
				if (pos === MOVED_BLOCK) {
					mark_lis(sources);
				}

				var last_block;
				var last_sibling;
				var should_create;

				while (b_length-- > 0) {
					b_end = b_length + start;
					a = sources[b_length];
					should_create = a === -1;
					item = array[b_end];

					if (should_create) {
						key = is_computed_key ? keys[b_end] : item;
						block = each_item_block(item, key, b_end, render_fn, flags);
					} else {
						block = b_blocks[b_end];
						if (!is_animated && should_update_block) {
							update_each_item_block(block, item, b_end, flags);
						}
					}

					if (should_create || (pos === MOVED_BLOCK && a !== LIS_BLOCK)) {
						last_sibling = last_block === undefined ? sibling : get_first_child(last_block);
						sibling = insert_each_item_block(block, anchor_node, is_controlled, last_sibling);
					}

					b_blocks[b_end] = block;
					last_block = block;
				}
			}

			if (mismatch) {
				// Server rendered less nodes than the client -> set empty array so that Svelte continues to operate in hydration mode
				set_current_hydration_fragment([]);
			}
		}

		a_blocks = b_blocks;
	}).f |= BRANCH_EFFECT; // TODO create a primitive for this;
}

/**
 * @template V
 * @param {Element | Comment} anchor_node
 * @param {() => V[]} collection
 * @param {number} flags
 * @param {(anchor: Element | Comment | null, item: V | (() => V), index: MaybeSignal<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each_indexed(anchor_node, collection, flags, render_fn, fallback_fn) {
	const is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;

	hydrate_block_anchor(anchor_node, is_controlled);

	if (is_controlled) {
		if (hydrating) {
			anchor_node = /** @type {Comment} */ (anchor_node.firstChild);
		} else {
			anchor_node.appendChild((anchor_node = empty()));
		}
	}

	/**
	 * Whether or not there was a "rendered fallback but want to render items" (or vice versa) hydration mismatch.
	 * Needs to be a `let` or else it isn't treeshaken out
	 */
	let mismatch = false;

	let length = 0;

	/** @type {Array<import('#client').Effect | null>} */
	let effects = [];

	/** @type {import('#client').Effect | null} */
	let alternate;

	function truncate() {
		let i = effects.length;
		while (i--) {
			if (effects[i]) {
				effects.length = i + 1;
				break;
			}
		}
	}

	render_effect(() => {
		const new_items = collection();

		let nl = new_items ? new_items.length : 0;

		let hydrating_node = hydrating ? current_hydration_fragment[0] : null;

		for (let i = length; i < nl; i += 1) {
			const effect = effects[i];
			if (effect) {
				resume_effect(effect);
			} else {
				if (hydrating && !mismatch) {
					let fragment = get_hydration_fragment(hydrating_node);
					set_current_hydration_fragment(fragment);

					if (!fragment) {
						// If fragment is null, then that means that the server rendered less items than what
						// the client code specifies -> break out and continue with client-side node creation
						mismatch = true;
						break;
					}

					// TODO helperise this
					hydrating_node = /** @type {Comment} */ (
						/** @type {Node} */ (fragment.at(-1)).nextSibling?.nextSibling
					);
				}

				effects[i] = render_effect(
					() =>
						render_fn(
							hydrating ? null : anchor_node,
							() => {
								return collection()[i];
							},
							i
						),
					true
				);
			}
		}

		for (let i = nl; i < length; i += 1) {
			const item = effects[i];
			if (item) {
				pause_effect(item, () => {
					effects[i] = null;
					truncate();
				});
			}
		}

		if (nl === 0) {
			if (alternate) {
				resume_effect(alternate);
			} else if (fallback_fn) {
				alternate = render_effect(() => fallback_fn(anchor_node), true);
			}
		} else if (alternate) {
			pause_effect(alternate, () => {
				alternate = null;
			});
		}

		length = nl;
	}).f |= BRANCH_EFFECT; // TODO create a primitive for this
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
 * @param {import('#client').EachItemBlock} block
 * @param {Element | Comment | Text} dom
 * @param {boolean} is_controlled
 * @param {null | Text | Element | Comment} sibling
 * @returns {Text | Element | Comment}
 */
function insert_each_item_block(block, dom, is_controlled, sibling) {
	var current = /** @type {import('#client').TemplateNode} */ (block.e.dom);

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
 * @param {import('#client').EachItemBlock} block
 * @returns {Text | Element | Comment}
 */
function get_first_child(block) {
	var current = block.e.dom;

	if (is_array(current)) {
		return /** @type {Text | Element | Comment} */ (current[0]);
	}

	return /** @type {Text | Element | Comment} */ (current);
}

/**
 * @param {import('#client').EachItemBlock} block
 * @returns {Text | Element | Comment}
 */
export function get_first_element(block) {
	const current = block.e.dom;

	if (is_array(current)) {
		for (let i = 0; i < current.length; i++) {
			const node = current[i];
			if (node.nodeType !== 8) {
				return node;
			}
		}
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
function update_each_item_block(block, item, index, type) {
	const block_v = block.v;
	if ((type & EACH_ITEM_REACTIVE) !== 0) {
		set(block_v, item);
	}
	// const transitions = block.s;
	const transitions = null;
	const index_is_reactive = (type & EACH_INDEX_REACTIVE) !== 0;
	// Handle each item animations
	// const each_animation = block.a;
	const each_animation = null;
	if (transitions !== null && (type & EACH_KEYED) !== 0 && each_animation !== null) {
		// each_animation(block, transitions);
	}
	if (index_is_reactive) {
		set(/** @type {import('#client').Source<number>} */ (block.i), index);
	} else {
		block.i = index;
	}
}

/**
 * @template V
 * @param {V} item
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: null, item: V, index: number | import('#client').Source<number>) => void} render_fn
 * @param {number} flags
 * @returns {import('#client').EachItemBlock}
 */
function each_item_block(item, key, index, render_fn, flags) {
	const each_item_not_reactive = (flags & EACH_ITEM_REACTIVE) === 0;

	const item_value = each_item_not_reactive
		? item
		: (flags & EACH_IS_STRICT_EQUALS) !== 0
			? source(item)
			: mutable_source(item);

	const index_value = (flags & EACH_INDEX_REACTIVE) === 0 ? index : source(index);

	/** @type {import('#client').EachItemBlock} */
	const block = {
		// @ts-expect-error
		e: null,
		i: index_value,
		k: key,
		v: item_value
	};

	block.e = render_effect(() => {
		render_fn(null, block.v, block.i);
	}, true);

	return block;
}
