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
} from '../../hydration.js';
import { clear_text_content, empty, map_get, map_set } from '../../operations.js';
import { insert, remove } from '../../reconciler.js';
import {
	current_block,
	current_effect,
	destroy_signal,
	execute_effect,
	push_destroy_fn,
	set_signal_value
} from '../../runtime.js';
import { pause_effect, render_effect, resume_effect } from '../../reactivity/computations.js';
import { source, mutable_source } from '../../reactivity/sources.js';
import { trigger_transitions } from '../../transitions.js';
import { is_array } from '../../utils.js';
import { EACH_BLOCK, EACH_ITEM_BLOCK } from '../../constants.js';
import { unstate } from '../../proxy.js';

const NEW_BLOCK = -1;
const MOVED_BLOCK = 99999999;
const LIS_BLOCK = -2;

/**
 * @param {number} flags
 * @param {Element | Comment} anchor
 * @returns {import('../../types.js').EachBlock}
 */
export function create_each_block(flags, anchor) {
	return {
		// anchor
		a: anchor,
		// dom
		d: null,
		// flags
		f: flags,
		// items
		v: [],
		// effect
		e: null,
		p: /** @type {import('../../types.js').Block} */ (current_block),
		// transition
		r: null,
		// transitions
		s: [],
		// type
		t: EACH_BLOCK
	};
}

/**
 * @param {any | import('../../types.js').Signal<any>} item
 * @param {number | import('../../types.js').Signal<number>} index
 * @param {null | unknown} key
 * @returns {import('../../types.js').EachItemBlock}
 */
export function create_each_item_block(item, index, key) {
	return {
		// animate transition
		a: null,
		// dom
		d: null,
		// effect
		e: null,
		// index
		i: index,
		// key
		k: key,
		// item
		v: item,
		// parent
		p: /** @type {import('../../types.js').EachBlock} */ (current_block),
		// transition
		r: null,
		// transitions
		s: null,
		// type
		t: EACH_ITEM_BLOCK
	};
}

/**
 * @template V
 * @param {Element | Comment} anchor_node
 * @param {() => V[]} collection
 * @param {number} flags
 * @param {null | ((item: V) => string)} key_fn
 * @param {(anchor: null, item: V, index: import('../../types.js').MaybeSignal<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each_keyed(anchor_node, collection, flags, key_fn, render_fn, fallback_fn) {
	throw new Error('TODO each_keyed');
}

/**
 * @template V
 * @param {Element | Comment} anchor_node
 * @param {() => V[]} collection
 * @param {number} flags
 * @param {(anchor: null, item: V, index: import('../../types.js').MaybeSignal<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each_indexed(anchor_node, collection, flags, render_fn, fallback_fn) {
	const is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;

	if (is_controlled) {
		if (hydrating) {
			hydrate_block_anchor(anchor_node, is_controlled);
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

	/** @type {Array<import('../../types.js').ComputationSignal | null>} */
	let effects = [];

	/** @type {import('../../types.js').ComputationSignal | null} */
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

		for (let i = length; i < nl; i += 1) {
			if (effects[i]) {
				resume_effect(effects[i]);
			} else {
				effects[i] = render_effect(
					() =>
						render_fn(
							anchor_node,
							() => {
								return collection()[i];
							},
							i
						),
					{},
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
				alternate = render_effect(() => fallback_fn(anchor_node), {}, true);
			}
		} else if (alternate) {
			pause_effect(alternate, () => {
				alternate = null;
			});
		}

		length = nl;
	});
}

/**
 * Reconcile arrays by the equality of the elements in the array. This algorithm
 * is based on Ivi's reconcilation logic:
 * https://github.com/localvoid/ivi/blob/9f1bd0918f487da5b131941228604763c5d8ef56/packages/ivi/src/client/core.ts#L968
 * @template V
 * @param {Array<V>} array
 * @param {import('../../types.js').EachBlock} each_block
 * @param {Element | Comment | Text} dom
 * @param {boolean} is_controlled
 * @param {(anchor: null, item: V, index: number | import('../../types.js').Signal<number>) => void} render_fn
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
	var a_blocks = each_block.v;
	const is_computed_key = keys !== null;
	var active_transitions = each_block.s;

	/** @type {number | void} */
	var a = a_blocks.length;

	/** @type {number} */
	var b = array.length;

	/** @type {Array<import('../../types.js').EachItemBlock>} */
	var b_blocks;
	var block;

	if (active_transitions.length !== 0) {
		destroy_active_transition_blocks(active_transitions);
	}

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
			var hydration_list = /** @type {import('../../types.js').TemplateNode[]} */ (
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
				hydrating_node = /** @type {import('../../types.js').TemplateNode} */ (
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
 * @param {import('../../types.js').TemplateNode[]} hydration_list
 * @param {import('../../types.js').TemplateNode | null} next_node
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
 * @param {import('../../types.js').Block} block
 * @param {Element | Comment | Text} dom
 * @param {boolean} is_controlled
 * @param {null | Text | Element | Comment} sibling
 * @returns {Text | Element | Comment}
 */
function insert_each_item_block(block, dom, is_controlled, sibling) {
	var current = /** @type {import('../../types.js').TemplateNode} */ (block.d);

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
 * @param {import('../../types.js').Block} block
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
 * @param {Array<import('../../types.js').EachItemBlock>} active_transitions
 * @returns {void}
 */
function destroy_active_transition_blocks(active_transitions) {
	var length = active_transitions.length;

	if (length > 0) {
		var i = 0;
		var block;
		var transition;

		for (; i < length; i++) {
			block = active_transitions[i];
			transition = block.r;
			if (transition !== null) {
				block.r = null;
				destroy_each_item_block(block, null, false);
			}
		}

		active_transitions.length = 0;
	}
}

/**
 * @param {import('../../types.js').Block} block
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
 * @param {import('../../types.js').EachItemBlock} block
 * @param {any} item
 * @param {number} index
 * @param {number} type
 * @returns {void}
 */
function update_each_item_block(block, item, index, type) {
	const block_v = block.v;
	if ((type & EACH_ITEM_REACTIVE) !== 0) {
		set_signal_value(block_v, item);
	}
	const transitions = block.s;
	const index_is_reactive = (type & EACH_INDEX_REACTIVE) !== 0;
	// Handle each item animations
	const each_animation = block.a;
	if (transitions !== null && (type & EACH_KEYED) !== 0 && each_animation !== null) {
		each_animation(block, transitions);
	}
	if (index_is_reactive) {
		set_signal_value(/** @type {import('../../types.js').Signal<number>} */ (block.i), index);
	} else {
		block.i = index;
	}
}

/**
 * @param {import('../../types.js').EachItemBlock} block
 * @param {null | Array<import('../../types.js').Block>} transition_block
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
	destroy_signal(/** @type {import('../../types.js').EffectSignal} */ (block.e));
}

/**
 * @template V
 * @param {V} item
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: null, item: V, index: number | import('../../types.js').Signal<number>) => void} render_fn
 * @param {number} flags
 * @returns {import('../../types.js').EachItemBlock}
 */
function each_item_block(item, key, index, render_fn, flags) {
	const each_item_not_reactive = (flags & EACH_ITEM_REACTIVE) === 0;

	const item_value = each_item_not_reactive
		? item
		: (flags & EACH_IS_STRICT_EQUALS) !== 0
			? source(item)
			: mutable_source(item);

	const index_value = (flags & EACH_INDEX_REACTIVE) === 0 ? index : source(index);
	const block = create_each_item_block(item_value, index_value, key);

	const effect = render_effect(
		/** @param {import('../../types.js').EachItemBlock} block */
		(block) => {
			render_fn(null, block.v, block.i);
		},
		block,
		true
	);

	block.e = effect;
	return block;
}
