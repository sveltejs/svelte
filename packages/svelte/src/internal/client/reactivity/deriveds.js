/** @import { Derived, Effect, Source } from '#client' */
import { DEV } from 'esm-env';
import {
	CLEAN,
	DERIVED,
	DESTROYED,
	DIRTY,
	EFFECT_HAS_DERIVED,
	IS_ASYNC,
	MAYBE_DIRTY,
	UNOWNED
} from '../constants.js';
import {
	active_reaction,
	active_effect,
	remove_reactions,
	set_signal_status,
	skip_reaction,
	update_reaction,
	increment_write_version,
	set_active_effect,
	component_context,
	handle_error,
	get,
	flush_sync
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import * as e from '../errors.js';
import * as w from '../warnings.js';
import { block, destroy_effect } from './effects.js';
import { inspect_effects, internal_set, set_inspect_effects, source } from './sources.js';
import { get_stack } from '../dev/tracing.js';
import { tracing_mode_flag } from '../../flags/index.js';
import { capture, suspend } from '../dom/blocks/boundary.js';
import { flush_boundary_micro_tasks } from '../dom/task.js';
import { active_fork } from '../fork.js';

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	var flags = DERIVED | DIRTY;

	if (active_effect === null) {
		flags |= UNOWNED;
	} else {
		// Since deriveds are evaluated lazily, any effects created inside them are
		// created too late to ensure that the parent effect is added to the tree
		active_effect.f |= EFFECT_HAS_DERIVED;
	}

	var parent_derived =
		active_reaction !== null && (active_reaction.f & DERIVED) !== 0
			? /** @type {Derived} */ (active_reaction)
			: null;

	/** @type {Derived<V>} */
	const signal = {
		children: null,
		ctx: component_context,
		deps: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		rv: 0,
		v: /** @type {V} */ (null),
		wv: 0,
		parent: parent_derived ?? active_effect
	};

	if (DEV && tracing_mode_flag) {
		signal.created = get_stack('CreatedAt');
	}

	if (parent_derived !== null) {
		(parent_derived.children ??= []).push(signal);
	}

	return signal;
}

/**
 * @template V
 * @param {() => Promise<V>} fn
 * @returns {Promise<Source<V>>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function async_derived(fn) {
	let parent = /** @type {Effect | null} */ (active_effect);

	if (parent === null) {
		throw new Error('TODO cannot create unowned async derived');
	}

	var current = /** @type {Promise<V>} */ (/** @type {unknown} */ (undefined));
	var value = source(/** @type {V} */ (undefined));

	var derived_promise = derived(fn);

	block(async () => {
		var promise = get(derived_promise);

		var restore = capture();
		var unsuspend = suspend();
		var fork = active_fork;

		try {
			if (fork === null) {
				current = promise;
			}

			var v = await promise;

			if ((parent.f & DESTROYED) !== 0) {
				return;
			}

			if (fork !== null) {
				restore();

				var prev_v = value.v;
				var prev_wv = value.wv;

				internal_set(value, v);
				flush_sync();

				// revert
				value.v = prev_v;
				value.wv = prev_wv;
			} else if (current === promise) {
				restore();
				internal_set(value, v);
			}
		} catch (e) {
			if (fork !== null) {
				// TODO reject fork
			} else {
				handle_error(e, parent, null, parent.ctx);
			}
		} finally {
			unsuspend();

			// TODO we should probably null out active effect here,
			// rather than inside `restore()`
		}
	}, IS_ASYNC);

	return Promise.resolve(current).then(() => value);
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.equals = safe_equals;
	return signal;
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
function destroy_derived_children(derived) {
	var children = derived.children;

	if (children !== null) {
		derived.children = null;

		for (var i = 0; i < children.length; i += 1) {
			var child = children[i];
			if ((child.f & DERIVED) !== 0) {
				destroy_derived(/** @type {Derived} */ (child));
			} else {
				destroy_effect(/** @type {Effect} */ (child));
			}
		}
	}
}

/**
 * The currently updating deriveds, used to detect infinite recursion
 * in dev mode and provide a nicer error than 'too much recursion'
 * @type {Derived[]}
 */
let stack = [];

/**
 * @param {Derived} derived
 * @returns {Effect | null}
 */
function get_derived_parent_effect(derived) {
	var parent = derived.parent;
	while (parent !== null) {
		if ((parent.f & DERIVED) === 0) {
			return /** @type {Effect} */ (parent);
		}
		parent = parent.parent;
	}
	return null;
}

/**
 * @template T
 * @param {Derived} derived
 * @returns {T}
 */
export function execute_derived(derived) {
	var value;
	var prev_active_effect = active_effect;

	set_active_effect(get_derived_parent_effect(derived));

	if (DEV) {
		let prev_inspect_effects = inspect_effects;
		set_inspect_effects(new Set());
		try {
			if (stack.includes(derived)) {
				e.derived_references_self();
			}

			stack.push(derived);

			destroy_derived_children(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
			set_inspect_effects(prev_inspect_effects);
			stack.pop();
		}
	} else {
		try {
			destroy_derived_children(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
		}
	}

	return value;
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
export function update_derived(derived) {
	var value = execute_derived(derived);
	var status =
		(skip_reaction || (derived.f & UNOWNED) !== 0) && derived.deps !== null ? MAYBE_DIRTY : CLEAN;

	set_signal_status(derived, status);

	if (!derived.equals(value)) {
		derived.v = value;
		derived.wv = increment_write_version();
	}
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
export function destroy_derived(derived) {
	destroy_derived_children(derived);
	remove_reactions(derived, 0);
	set_signal_status(derived, DESTROYED);

	derived.v = derived.children = derived.deps = derived.ctx = derived.reactions = null;
}
