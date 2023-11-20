import { append_child, map_get, map_set, clear_text_content } from './operations.js';
import {
	current_hydration_fragment,
	get_hydration_fragment,
	hydrate_block_anchor,
	set_current_hydration_fragment
} from './hydration.js';
import { is_array } from './utils.js';
import { each_item_block, destroy_each_item_block, update_each_item_block } from './render.js';
import { EACH_INDEX_REACTIVE, EACH_IS_ANIMATED, EACH_ITEM_REACTIVE } from '../../constants.js';

const NEW_BLOCK = -1;
const MOVED_BLOCK = 99999999;
const LIS_BLOCK = -2;

/** @param {string} html */
export function create_fragment_from_html(html) {
	var elem = document.createElement('template');
	elem.innerHTML = html;
	return elem.content;
}

/**
 * @param {Array<import('./types.js').TemplateNode> | import('./types.js').TemplateNode} current
 * @param {null | Element} parent_element
 * @param {null | Text | Element | Comment} sibling
 * @returns {Text | Element | Comment}
 */
export function insert(current, parent_element, sibling) {
	if (is_array(current)) {
		var i = 0;
		var node;
		for (; i < current.length; i++) {
			node = current[i];
			if (sibling === null) {
				append_child(/** @type {Element} */ (parent_element), /** @type {Node} */ (node));
			} else {
				sibling.before(/** @type {Node} */ (node));
			}
		}
		return current[0];
	} else if (current !== null) {
		if (sibling === null) {
			append_child(/** @type {Element} */ (parent_element), /** @type {Node} */ (current));
		} else {
			sibling.before(/** @type {Node} */ (current));
		}
	}
	return /** @type {Text | Element | Comment} */ (current);
}

/**
 * @param {Array<import('./types.js').TemplateNode> | import('./types.js').TemplateNode} current
 * @returns {Element | Comment | Text}
 */
export function remove(current) {
	var first_node = current;
	if (is_array(current)) {
		var i = 0;
		var node;
		for (; i < current.length; i++) {
			node = current[i];
			if (i === 0) {
				first_node = node;
			}
			if (node.isConnected) {
				node.remove();
			}
		}
	} else if (current.isConnected) {
		current.remove();
	}
	return /** @type {Element | Comment | Text} */ (first_node);
}

/**
 * @template V
 * @param {Element | Text | Comment} dom
 * @param {V} value
 * @param {boolean} svg
 * @returns {Element | Comment | (Element | Comment | Text)[]}
 */
export function reconcile_html(dom, value, svg) {
	hydrate_block_anchor(dom);
	if (current_hydration_fragment !== null) {
		return current_hydration_fragment;
	}
	var html = value + '';
	// Even if html is the empty string we need to continue to insert something or
	// else the element ordering gets out of sync, resulting in subsequent values
	// not getting inserted anymore.
	var target = dom;
	var frag_nodes;
	if (svg) {
		html = `<svg>${html}</svg>`;
	}
	var content = create_fragment_from_html(html);
	if (svg) {
		content = /** @type {DocumentFragment} */ (/** @type {unknown} */ (content.firstChild));
	}
	var clone = content.cloneNode(true);
	frag_nodes = Array.from(clone.childNodes);
	target.before(svg ? /** @type {Node} */ (clone.firstChild) : clone);
	return /** @type {Array<Text | Comment | Element>} */ (frag_nodes);
}

/**
 * @param {import('./types.js').Block} block
 * @param {Element | Comment | Text} dom
 * @param {boolean} is_controlled
 * @param {null | Text | Element | Comment} sibling
 * @returns {Text | Element | Comment}
 */
function insert_each_item_block(block, dom, is_controlled, sibling) {
	var current = /** @type {import('./types.js').TemplateNode} */ (block.d);
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
 * @param {import('./types.js').Block} block
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
 * @param {Array<import('./types.js').EachItemBlock>} active_transitions
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
 * @template V
 * @param {Array<V>} array
 * @param {import('./types.js').EachBlock} each_block
 * @param {Element | Comment | Text} dom
 * @param {boolean} is_controlled
 * @param {(anchor: null, item: V, index: number | import('./types.js').Signal<number>) => void} render_fn
 * @param {number} flags
 * @param {boolean} apply_transitions
 * @returns {void}
 */
export function reconcile_indexed_array(
	array,
	each_block,
	dom,
	is_controlled,
	render_fn,
	flags,
	apply_transitions
) {
	var a_blocks = each_block.v;
	var active_transitions = each_block.s;

	/** @type {number | void} */
	var a = a_blocks.length;

	/** @type {number} */
	var b = array.length;
	var length = Math.max(a, b);
	var index = 0;

	/** @type {Array<import('./types.js').EachItemBlock>} */
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
		while (index < length) {
			block = a_blocks[index++];
			destroy_each_item_block(block, active_transitions, apply_transitions, is_controlled);
		}
	} else {
		var item;
		b_blocks = Array(b);
		if (current_hydration_fragment !== null) {
			/** @type {Node} */
			var hydrating_node = current_hydration_fragment[0];
			for (; index < length; index++) {
				// Hydrate block
				item = array[index];
				var fragment = /** @type {Array<Text | Comment | Element>} */ (
					get_hydration_fragment(hydrating_node)
				);
				set_current_hydration_fragment(fragment);
				hydrating_node = /** @type {Node} */ (
					/** @type {Node} */ (/** @type {Node} */ (fragment.at(-1)).nextSibling).nextSibling
				);
				block = each_item_block(item, null, index, render_fn, flags);
				b_blocks[index] = block;
			}
		} else {
			for (; index < length; index++) {
				if (index >= a) {
					// Add block
					item = array[index];
					block = each_item_block(item, null, index, render_fn, flags);
					b_blocks[index] = block;
					insert_each_item_block(block, dom, is_controlled, null);
				} else if (index >= b) {
					// Remove block
					block = a_blocks[index];
					destroy_each_item_block(block, active_transitions, apply_transitions);
				} else {
					// Update block
					item = array[index];
					block = a_blocks[index];
					b_blocks[index] = block;
					update_each_item_block(block, item, index, flags);
				}
			}
		}
	}
	each_block.v = b_blocks;
}
// Reconcile arrays by the equality of the elements in the array. This algorithm
// is based on Ivi's reconcilation logic:
//
// https://github.com/localvoid/ivi/blob/9f1bd0918f487da5b131941228604763c5d8ef56/packages/ivi/src/client/core.ts#L968
//

/**
 * @template V
 * @param {Array<V>} array
 * @param {import('./types.js').EachBlock} each_block
 * @param {Element | Comment | Text} dom
 * @param {boolean} is_controlled
 * @param {(anchor: null, item: V, index: number | import('./types.js').Signal<number>) => void} render_fn
 * @param {number} flags
 * @param {boolean} apply_transitions
 * @param {Array<string> | null} keys
 * @returns {void}
 */
export function reconcile_tracked_array(
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

	/** @type {Array<import('./types.js').EachItemBlock>} */
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
		b_blocks = Array(b);
		if (current_hydration_fragment !== null) {
			var fragment;

			/** @type {Node} */
			var hydrating_node = current_hydration_fragment[0];
			while (b > 0) {
				// Hydrate block
				idx = b_end - --b;
				item = array[idx];
				key = is_computed_key ? keys[idx] : item;
				fragment = /** @type {Array<Text | Comment | Element>} */ (
					get_hydration_fragment(hydrating_node)
				);
				set_current_hydration_fragment(fragment);
				// Get the <!--ssr:..--> tag of the next item in the list
				// The fragment array can be empty if each block has no content
				hydrating_node = /** @type {Node} */ (
					/** @type {Node} */ ((fragment.at(-1) || hydrating_node).nextSibling).nextSibling
				);
				block = each_item_block(item, key, idx, render_fn, flags);
				b_blocks[idx] = block;
			}
		} else if (a === 0) {
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
			var should_update_block =
				(flags & EACH_ITEM_REACTIVE) !== 0 || (flags & EACH_INDEX_REACTIVE) !== 0;
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
				// If keys are animated, we need to do updates before actual moves
				var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
				var should_create;
				if (is_animated) {
					var i = b_length;
					while (i-- > 0) {
						b_end = i + start;
						a = sources[i];
						if (pos === MOVED_BLOCK && a !== LIS_BLOCK) {
							block = b_blocks[b_end];
							update_each_item_block(block, item, b_end, flags);
						}
					}
				}
				var last_block;
				var last_sibling;
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
	}
	each_block.v = b_blocks;
}
// Longest Increased Subsequence algorithm.

/**
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
