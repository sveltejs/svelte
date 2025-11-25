/** @import { EachItem, EachState, Effect, MaybeSource, Source, TemplateNode, TransitionManager, Value } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js'; */
import {
	EACH_INDEX_REACTIVE,
	EACH_IS_ANIMATED,
	EACH_IS_CONTROLLED,
	EACH_ITEM_IMMUTABLE,
	EACH_ITEM_REACTIVE,
	HYDRATION_END,
	HYDRATION_START_ELSE
} from '../../../../constants.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	read_hydration_instruction,
	skip_nodes,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import {
	clear_text_content,
	create_text,
	get_first_child,
	get_next_sibling,
	should_defer_append
} from '../operations.js';
import {
	block,
	branch,
	destroy_effect,
	run_out_transitions,
	pause_children,
	pause_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { source, mutable_source, internal_set } from '../../reactivity/sources.js';
import { array_from, is_array } from '../../../shared/utils.js';
import { COMMENT_NODE, INERT } from '#client/constants';
import { queue_micro_task } from '../task.js';
import { get } from '../../runtime.js';
import { DEV } from 'esm-env';
import { derived_safe_equal } from '../../reactivity/deriveds.js';
import { current_batch } from '../../reactivity/batch.js';

/**
 * The row of a keyed each block that is currently updating. We track this
 * so that `animate:` directives have something to attach themselves to
 * @type {EachItem | null}
 */
export let current_each_item = null;

/** @param {EachItem | null} item */
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
 * @param {EachState} state
 * @param {EachItem[]} to_destroy
 * @param {null | Node} controlled_anchor
 */
function pause_effects(state, to_destroy, controlled_anchor) {
	/** @type {TransitionManager[]} */
	var transitions = [];
	var length = to_destroy.length;

	for (var i = 0; i < length; i++) {
		pause_children(to_destroy[i].e, transitions, true);
	}

	run_out_transitions(transitions, () => {
		// If we're in a controlled each block (i.e. the block is the only child of an
		// element), and we are removing all items, _and_ there are no out transitions,
		// we can use the fast path — emptying the element and replacing the anchor
		var fast_path = transitions.length === 0 && controlled_anchor !== null;

		// TODO only destroy effects if no pending batch needs them. otherwise,
		// just set `item.o` back to `false`

		if (fast_path) {
			var anchor = /** @type {Element} */ (controlled_anchor);
			var parent_node = /** @type {Element} */ (anchor.parentNode);

			clear_text_content(parent_node);
			parent_node.append(anchor);

			state.items.clear();
			link(state, to_destroy[0].prev, to_destroy[length - 1].next);
		}

		for (var i = 0; i < length; i++) {
			var item = to_destroy[i];

			if (!fast_path) {
				state.items.delete(item.k);
				link(state, item.prev, item.next);
			}

			destroy_effect(item.e, !fast_path);
		}

		if (state.first === to_destroy[0]) {
			state.first = to_destroy[0].prev;
		}
	});
}

/**
 * @template V
 * @param {Element | Comment} node The next sibling node, or the parent node if this is a 'controlled' block
 * @param {number} flags
 * @param {() => V[]} get_collection
 * @param {(value: V, index: number) => any} get_key
 * @param {(anchor: Node, item: MaybeSource<V>, index: MaybeSource<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
	var anchor = node;

	/** @type {Map<any, EachItem>} */
	var items = new Map();

	/** @type {EachItem | null} */
	var first = null;

	var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
	var is_reactive_value = (flags & EACH_ITEM_REACTIVE) !== 0;
	var is_reactive_index = (flags & EACH_INDEX_REACTIVE) !== 0;

	if (is_controlled) {
		var parent_node = /** @type {Element} */ (node);

		anchor = hydrating
			? set_hydrate_node(/** @type {Comment | Text} */ (get_first_child(parent_node)))
			: parent_node.appendChild(create_text());
	}

	if (hydrating) {
		hydrate_next();
	}

	/** @type {{ fragment: DocumentFragment | null, effect: Effect } | null} */
	var fallback = null;

	// TODO: ideally we could use derived for runes mode but because of the ability
	// to use a store which can be mutated, we can't do that here as mutating a store
	// will still result in the collection array being the same from the store
	var each_array = derived_safe_equal(() => {
		var collection = get_collection();

		return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
	});

	/** @type {V[]} */
	var array;

	var first_run = true;

	function commit() {
		reconcile(state, array, anchor, flags, get_key);

		if (fallback !== null) {
			if (array.length === 0) {
				if (fallback.fragment) {
					anchor.before(fallback.fragment);
					fallback.fragment = null;
				} else {
					resume_effect(fallback.effect);
				}

				effect.first = fallback.effect;
			} else {
				pause_effect(fallback.effect, () => {
					// TODO only null out if no pending batch needs it,
					// otherwise re-add `fallback.fragment` and move the
					// effect into it
					fallback = null;
				});
			}
		}
	}

	var effect = block(() => {
		array = /** @type {V[]} */ (get(each_array));
		var length = array.length;

		/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			var is_else = read_hydration_instruction(anchor) === HYDRATION_START_ELSE;

			if (is_else !== (length === 0)) {
				// hydration mismatch — remove the server-rendered DOM and start over
				anchor = skip_nodes();

				set_hydrate_node(anchor);
				set_hydrating(false);
				mismatch = true;
			}
		}

		var keys = new Set();
		var batch = /** @type {Batch} */ (current_batch);
		var prev = null;
		var defer = should_defer_append();

		for (var i = 0; i < length; i += 1) {
			if (
				hydrating &&
				hydrate_node.nodeType === COMMENT_NODE &&
				/** @type {Comment} */ (hydrate_node).data === HYDRATION_END
			) {
				// The server rendered fewer items than expected,
				// so break out and continue appending non-hydrated items
				anchor = /** @type {Comment} */ (hydrate_node);
				mismatch = true;
				set_hydrating(false);
			}

			var value = array[i];
			var key = get_key(value, i);

			var item = first_run ? null : items.get(key);

			if (item) {
				// update before reconciliation, to trigger any async updates
				if (is_reactive_value) {
					internal_set(item.v, value);
				}

				if (is_reactive_index) {
					internal_set(/** @type {Value<number>} */ (item.i), i);
				} else {
					item.i = i;
				}

				if (defer) {
					batch.skipped_effects.delete(item.e);
				}
			} else {
				item = create_item(
					first_run ? anchor : null,
					prev,
					value,
					key,
					i,
					render_fn,
					flags,
					get_collection
				);

				if (first_run) {
					item.o = true;

					if (prev === null) {
						first = item;
					} else {
						prev.next = item;
					}

					prev = item;
				}

				items.set(key, item);
			}

			keys.add(key);
		}

		if (length === 0 && fallback_fn && !fallback) {
			if (first_run) {
				fallback = {
					fragment: null,
					effect: branch(() => fallback_fn(anchor))
				};
			} else {
				var fragment = document.createDocumentFragment();
				var target = create_text();
				fragment.append(target);

				fallback = {
					fragment,
					effect: branch(() => fallback_fn(target))
				};
			}
		}

		// remove excess nodes
		if (hydrating && length > 0) {
			set_hydrate_node(skip_nodes());
		}

		if (!first_run) {
			if (defer) {
				for (const [key, item] of items) {
					if (!keys.has(key)) {
						batch.skipped_effects.add(item.e);
					}
				}

				batch.oncommit(commit);
				batch.ondiscard(() => {
					// TODO presumably we need to do something here?
				});
			} else {
				commit();
			}
		}

		if (mismatch) {
			// continue in hydration mode
			set_hydrating(true);
		}

		// When we mount the each block for the first time, the collection won't be
		// connected to this effect as the effect hasn't finished running yet and its deps
		// won't be assigned. However, it's possible that when reconciling the each block
		// that a mutation occurred and it's made the collection MAYBE_DIRTY, so reading the
		// collection again can provide consistency to the reactive graph again as the deriveds
		// will now be `CLEAN`.
		get(each_array);
	});

	/** @type {EachState} */
	var state = { effect, flags, items, first };

	first_run = false;

	if (hydrating) {
		anchor = hydrate_node;
	}
}

/**
 * Add, remove, or reorder items output by an each block as its input changes
 * @template V
 * @param {EachState} state
 * @param {Array<V>} array
 * @param {Element | Comment | Text} anchor
 * @param {number} flags
 * @param {(value: V, index: number) => any} get_key
 * @returns {void}
 */
function reconcile(state, array, anchor, flags, get_key) {
	var is_animated = (flags & EACH_IS_ANIMATED) !== 0;

	var length = array.length;
	var items = state.items;
	var current = state.first;

	/** @type {undefined | Set<EachItem>} */
	var seen;

	/** @type {EachItem | null} */
	var prev = null;

	/** @type {undefined | Set<EachItem>} */
	var to_animate;

	/** @type {EachItem[]} */
	var matched = [];

	/** @type {EachItem[]} */
	var stashed = [];

	/** @type {V} */
	var value;

	/** @type {any} */
	var key;

	/** @type {EachItem | undefined} */
	var item;

	/** @type {number} */
	var i;

	if (is_animated) {
		for (i = 0; i < length; i += 1) {
			value = array[i];
			key = get_key(value, i);
			item = /** @type {EachItem} */ (items.get(key));

			// offscreen == coming in now, no animation in that case,
			// else this would happen https://github.com/sveltejs/svelte/issues/17181
			if (item.o) {
				item.a?.measure();
				(to_animate ??= new Set()).add(item);
			}
		}
	}

	for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);

		item = /** @type {EachItem} */ (items.get(key));

		state.first ??= item;

		if (!item.o) {
			item.o = true;

			var next = prev ? prev.next : current;

			link(state, prev, item);
			link(state, item, next);

			move(item, next, anchor);
			prev = item;

			matched = [];
			stashed = [];

			current = prev.next;
			continue;
		}

		if ((item.e.f & INERT) !== 0) {
			resume_effect(item.e);
			if (is_animated) {
				item.a?.unfix();
				(to_animate ??= new Set()).delete(item);
			}
		}

		if (item !== current) {
			if (seen !== undefined && seen.has(item)) {
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
				// If the each block isn't inert and an item has an effect that is already inert,
				// skip over adding it to our seen Set as the item is already being handled
				if ((current.e.f & INERT) === 0) {
					(seen ??= new Set()).add(current);
				}
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

	if (current !== null || seen !== undefined) {
		var to_destroy = seen === undefined ? [] : array_from(seen);

		while (current !== null) {
			// If the each block isn't inert, then inert effects are currently outroing and will be removed once the transition is finished
			if ((current.e.f & INERT) === 0) {
				to_destroy.push(current);
			}
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

			pause_effects(state, to_destroy, controlled_anchor);
		}
	}

	if (is_animated) {
		queue_micro_task(() => {
			if (to_animate === undefined) return;
			for (item of to_animate) {
				item.a?.apply();
			}
		});
	}
}

/**
 * @template V
 * @param {Node | null} anchor
 * @param {EachItem | null} prev
 * @param {V} value
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: Node, item: V | Source<V>, index: number | Value<number>, collection: () => V[]) => void} render_fn
 * @param {number} flags
 * @param {() => V[]} get_collection
 * @returns {EachItem}
 */
function create_item(anchor, prev, value, key, index, render_fn, flags, get_collection) {
	var previous_each_item = current_each_item;
	var reactive = (flags & EACH_ITEM_REACTIVE) !== 0;
	var mutable = (flags & EACH_ITEM_IMMUTABLE) === 0;

	var v = reactive ? (mutable ? mutable_source(value, false, false) : source(value)) : value;
	var i = (flags & EACH_INDEX_REACTIVE) === 0 ? index : source(index);

	if (DEV && reactive) {
		// For tracing purposes, we need to link the source signal we create with the
		// collection + index so that tracing works as intended
		/** @type {Value} */ (v).trace = () => {
			var collection_index = typeof i === 'number' ? index : i.v;
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			get_collection()[collection_index];
		};
	}

	/** @type {EachItem} */
	var item = {
		i,
		v,
		k: key,
		a: null,
		// @ts-expect-error
		e: null,
		o: false,
		prev,
		next: null
	};

	current_each_item = item;

	try {
		if (anchor === null) {
			var fragment = document.createDocumentFragment();
			fragment.append((anchor = create_text()));
		}

		item.e = branch(() => render_fn(/** @type {Node} */ (anchor), v, i, get_collection));

		if (prev !== null) {
			// we only need to set `prev.next = item`, because
			// `item.prev = prev` was set on initialization.
			// the effects themselves are already linked
			prev.next = item;
		}

		return item;
	} finally {
		current_each_item = previous_each_item;
	}
}

/**
 * @param {EachItem} item
 * @param {EachItem | null} next
 * @param {Text | Element | Comment} anchor
 */
function move(item, next, anchor) {
	var end = item.next ? /** @type {TemplateNode} */ (item.next.e.nodes_start) : anchor;

	var dest = next ? /** @type {TemplateNode} */ (next.e.nodes_start) : anchor;
	var node = /** @type {TemplateNode} */ (item.e.nodes_start);

	while (node !== null && node !== end) {
		var next_node = /** @type {TemplateNode} */ (get_next_sibling(node));
		dest.before(node);
		node = next_node;
	}
}

/**
 * @param {EachState} state
 * @param {EachItem | null} prev
 * @param {EachItem | null} next
 */
function link(state, prev, next) {
	if (prev === null) {
		state.first = next;
		state.effect.first = next && next.e;
	} else {
		if (prev.e === state.effect.last && next !== null) {
			state.effect.last = next.e;
		}

		if (prev.e.next) {
			prev.e.next.prev = null;
		}

		prev.next = next;
		prev.e.next = next && next.e;
	}

	if (next === null) {
		state.effect.last = prev && prev.e;
	} else {
		if (next.e === state.effect.last && prev === null) {
			state.effect.last = next.e.prev;
		}

		if (next.e.prev) {
			next.e.prev.next = null;
		}

		next.prev = prev;
		next.e.prev = prev && prev.e;
	}
}
