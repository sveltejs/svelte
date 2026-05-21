/** @import { EachItem, EachOutroGroup, EachState, Effect, EffectNodes, MaybeSource, Source, TemplateNode, TransitionManager, Value } from '#client' */
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
	move_effect,
	pause_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { source, mutable_source, internal_set } from '../../reactivity/sources.js';
import { array_from, is_array } from '../../../shared/utils.js';
import { BRANCH_EFFECT, COMMENT_NODE, DESTROYED, EFFECT_OFFSCREEN, INERT } from '#client/constants';
import { queue_micro_task } from '../task.js';
import { get } from '../../runtime.js';
import { DEV } from 'esm-env';
import { derived_safe_equal } from '../../reactivity/deriveds.js';
import { current_batch } from '../../reactivity/batch.js';
import * as e from '../../errors.js';
import { tag } from '../../dev/tracing.js';

// When making substantive changes to this file, validate them with the each block stress test:
// https://svelte.dev/playground/1972b2cf46564476ad8c8c6405b23b7b
// This test also exists in this repo, as `packages/svelte/tests/manual/each-stress-test`

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
 * @param {Effect[]} to_destroy
 * @param {null | Node} controlled_anchor
 */
function pause_effects(state, to_destroy, controlled_anchor) {
	/** @type {TransitionManager[]} */
	var transitions = [];
	var length = to_destroy.length;

	/** @type {EachOutroGroup} */
	var group;
	var remaining = to_destroy.length;

	for (var i = 0; i < length; i++) {
		let effect = to_destroy[i];

		pause_effect(
			effect,
			() => {
				if (group) {
					group.pending.delete(effect);
					group.done.add(effect);

					if (group.pending.size === 0) {
						var groups = /** @type {Set<EachOutroGroup>} */ (state.outrogroups);

						destroy_effects(state, array_from(group.done));
						groups.delete(group);

						if (groups.size === 0) {
							state.outrogroups = null;
						}
					}
				} else {
					remaining -= 1;
				}
			},
			false
		);
	}

	if (remaining === 0) {
		// If we're in a controlled each block (i.e. the block is the only child of an
		// element), and we are removing all items, _and_ there are no out transitions,
		// we can use the fast path — emptying the element and replacing the anchor
		var fast_path = transitions.length === 0 && controlled_anchor !== null;

		if (fast_path) {
			var anchor = /** @type {Element} */ (controlled_anchor);
			var parent_node = /** @type {Element} */ (anchor.parentNode);

			clear_text_content(parent_node);
			parent_node.append(anchor);

			state.items.clear();
		}

		destroy_effects(state, to_destroy, !fast_path);
	} else {
		group = {
			pending: new Set(to_destroy),
			done: new Set()
		};

		(state.outrogroups ??= new Set()).add(group);
	}
}

/**
 * @param {EachState} state
 * @param {Effect[]} to_destroy
 * @param {boolean} remove_dom
 */
function destroy_effects(state, to_destroy, remove_dom = true) {
	/** @type {Set<Effect> | undefined} */
	var preserved_effects;

	// The loop-in-a-loop isn't ideal, but we should only hit this in relatively rare cases
	if (state.pending.size > 0) {
		preserved_effects = new Set();

		for (const keys of state.pending.values()) {
			for (const key of keys) {
				preserved_effects.add(/** @type {EachItem} */ (state.items.get(key)).e);
			}
		}
	}

	for (var i = 0; i < to_destroy.length; i++) {
		var e = to_destroy[i];

		if (preserved_effects?.has(e)) {
			e.f |= EFFECT_OFFSCREEN;

			const fragment = document.createDocumentFragment();
			move_effect(e, fragment);
		} else {
			destroy_effect(to_destroy[i], remove_dom);
		}
	}
}

/** @type {TemplateNode} */
var offscreen_anchor;

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

	var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;

	if (is_controlled) {
		var parent_node = /** @type {Element} */ (node);

		anchor = hydrating
			? set_hydrate_node(get_first_child(parent_node))
			: parent_node.appendChild(create_text());
	}

	if (hydrating) {
		hydrate_next();
	}

	/** @type {Effect | null} */
	var fallback = null;

	// TODO: ideally we could use derived for runes mode but because of the ability
	// to use a store which can be mutated, we can't do that here as mutating a store
	// will still result in the collection array being the same from the store
	var each_array = derived_safe_equal(() => {
		var collection = get_collection();

		return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
	});

	if (DEV) {
		tag(each_array, '{#each ...}');
	}

	/** @type {V[]} */
	var array;

	/** @type {Map<Batch, Set<any>>} */
	var pending = new Map();

	var first_run = true;

	/**
	 * @param {Batch} batch
	 */
	function commit(batch) {
		if ((state.effect.f & DESTROYED) !== 0) {
			return;
		}

		state.pending.delete(batch);

		state.fallback = fallback;
		reconcile(state, array, anchor, flags, get_key);

		if (fallback !== null) {
			if (array.length === 0) {
				if ((fallback.f & EFFECT_OFFSCREEN) === 0) {
					resume_effect(fallback);
				} else {
					fallback.f ^= EFFECT_OFFSCREEN;
					move(fallback, null, anchor);
				}
			} else {
				pause_effect(fallback, () => {
					// TODO only null out if no pending batch needs it,
					// otherwise re-add `fallback.fragment` and move the
					// effect into it
					fallback = null;
				});
			}
		}
	}

	/**
	 * @param {Batch} batch
	 */
	function discard(batch) {
		state.pending.delete(batch);
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
		var defer = should_defer_append();

		for (var index = 0; index < length; index += 1) {
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

			var value = array[index];
			var key = get_key(value, index);

			if (DEV) {
				// Check that the key function is idempotent (returns the same value when called twice)
				var key_again = get_key(value, index);
				if (key !== key_again) {
					e.each_key_volatile(String(index), String(key), String(key_again));
				}
			}

			var item = first_run ? null : items.get(key);

			if (item) {
				// update before reconciliation, to trigger any async updates
				if (item.v) internal_set(item.v, value);
				if (item.i) internal_set(item.i, index);

				if (defer) {
					batch.unskip_effect(item.e);
				}
			} else {
				item = create_item(
					items,
					first_run ? anchor : (offscreen_anchor ??= create_text()),
					value,
					key,
					index,
					render_fn,
					flags,
					get_collection
				);

				if (!first_run) {
					item.e.f |= EFFECT_OFFSCREEN;
				}

				items.set(key, item);
			}

			keys.add(key);
		}

		if (length === 0 && fallback_fn && !fallback) {
			if (first_run) {
				fallback = branch(() => fallback_fn(anchor));
			} else {
				fallback = branch(() => fallback_fn((offscreen_anchor ??= create_text())));
				fallback.f |= EFFECT_OFFSCREEN;
			}
		}

		if (length > keys.size) {
			if (DEV) {
				validate_each_keys(array, get_key);
			} else {
				// in prod, the additional information isn't printed, so don't bother computing it
				e.each_key_duplicate('', '', '');
			}
		}

		// remove excess nodes
		if (hydrating && length > 0) {
			set_hydrate_node(skip_nodes());
		}

		if (!first_run) {
			pending.set(batch, keys);

			if (defer) {
				for (const [key, item] of items) {
					if (!keys.has(key)) {
						batch.skip_effect(item.e);
					}
				}

				batch.oncommit(commit);
				batch.ondiscard(discard);
			} else {
				commit(batch);
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
	var state = { effect, flags, items, pending, outrogroups: null, fallback };

	first_run = false;

	if (hydrating) {
		anchor = hydrate_node;
	}
}

/**
 * Skip past any non-branch effects (which could be created with `createSubscriber`, for example) to find the next branch effect
 * @param {Effect | null} effect
 * @returns {Effect | null}
 */
function skip_to_branch(effect) {
	while (effect !== null && (effect.f & BRANCH_EFFECT) === 0) {
		effect = effect.next;
	}
	return effect;
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

	// Fast path: pure reorder (no additions, removals, transitions, async items, or
	// non-branch sibling effects). Uses a longest-increasing-subsequence pass that
	// produces the minimum number of DOM moves. Falls through to the heuristic
	// below for everything else.
	if (
		!is_animated &&
		state.outrogroups === null &&
		state.fallback === null &&
		try_reconcile_lis(state, array, length, items, anchor, get_key)
	) {
		return;
	}

	var current = skip_to_branch(state.effect.first);

	/** @type {undefined | Set<Effect>} */
	var seen;

	/** @type {Effect | null} */
	var prev = null;

	/** @type {undefined | Set<Effect>} */
	var to_animate;

	/** @type {Effect[]} */
	var matched = [];

	/** @type {Effect[]} */
	var stashed = [];

	/** @type {V} */
	var value;

	/** @type {any} */
	var key;

	/** @type {Effect | undefined} */
	var effect;

	/** @type {number} */
	var i;

	if (is_animated) {
		for (i = 0; i < length; i += 1) {
			value = array[i];
			key = get_key(value, i);
			effect = /** @type {EachItem} */ (items.get(key)).e;

			// offscreen == coming in now, no animation in that case,
			// else this would happen https://github.com/sveltejs/svelte/issues/17181
			if ((effect.f & EFFECT_OFFSCREEN) === 0) {
				effect.nodes?.a?.measure();
				(to_animate ??= new Set()).add(effect);
			}
		}
	}

	for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);

		effect = /** @type {EachItem} */ (items.get(key)).e;

		if (state.outrogroups !== null) {
			for (const group of state.outrogroups) {
				group.pending.delete(effect);
				group.done.delete(effect);
			}
		}

		if ((effect.f & INERT) !== 0) {
			resume_effect(effect);
			if (is_animated) {
				effect.nodes?.a?.unfix();
				(to_animate ??= new Set()).delete(effect);
			}
		}

		if ((effect.f & EFFECT_OFFSCREEN) !== 0) {
			effect.f ^= EFFECT_OFFSCREEN;

			if (effect === current) {
				move(effect, null, anchor);
			} else {
				var next = prev ? prev.next : current;

				if (effect === state.effect.last) {
					state.effect.last = effect.prev;
				}

				if (effect.prev) effect.prev.next = effect.next;
				if (effect.next) effect.next.prev = effect.prev;
				link(state, prev, effect);
				link(state, effect, next);

				move(effect, next, anchor);
				prev = effect;

				matched = [];
				stashed = [];

				current = skip_to_branch(prev.next);
				continue;
			}
		}

		if (effect !== current) {
			if (seen !== undefined && seen.has(effect)) {
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
					seen.delete(effect);
					move(effect, current, anchor);

					link(state, effect.prev, effect.next);
					link(state, effect, prev === null ? state.effect.first : prev.next);
					link(state, prev, effect);

					prev = effect;
				}

				continue;
			}

			matched = [];
			stashed = [];

			while (current !== null && current !== effect) {
				(seen ??= new Set()).add(current);
				stashed.push(current);
				current = skip_to_branch(current.next);
			}

			if (current === null) {
				continue;
			}
		}

		if ((effect.f & EFFECT_OFFSCREEN) === 0) {
			matched.push(effect);
		}

		prev = effect;
		current = skip_to_branch(effect.next);
	}

	if (state.outrogroups !== null) {
		for (const group of state.outrogroups) {
			if (group.pending.size === 0) {
				destroy_effects(state, array_from(group.done));
				state.outrogroups?.delete(group);
			}
		}

		if (state.outrogroups.size === 0) {
			state.outrogroups = null;
		}
	}

	if (current !== null || seen !== undefined) {
		/** @type {Effect[]} */
		var to_destroy = [];

		if (seen !== undefined) {
			for (effect of seen) {
				if ((effect.f & INERT) === 0) {
					to_destroy.push(effect);
				}
			}
		}

		while (current !== null) {
			// If the each block isn't inert, then inert effects are currently outroing and will be removed once the transition is finished
			if ((current.f & INERT) === 0 && current !== state.fallback) {
				to_destroy.push(current);
			}

			current = skip_to_branch(current.next);
		}

		var destroy_length = to_destroy.length;

		if (destroy_length > 0) {
			var controlled_anchor = (flags & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;

			if (is_animated) {
				for (i = 0; i < destroy_length; i += 1) {
					to_destroy[i].nodes?.a?.measure();
				}

				for (i = 0; i < destroy_length; i += 1) {
					to_destroy[i].nodes?.a?.fix();
				}
			}

			pause_effects(state, to_destroy, controlled_anchor);
		}
	}

	if (is_animated) {
		queue_micro_task(() => {
			if (to_animate === undefined) return;
			for (effect of to_animate) {
				effect.nodes?.a?.apply();
			}
		});
	}
}

/**
 * @template V
 * @param {Map<any, EachItem>} items
 * @param {Node} anchor
 * @param {V} value
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: Node, item: V | Source<V>, index: number | Value<number>, collection: () => V[]) => void} render_fn
 * @param {number} flags
 * @param {() => V[]} get_collection
 * @returns {EachItem}
 */
function create_item(items, anchor, value, key, index, render_fn, flags, get_collection) {
	var v =
		(flags & EACH_ITEM_REACTIVE) !== 0
			? (flags & EACH_ITEM_IMMUTABLE) === 0
				? mutable_source(value, false, false)
				: source(value)
			: null;

	var i = (flags & EACH_INDEX_REACTIVE) !== 0 ? source(index) : null;

	if (DEV && v) {
		// For tracing purposes, we need to link the source signal we create with the
		// collection + index so that tracing works as intended
		v.trace = () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			get_collection()[i?.v ?? index];
		};
	}

	return {
		v,
		i,
		e: branch(() => {
			render_fn(anchor, v ?? value, i ?? index, get_collection);

			return () => {
				items.delete(key);
			};
		})
	};
}

/**
 * @param {Effect} effect
 * @param {Effect | null} next
 * @param {Text | Element | Comment} anchor
 */
function move(effect, next, anchor) {
	if (!effect.nodes) return;

	var node = effect.nodes.start;
	var end = effect.nodes.end;

	var dest =
		next && (next.f & EFFECT_OFFSCREEN) === 0
			? /** @type {EffectNodes} */ (next.nodes).start
			: anchor;

	while (node !== null) {
		var next_node = /** @type {TemplateNode} */ (get_next_sibling(node));
		dest.before(node);

		if (node === end) {
			return;
		}

		node = next_node;
	}
}

/**
 * @param {EachState} state
 * @param {Effect | null} prev
 * @param {Effect | null} next
 */
function link(state, prev, next) {
	if (prev === null) {
		state.effect.first = next;
	} else {
		prev.next = next;
	}

	if (next === null) {
		state.effect.last = prev;
	} else {
		next.prev = prev;
	}
}

/**
 * LIS fast path for pure reorders. Returns `true` on success, `false` if the
 * caller should fall back to the legacy heuristic. Eligibility is checked
 * inline as we walk; we bail the moment we see anything that disqualifies
 * (transitions, outros, INERT items, offscreen items, non-branch siblings,
 * length mismatch).
 *
 * Two lockstep walks (forward from the start, backward from the end) narrow
 * the work to the unstable middle. The no-reorder case is handled by the
 * forward walk alone, without allocating anything. Local edits (a swap of
 * nearby items, a single item moved) leave a tiny middle. Reverse and shuffle
 * leave the full middle, where LIS earns its keep.
 *
 * @template V
 * @param {EachState} state
 * @param {Array<V>} array
 * @param {number} length
 * @param {Map<any, EachItem>} items
 * @param {Element | Comment | Text} anchor
 * @param {(value: V, index: number) => any} get_key
 * @returns {boolean}
 */
function try_reconcile_lis(state, array, length, items, anchor, get_key) {
	// Forward walk — consume the stable prefix.
	var prefix_end = 0;
	/** @type {Effect | null} */
	var prefix_old = state.effect.first;
	while (prefix_end < length) {
		if (prefix_old === null) return false;
		if (!is_eligible_branch(prefix_old)) return false;
		var next_e = /** @type {EachItem} */ (items.get(get_key(array[prefix_end], prefix_end))).e;
		if ((next_e.f & EFFECT_OFFSCREEN) !== 0) return false;
		if (next_e !== prefix_old) break;
		prefix_old = prefix_old.next;
		prefix_end++;
	}

	if (prefix_end === length) {
		// New array fully consumed by the prefix walk. Chain must end here too.
		return prefix_old === null;
	}

	// Backward walk — consume the stable suffix. Offscreen items (newly
	// created this batch) are appended to the chain end, so the very last
	// effect can be offscreen — that disqualifies the fast path.
	var suffix_start = length;
	/** @type {Effect | null} */
	var suffix_old = state.effect.last;
	while (suffix_start > prefix_end) {
		if (suffix_old === null) return false;
		if (!is_eligible_branch(suffix_old)) return false;
		var tail_e = /** @type {EachItem} */ (
			items.get(get_key(array[suffix_start - 1], suffix_start - 1))
		).e;
		if ((tail_e.f & EFFECT_OFFSCREEN) !== 0) return false;
		if (tail_e !== suffix_old) break;
		suffix_old = suffix_old.prev;
		suffix_start--;
	}

	if (prefix_end === suffix_start) {
		// Empty unstable middle in the new array but the old chain still has
		// items between `prefix_old` and `suffix_old` — that's a removal, which
		// the legacy path handles.
		return false;
	}

	return reconcile_lis_middle(
		state,
		array,
		length,
		items,
		anchor,
		get_key,
		prefix_end,
		suffix_start,
		/** @type {Effect} */ (prefix_old),
		/** @type {Effect} */ (suffix_old)
	);
}

/**
 * @param {Effect} effect
 * @returns {boolean}
 */
function is_eligible_branch(effect) {
	return (
		(effect.f & BRANCH_EFFECT) !== 0 &&
		(effect.f & INERT) === 0 &&
		(effect.f & EFFECT_OFFSCREEN) === 0
	);
}

/**
 * LIS reorder pass over the unstable middle identified by the prefix/suffix
 * walks. `prefix_old` is the first unstable old-chain effect and `suffix_old`
 * is the last; together they bound a contiguous run of branch effects in the
 * chain. The new-array slice `[prefix_end, suffix_start)` is the same length
 * as that run (we bail otherwise — that's an add/remove).
 *
 * @template V
 * @param {EachState} state
 * @param {Array<V>} array
 * @param {number} length
 * @param {Map<any, EachItem>} items
 * @param {Element | Comment | Text} anchor
 * @param {(value: V, index: number) => any} get_key
 * @param {number} prefix_end
 * @param {number} suffix_start
 * @param {Effect} prefix_old First unstable old-chain effect (inclusive)
 * @param {Effect} suffix_old Last unstable old-chain effect (inclusive)
 * @returns {boolean}
 */
function reconcile_lis_middle(
	state,
	array,
	length,
	items,
	anchor,
	get_key,
	prefix_end,
	suffix_start,
	prefix_old,
	suffix_old
) {
	var middle_len = suffix_start - prefix_end;

	// Build map from old-chain effect → position in the unstable old slice.
	// Bail on any non-eligible effect (non-branch, inert, or offscreen — the
	// last appears when newly-created items sit at the chain tail).
	/** @type {Map<Effect, number>} */
	var old_index_by_effect = new Map();
	/** @type {Effect | null} */
	var current = prefix_old;
	var old_count = 0;
	while (current !== null) {
		if (!is_eligible_branch(current)) return false;
		old_index_by_effect.set(current, old_count++);
		if (current === suffix_old) break;
		current = current.next;
	}

	if (old_count !== middle_len) return false;

	/** @type {Effect[]} */
	var next_effects = new Array(middle_len);
	/** @type {number[]} */
	var new_to_old = new Array(middle_len);
	for (var k = 0; k < middle_len; k++) {
		var e = /** @type {EachItem} */ (items.get(get_key(array[prefix_end + k], prefix_end + k))).e;
		if ((e.f & EFFECT_OFFSCREEN) !== 0) return false;
		var oi = old_index_by_effect.get(e);
		if (oi === undefined) return false; // not in old slice → add/remove
		next_effects[k] = e;
		new_to_old[k] = oi;
	}

	var lis = compute_lis(new_to_old);
	var lis_pointer = lis.length - 1;

	// The DOM anchor for moves: first effect of the stable suffix in the new
	// array (or the each block's anchor when there's no suffix).
	var suffix_first_effect =
		suffix_start < length
			? /** @type {EachItem} */ (items.get(get_key(array[suffix_start], suffix_start))).e
			: null;

	// Move DOM right-to-left so the anchor for effect `k` is `next_effects[k+1]`
	// which has already settled at its final DOM position.
	for (k = middle_len - 1; k >= 0; k--) {
		if (lis_pointer >= 0 && k === lis[lis_pointer]) {
			lis_pointer--;
			continue;
		}
		var next_effect = k + 1 < middle_len ? next_effects[k + 1] : suffix_first_effect;
		move(next_effects[k], next_effect, anchor);
	}

	// Patch the linked list. Prefix `[0, prefix_end)` and suffix
	// `[suffix_start, length)` are stable — leave their pointers alone. Only
	// the unstable middle needs rewiring.
	var prefix_tail = prefix_old.prev;
	var suffix_head = suffix_old.next;

	if (prefix_tail === null) {
		state.effect.first = next_effects[0];
	} else {
		prefix_tail.next = next_effects[0];
	}
	next_effects[0].prev = prefix_tail;

	for (k = 0; k < middle_len - 1; k++) {
		next_effects[k].next = next_effects[k + 1];
		next_effects[k + 1].prev = next_effects[k];
	}

	next_effects[middle_len - 1].next = suffix_head;
	if (suffix_head === null) {
		state.effect.last = next_effects[middle_len - 1];
	} else {
		suffix_head.prev = next_effects[middle_len - 1];
	}

	return true;
}

/**
 * Longest-increasing-subsequence (returns indices into `arr` that form the LIS,
 * in ascending order). Patience-sort variant; O(n log n).
 * @param {number[]} arr
 * @returns {number[]}
 */
function compute_lis(arr) {
	var n = arr.length;
	if (n === 0) return [];

	/** @type {number[]} predecessor pointer for reconstruction */
	var p = new Array(n);
	/** @type {number[]} indices of LIS so far (values are indices into `arr`) */
	var result = [0];

	for (var i = 0; i < n; i++) {
		var v = arr[i];
		var last = result[result.length - 1];
		if (arr[last] < v) {
			p[i] = last;
			result.push(i);
			continue;
		}
		// binary search: leftmost position where arr[result[pos]] >= v
		var u = 0;
		var w = result.length - 1;
		while (u < w) {
			var c = (u + w) >> 1;
			if (arr[result[c]] < v) u = c + 1;
			else w = c;
		}
		if (v < arr[result[u]]) {
			if (u > 0) p[i] = result[u - 1];
			result[u] = i;
		}
	}

	// walk predecessor pointers from the tail to reconstruct the actual sequence
	var u2 = result.length;
	var v2 = result[u2 - 1];
	while (u2-- > 0) {
		result[u2] = v2;
		v2 = p[v2];
	}
	return result;
}

/**
 * @param {Array<any>} array
 * @param {(item: any, index: number) => string} key_fn
 * @returns {void}
 */
function validate_each_keys(array, key_fn) {
	const keys = new Map();
	const length = array.length;

	for (let i = 0; i < length; i++) {
		const key = key_fn(array[i], i);

		if (keys.has(key)) {
			const a = String(keys.get(key));
			const b = String(i);

			/** @type {string | null} */
			let k = String(key);
			if (k.startsWith('[object ')) k = null;

			e.each_key_duplicate(a, b, k);
		}

		keys.set(key, i);
	}
}
