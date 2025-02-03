/** @import { Derived, Effect, Source } from '#client' */
import { DEV } from 'esm-env';
import {
	CLEAN,
	DERIVED,
	DESTROYED,
	DIRTY,
	EFFECT_PRESERVED,
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
	handle_error
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import * as e from '../errors.js';
import * as w from '../warnings.js';
import { block, destroy_effect } from './effects.js';
import { inspect_effects, internal_set, set_inspect_effects, source } from './sources.js';
import { get_stack } from '../dev/tracing.js';
import { tracing_mode_flag } from '../../flags/index.js';
import { capture, suspend } from '../dom/blocks/boundary.js';
import { component_context } from '../context.js';

/** @type {Effect | null} */
export let from_async_derived = null;

/** @param {Effect | null} v */
export function set_from_async_derived(v) {
	from_async_derived = v;
}

export const recent_async_deriveds = new Set();

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	var flags = DERIVED | DIRTY;
	var parent_derived =
		active_reaction !== null && (active_reaction.f & DERIVED) !== 0
			? /** @type {Derived} */ (active_reaction)
			: null;

	if (active_effect === null || (parent_derived !== null && (parent_derived.f & UNOWNED) !== 0)) {
		flags |= UNOWNED;
	} else {
		// Since deriveds are evaluated lazily, any effects created inside them are
		// created too late to ensure that the parent effect is added to the tree
		active_effect.f |= EFFECT_PRESERVED;
	}

	/** @type {Derived<V>} */
	const signal = {
		ctx: component_context,
		deps: null,
		effects: null,
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

	return signal;
}

/**
 * @template V
 * @param {() => Promise<V>} fn
 * @param {boolean} detect_waterfall Whether to print a warning if the value is not read immediately after update
 * @returns {Promise<Source<V>>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function async_derived(fn, detect_waterfall = true) {
	let parent = /** @type {Effect | null} */ (active_effect);

	if (parent === null) {
		throw new Error('TODO cannot create unowned async derived');
	}

	var promise = /** @type {Promise<V>} */ (/** @type {unknown} */ (undefined));
	var value = source(/** @type {V} */ (undefined));

	// TODO this isn't a block
	block(async () => {
		if (DEV) from_async_derived = active_effect;
		var current = (promise = fn());
		if (DEV) from_async_derived = null;

		var restore = capture();
		var unsuspend = suspend();

		try {
			var v = await promise;

			if ((parent.f & DESTROYED) !== 0) {
				return;
			}

			if (promise === current) {
				restore();
				from_async_derived = null;

				internal_set(value, v);

				if (DEV && detect_waterfall) {
					recent_async_deriveds.add(value);

					setTimeout(() => {
						if (recent_async_deriveds.has(value)) {
							w.await_waterfall();
							recent_async_deriveds.delete(value);
						}
					});
				}
			}
		} catch (e) {
			handle_error(e, parent, null, parent.ctx);
		} finally {
			unsuspend();

			// TODO we should probably null out active effect here,
			// rather than inside `restore()`
		}
	}, EFFECT_PRESERVED);

	return Promise.resolve(promise).then(() => value);
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
export function destroy_derived_effects(derived) {
	var effects = derived.effects;

	if (effects !== null) {
		derived.effects = null;

		for (var i = 0; i < effects.length; i += 1) {
			destroy_effect(/** @type {Effect} */ (effects[i]));
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

			destroy_derived_effects(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
			set_inspect_effects(prev_inspect_effects);
			stack.pop();
		}
	} else {
		try {
			destroy_derived_effects(derived);
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
	destroy_derived_effects(derived);
	remove_reactions(derived, 0);
	set_signal_status(derived, DESTROYED);

	derived.v = derived.deps = derived.ctx = derived.reactions = null;
}
