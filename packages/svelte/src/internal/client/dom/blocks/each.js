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
import { clear_text_content, empty } from '../operations.js';
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
import { is_array, is_frozen } from '../../utils.js';
import { INERT, STATE_SYMBOL } from '../../constants.js';

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
 * @param {import('#client').EachItem[]} items
 * @param {null | Node} controlled_anchor
 * @param {() => void} [callback]
 */
function pause_effects(items, controlled_anchor, callback) {
	/** @type {import('#client').TransitionManager[]} */
	var transitions = [];
	var length = items.length;

	for (var i = 0; i < length; i++) {
		pause_children(items[i].e, transitions, true);
	}

	// If we have a controlled anchor, it means that the each block is inside a single
	// DOM element, so we can apply a fast-path for clearing the contents of the element.
	if (length > 0 && transitions.length === 0 && controlled_anchor !== null) {
		var parent_node = /** @type {Element} */ (controlled_anchor.parentNode);
		clear_text_content(parent_node);
		parent_node.append(controlled_anchor);
	}

	run_out_transitions(transitions, () => {
		for (var i = 0; i < length; i++) {
			destroy_effect(items[i].e);
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
	var state = { flags, items: new Map(), next: null };

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

			/** @type {import('#client').EachItem} */
			var item;

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

				var child_open = /** @type {Comment} */ (child_anchor);
				child_anchor = hydrate_anchor(child_anchor);
				var value = array[i];
				var key = get_key(value, i);
				item = create_item(child_open, child_anchor, prev, null, value, key, i, render_fn, flags);
				state.items.set(key, item);
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
	var first = state.next;
	var current = first;

	/** @type {Set<import('#client').EachItem>} */
	var seen = new Set();

	/** @type {import('#client').EachState | import('#client').EachItem} */
	var prev = state;

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
			var child_open = empty();
			var child_anchor = current ? current.o : anchor;

			child_anchor.before(child_open);

			prev = create_item(
				child_open,
				child_anchor,
				prev,
				prev.next,
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

					link(a.prev, b.next);
					link(prev, a);
					link(b, start);

					current = start;
					prev = b;
					i -= 1;

					matched = [];
					stashed = [];
				} else {
					// more efficient to move earlier items to the back
					seen.delete(item);
					move(item, current, anchor);

					link(item.prev, item.next);
					link(item, prev.next);
					link(prev, item);

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

	while (current) {
		to_destroy.push(current);
		current = current.next;
	}

	var controlled_anchor = (flags & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;

	if (is_animated) {
		for (i = 0; i < to_destroy.length; i += 1) {
			to_destroy[i].a?.measure();
		}

		for (i = 0; i < to_destroy.length; i += 1) {
			to_destroy[i].a?.fix();
		}
	}

	pause_effects(to_destroy, controlled_anchor, () => {
		for (var i = 0; i < to_destroy.length; i += 1) {
			var item = to_destroy[i];
			items.delete(item.k);
			item.o.remove();
			link(item.prev, item.next);
		}
	});

	if (is_animated) {
		effect(() => {
			untrack(() => {
				for (item of to_animate) {
					item.a?.apply();
				}
			});
		});
	}
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
 * @param {Comment | Text} open
 * @param {Node} anchor
 * @param {import('#client').EachItem | import('#client').EachState} prev
 * @param {import('#client').EachItem | null} next
 * @param {V} value
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: Node, item: V | import('#client').Source<V>, index: number | import('#client').Value<number>) => void} render_fn
 * @param {number} flags
 * @returns {import('#client').EachItem}
 */
function create_item(open, anchor, prev, next, value, key, index, render_fn, flags) {
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
			o: open,
			prev,
			next
		};

		prev.next = item;
		if (next !== null) next.prev = item;

		current_each_item = item;
		item.e = branch(() => render_fn(anchor, v, i));

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
	var end = item.next ? item.next.o : anchor;
	var dest = next ? next.o : anchor;

	var node = /** @type {import('#client').TemplateNode} */ (item.o);

	while (node !== end) {
		var next_node = /** @type {import('#client').TemplateNode} */ (node.nextSibling);
		dest.before(node);
		node = next_node;
	}
}

/**
 *
 * @param {import('#client').EachItem | import('#client').EachState} prev
 * @param {import('#client').EachItem | null} next
 */
function link(prev, next) {
	prev.next = next;
	if (next !== null) next.prev = prev;
}
