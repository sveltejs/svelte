import { DEV } from 'esm-env';
import {
	check_dirtiness,
	current_component_context,
	current_effect,
	current_reaction,
	destroy_effect_children,
	execute_effect,
	get,
	is_destroying_effect,
	is_flushing_effect,
	remove_reactions,
	schedule_effect,
	set_is_destroying_effect,
	set_is_flushing_effect,
	set_signal_status,
	untrack
} from '../runtime.js';
import {
	DIRTY,
	BRANCH_EFFECT,
	RENDER_EFFECT,
	EFFECT,
	DESTROYED,
	INERT,
	EFFECT_RAN,
	BLOCK_EFFECT,
	ROOT_EFFECT,
	EFFECT_TRANSPARENT
} from '../constants.js';
import { set } from './sources.js';
import { remove } from '../dom/reconciler.js';

/**
 * @param {import("#client").Effect} effect
 * @param {import("#client").Reaction} parent_effect
 */
export function push_effect(effect, parent_effect) {
	var parent_last = parent_effect.last;
	if (parent_last === null) {
		parent_effect.last = parent_effect.first = effect;
	} else {
		parent_last.next = effect;
		effect.prev = parent_last;
		parent_effect.last = effect;
	}
}

/**
 * @param {number} type
 * @param {(() => void | (() => void))} fn
 * @param {boolean} sync
 * @returns {import('#client').Effect}
 */
function create_effect(type, fn, sync) {
	var is_root = (type & ROOT_EFFECT) !== 0;

	/** @type {import('#client').Effect} */
	var effect = {
		ctx: current_component_context,
		deps: null,
		dom: null,
		f: type | DIRTY,
		first: null,
		fn,
		last: null,
		next: null,
		parent: is_root ? null : current_effect,
		prev: null,
		teardown: null,
		transitions: null
	};

	if (current_reaction !== null && !is_root) {
		push_effect(effect, current_reaction);
	}

	if (sync) {
		var previously_flushing_effect = is_flushing_effect;

		try {
			set_is_flushing_effect(true);
			execute_effect(effect);
			effect.f |= EFFECT_RAN;
		} finally {
			set_is_flushing_effect(previously_flushing_effect);
		}
	} else {
		schedule_effect(effect);
	}

	return effect;
}

/**
 * Internal representation of `$effect.active()`
 * @returns {boolean}
 */
export function effect_active() {
	return current_effect ? (current_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 : false;
}

/**
 * Internal representation of `$effect(...)`
 * @param {() => void | (() => void)} fn
 */
export function user_effect(fn) {
	if (current_effect === null) {
		throw new Error(
			'ERR_SVELTE_ORPHAN_EFFECT' +
				(DEV ? ': The Svelte $effect rune can only be used during component initialisation.' : '')
		);
	}
	if (is_destroying_effect) {
		throw new Error(
			'ERR_SVELTE_EFFECT_IN_TEARDOWN' +
				(DEV ? ': The Svelte $effect rune can not be used in the teardown phase of an effect.' : '')
		);
	}

	// Non-nested `$effect(...)` in a component should be deferred
	// until the component is mounted
	const defer =
		current_effect.f & RENDER_EFFECT &&
		// TODO do we actually need this? removing them changes nothing
		current_component_context !== null &&
		!current_component_context.m;

	if (defer) {
		const context = /** @type {import('#client').ComponentContext} */ (current_component_context);
		(context.e ??= []).push(fn);
	} else {
		effect(fn);
	}
}

/**
 * Internal representation of `$effect.pre(...)`
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function user_pre_effect(fn) {
	if (current_effect === null) {
		throw new Error(
			'ERR_SVELTE_ORPHAN_EFFECT' +
				(DEV
					? ': The Svelte $effect.pre rune can only be used during component initialisation.'
					: '')
		);
	}
	if (is_destroying_effect) {
		throw new Error(
			'ERR_SVELTE_EFFECT_IN_TEARDOWN' +
				(DEV
					? ': The Svelte $effect.pre rune can not be used in the teardown phase of an effect.'
					: '')
		);
	}

	return render_effect(fn);
}

/**
 * Internal representation of `$effect.root(...)`
 * @param {() => void | (() => void)} fn
 * @returns {() => void}
 */
export function effect_root(fn) {
	const effect = create_effect(ROOT_EFFECT, fn, true);
	return () => {
		destroy_effect(effect);
	};
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function effect(fn) {
	return create_effect(EFFECT, fn, false);
}

/**
 * Internal representation of `$: ..`
 * @param {() => any} deps
 * @param {() => void | (() => void)} fn
 */
export function legacy_pre_effect(deps, fn) {
	var context = /** @type {import('#client').ComponentContext} */ (current_component_context);

	/** @type {{ effect: null | import('#client').Effect, ran: boolean }} */
	var token = { effect: null, ran: false };
	context.l1.push(token);

	token.effect = render_effect(() => {
		deps();

		// If this legacy pre effect has already run before the end of the reset, then
		// bail-out to emulate the same behavior.
		if (token.ran) return;

		token.ran = true;
		set(context.l2, true);
		untrack(fn);
	});
}

export function legacy_pre_effect_reset() {
	var context = /** @type {import('#client').ComponentContext} */ (current_component_context);

	render_effect(() => {
		if (!get(context.l2)) return;

		// Run dirty `$:` statements
		for (var token of context.l1) {
			var effect = token.effect;

			if (check_dirtiness(effect)) {
				execute_effect(effect);
			}

			token.ran = false;
		}

		context.l2.v = false; // set directly to avoid rerunning this effect
	});
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function render_effect(fn) {
	return create_effect(RENDER_EFFECT, fn, true);
}

/** @param {(() => void)} fn */
export function block(fn) {
	return create_effect(RENDER_EFFECT | BLOCK_EFFECT, fn, true);
}

/** @param {(() => void)} fn */
export function branch(fn) {
	return create_effect(RENDER_EFFECT | BRANCH_EFFECT, fn, true);
}

/**
 * @param {import("#client").Effect} effect
 */
export function execute_effect_teardown(effect) {
	var teardown = effect.teardown;
	if (teardown !== null) {
		const previously_destroying_effect = is_destroying_effect;
		set_is_destroying_effect(true);
		try {
			teardown.call(null);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
		}
	}
}

/**
 * @param {import('#client').Effect} effect
 * @returns {void}
 */
export function destroy_effect(effect) {
	var dom = effect.dom;

	if (dom !== null) {
		remove(dom);
	}

	destroy_effect_children(effect);
	remove_reactions(effect, 0);
	set_signal_status(effect, DESTROYED);

	if (effect.transitions) {
		for (const transition of effect.transitions) {
			transition.stop();
		}
	}

	execute_effect_teardown(effect);

	var parent = effect.parent;

	// If the parent doesn't have any children, then skip this work altogether
	if (parent !== null && (effect.f & BRANCH_EFFECT) !== 0 && parent.first !== null) {
		var previous = effect.prev;
		var next = effect.next;
		if (previous !== null) {
			if (next !== null) {
				previous.next = next;
				next.prev = previous;
			} else {
				previous.next = null;
				parent.last = previous;
			}
		} else if (next !== null) {
			next.prev = null;
			parent.first = next;
		} else {
			parent.first = null;
			parent.last = null;
		}
	}

	// `first` and `child` are nulled out in destroy_effect_children
	effect.next =
		effect.prev =
		effect.teardown =
		effect.ctx =
		effect.dom =
		effect.deps =
		effect.parent =
		// @ts-expect-error
		effect.fn =
			null;
}

/**
 * When a block effect is removed, we don't immediately destroy it or yank it
 * out of the DOM, because it might have transitions. Instead, we 'pause' it.
 * It stays around (in memory, and in the DOM) until outro transitions have
 * completed, and if the state change is reversed then we _resume_ it.
 * A paused effect does not update, and the DOM subtree becomes inert.
 * @param {import('#client').Effect} effect
 * @param {() => void} [callback]
 */
export function pause_effect(effect, callback) {
	/** @type {import('#client').TransitionManager[]} */
	var transitions = [];

	pause_children(effect, transitions, true);

	run_out_transitions(transitions, () => {
		destroy_effect(effect);
		if (callback) callback();
	});
}

/**
 * @param {import('#client').TransitionManager[]} transitions
 * @param {() => void} fn
 */
export function run_out_transitions(transitions, fn) {
	var remaining = transitions.length;
	if (remaining > 0) {
		var check = () => --remaining || fn();
		for (var transition of transitions) {
			transition.out(check);
		}
	} else {
		fn();
	}
}

/**
 * @param {import('#client').Effect} effect
 * @param {import('#client').TransitionManager[]} transitions
 * @param {boolean} local
 */
export function pause_children(effect, transitions, local) {
	if ((effect.f & INERT) !== 0) return;
	effect.f ^= INERT;

	if (effect.transitions !== null) {
		for (const transition of effect.transitions) {
			if (transition.is_global || local) {
				transitions.push(transition);
			}
		}
	}

	var child = effect.first;

	while (child !== null) {
		var sibling = child.next;
		var transparent = (child.f & EFFECT_TRANSPARENT) !== 0 || (child.f & BRANCH_EFFECT) !== 0;
		// TODO we don't need to call pause_children recursively with a linked list in place
		// it's slightly more involved though as we have to account for `transparent` changing
		// through the tree.
		pause_children(child, transitions, transparent ? local : false);
		child = sibling;
	}
}

/**
 * The opposite of `pause_effect`. We call this if (for example)
 * `x` becomes falsy then truthy: `{#if x}...{/if}`
 * @param {import('#client').Effect} effect
 */
export function resume_effect(effect) {
	resume_children(effect, true);
}

/**
 * @param {import('#client').Effect} effect
 * @param {boolean} local
 */
function resume_children(effect, local) {
	if ((effect.f & INERT) === 0) return;
	effect.f ^= INERT;

	// If a dependency of this effect changed while it was paused,
	// apply the change now
	if (check_dirtiness(effect)) {
		execute_effect(effect);
	}

	var child = effect.first;

	while (child !== null) {
		var sibling = child.next;
		var transparent = (child.f & EFFECT_TRANSPARENT) !== 0 || (child.f & BRANCH_EFFECT) !== 0;
		// TODO we don't need to call resume_children recursively with a linked list in place
		// it's slightly more involved though as we have to account for `transparent` changing
		// through the tree.
		resume_children(child, transparent ? local : false);
		child = sibling;
	}

	if (effect.transitions !== null) {
		for (const transition of effect.transitions) {
			if (transition.is_global || local) {
				transition.in();
			}
		}
	}
}
