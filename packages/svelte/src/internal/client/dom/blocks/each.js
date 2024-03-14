import {
	EACH_INDEX_REACTIVE,
	EACH_IS_ANIMATED,
	EACH_IS_CONTROLLED,
	EACH_IS_STRICT_EQUALS,
	EACH_ITEM_REACTIVE,
	EACH_KEYED
} from '../../../../constants.js';
import { noop } from '../../../common.js';
import {
	current_hydration_fragment,
	get_hydration_fragment,
	hydrate_block_anchor,
	hydrating,
	set_current_hydration_fragment
} from '../hydration.js';
import { clear_text_content, empty } from '../operations.js';
import { insert, remove } from '../reconciler.js';
import { current_block, execute_effect } from '../../runtime.js';
import {
	destroy_effect,
	pause_effect,
	render_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { source, mutable_source, set } from '../../reactivity/sources.js';
import { trigger_transitions } from '../elements/transitions.js';
import { is_array, is_frozen, map_get, map_set } from '../../utils.js';
import { EACH_BLOCK, EACH_ITEM_BLOCK, STATE_SYMBOL } from '../../constants.js';

const NEW_BLOCK = -1;
const MOVED_BLOCK = 99999999;
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
		p: /** @type {import('#client').Block} */ (current_block),
		// transition
		r: null,
		// transitions
		s: [],
		// type
		t: EACH_BLOCK
	};

	hydrate_block_anchor(anchor_node, is_controlled);

	/** @type {V[]} */
	let array;

	/** @type {Array<string> | null} */
	let keys = null;

	/** @type {null | import('#client').Effect} */
	let render = null;

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

			if (key_fn !== null) {
				keys = array.map(key_fn);
			} else if ((flags & EACH_KEYED) === 0) {
				array.map(noop);
			}

			const length = array.length;

			if (hydrating) {
				const is_each_else_comment =
					/** @type {Comment} */ (current_hydration_fragment?.[0])?.data === 'ssr:each_else';
				// Check for hydration mismatch which can happen if the server renders the each fallback
				// but the client has items, or vice versa. If so, remove everything inside the anchor and start fresh.
				if ((is_each_else_comment && length) || (!is_each_else_comment && !length)) {
					remove(current_hydration_fragment);
					set_current_hydration_fragment(null);
					mismatch = true;
				} else if (is_each_else_comment) {
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

			if (render !== null) {
				execute_effect(render);
			}
		},
		block,
		false
	);

	render = render_effect(
		() => {
			const flags = block.f;
			const is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
			const anchor_node = block.a;
			reconcile_fn(array, block, anchor_node, is_controlled, render_fn, flags, true, keys);
		},
		block,
		true
	);

	if (mismatch) {
		// Set a fragment so that Svelte continues to operate in hydration mode
		set_current_hydration_fragment([]);
	}

	each.ondestroy = () => {
		const flags = block.f;
		const anchor_node = block.a;
		const is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
		if (fallback) destroy_effect(fallback);
		reconcile_fn([], block, anchor_node, is_controlled, render_fn, flags, false, keys);
		destroy_effect(/** @type {import('#client').Effect} */ (render));
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
	// If we are working with an array that isn't proxied or frozen, then remove strict equality and ensure the items
	// are treated as reactive, so they get wrapped in a signal.
	if ((flags & EACH_IS_STRICT_EQUALS) !== 0 && !is_frozen(array) && !(STATE_SYMBOL in array)) {
		flags ^= EACH_IS_STRICT_EQUALS;
	}

	var a_blocks = each_block.v;

	var a = a_blocks.length;
	var b = array.length;
	var min = Math.min(a, b);

	/** @type {typeof a_blocks} */
	var b_blocks = Array(b);

	var block;
	var item;

	if (hydrating) {
		/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		// Hydrate block
		var hydration_list = /** @type {import('#client').TemplateNode[]} */ (
			current_hydration_fragment
		);
		var hydrating_node = hydration_list[0];

		for (var i = 0; i < b; i++) {
			var fragment = get_hydration_fragment(hydrating_node);
			set_current_hydration_fragment(fragment);
			if (!fragment) {
				// If fragment is null, then that means that the server rendered less items than what
				// the client code specifies -> break out and continue with client-side node creation
				mismatch = true;
				break;
			}

			item = array[i];
			block = each_item_block(item, null, i, render_fn, flags);
			b_blocks[i] = block;

			hydrating_node = /** @type {import('#client').TemplateNode} */ (
				/** @type {Node} */ (/** @type {Node} */ (fragment[fragment.length - 1]).nextSibling)
					.nextSibling
			);
		}

		remove_excess_hydration_nodes(hydration_list, hydrating_node);

		if (mismatch) {
			// Server rendered less nodes than the client -> set empty array so that Svelte continues to operate in hydration mode
			set_current_hydration_fragment([]);
		}

		each_block.v = b_blocks;
	} else {
		// update items
		for (var i = 0; i < min; i += 1) {
			item = array[i];
			block = a_blocks[i];
			b_blocks[i] = block;
			update_each_item_block(block, item, i, flags);
			resume_effect(block.e);
		}

		if (b > a) {
			// add items
			for (; i < b; i += 1) {
				item = array[i];
				block = each_item_block(item, null, i, render_fn, flags);
				b_blocks[i] = block;
				insert_each_item_block(block, dom, is_controlled, null);
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
 * @param {boolean} apply_transitions
 * @param {Array<string> | null} keys
 * @returns {void}
 */
function reconcile_tracked_array(
	array,
	each_block,
	dom,
	is_controlled,
	render_fn,
	flags,
	apply_transitions,
	keys
) {
	// If we are working with an array that isn't proxied or frozen, then remove strict equality and ensure the items
	// are treated as reactive, so they get wrapped in a signal.
	if ((flags & EACH_IS_STRICT_EQUALS) !== 0 && !is_frozen(array) && !(STATE_SYMBOL in array)) {
		flags ^= EACH_IS_STRICT_EQUALS;
		// Additionally as we're in an keyed each block, we'll need ensure the itens are all wrapped in signals.
		if ((flags & EACH_ITEM_REACTIVE) === 0) {
			flags ^= EACH_ITEM_REACTIVE;
		}
	}
	var a_blocks = each_block.v;
	const is_computed_key = keys !== null;
	var active_transitions = each_block.s;

	/** @type {number | void} */
	var a = a_blocks.length;

	/** @type {number} */
	var b = array.length;

	/** @type {Array<import('#client').EachItemBlock>} */
	var b_blocks;
	var block;

	if (b === 0) {
		b_blocks = [];
		// Remove old blocks
		if (is_controlled && a !== 0) {
			clear_text_content(dom);
		}
		while (a > 0) {
			block = a_blocks[--a];
			destroy_each_item_block(block, active_transitions, apply_transitions, is_controlled);
		}
	} else {
		var a_end = a - 1;
		var b_end = b - 1;
		var key;
		var item;
		var idx;
		/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;
		b_blocks = Array(b);
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
					/** @type {Node} */ ((fragment[fragment.length - 1] || hydrating_node).nextSibling)
						.nextSibling
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
				insert_each_item_block(block, dom, is_controlled, null);
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
					sibling = insert_each_item_block(block, dom, is_controlled, sibling);
				}
			} else if (start > b_end) {
				b = start;
				do {
					if ((block = a_blocks[b++]) !== null) {
						destroy_each_item_block(block, active_transitions, apply_transitions);
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
						destroy_each_item_block(block, active_transitions, apply_transitions);
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
						sibling = insert_each_item_block(block, dom, is_controlled, last_sibling);
					}
					b_blocks[b_end] = block;
					last_block = block;
				}
			}
		}

		if (mismatch) {
			// Server rendered less nodes than the client -> set empty array so that Svelte continues to operate in hydration mode
			set_current_hydration_fragment([]);
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
function insert_each_item_block(block, dom, is_controlled, sibling) {
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
 * @param {import('#client').Block} block
 * @returns {Text | Element | Comment}
 */
export function get_first_element(block) {
	const current = block.d;

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
 * @param {null | Array<import('#client').Block>} transition_block
 * @param {boolean} apply_transitions
 * @param {any} controlled
 * @returns {void}
 */
export function destroy_each_item_block(
	block,
	transition_block,
	apply_transitions,
	controlled = false
) {
	const transitions = block.s;

	if (apply_transitions && transitions !== null) {
		// We might have pending key transitions, if so remove them first
		for (let other of transitions) {
			if (other.r === 'key') {
				transitions.delete(other);
			}
		}
		if (transitions.size === 0) {
			block.s = null;
		} else {
			trigger_transitions(transitions, 'out');
			if (transition_block !== null) {
				transition_block.push(block);
			}
			return;
		}
	}
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
function each_item_block(item, key, index, render_fn, flags) {
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
		p: /** @type {import('#client').EachBlock} */ (current_block),
		// transition
		r: null,
		// transitions
		s: null,
		// type
		t: EACH_ITEM_BLOCK
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
