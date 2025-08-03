/** @import { Derived, Effect, Reaction, Signal, Source, Value } from '#client' */
import { DEV } from 'esm-env';
import { get_descriptors, get_prototype_of, index_of } from '../shared/utils.js';
import {
	destroy_block_effect_children,
	destroy_effect_children,
	execute_effect_teardown
} from './reactivity/effects.js';
import {
	DIRTY,
	MAYBE_DIRTY,
	CLEAN,
	DERIVED,
	UNOWNED,
	DESTROYED,
	BRANCH_EFFECT,
	STATE_SYMBOL,
	BLOCK_EFFECT,
	ROOT_EFFECT,
	DISCONNECTED,
	REACTION_IS_UPDATING,
	STALE_REACTION,
	ERROR_VALUE
} from './constants.js';
import { old_values } from './reactivity/sources.js';
import {
	destroy_derived_effects,
	execute_derived,
	current_async_effect,
	recent_async_deriveds,
	update_derived
} from './reactivity/deriveds.js';
import { async_mode_flag, tracing_mode_flag } from '../flags/index.js';
import { tracing_expressions, get_stack } from './dev/tracing.js';
import {
	component_context,
	dev_current_component_function,
	dev_stack,
	is_runes,
	set_component_context,
	set_dev_current_component_function,
	set_dev_stack
} from './context.js';
import * as w from './warnings.js';
import { Batch, batch_deriveds, flushSync, schedule_effect } from './reactivity/batch.js';
import { handle_error } from './error-handling.js';
import { UNINITIALIZED } from '../../constants.js';
import { captured_signals } from './legacy.js';

export let is_updating_effect = false;

/** @param {boolean} value */
export function set_is_updating_effect(value) {
	is_updating_effect = value;
}

export let is_destroying_effect = false;

/** @param {boolean} value */
export function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}

/** @type {null | Reaction} */
export let active_reaction = null;

export let untracking = false;

/** @param {null | Reaction} reaction */
export function set_active_reaction(reaction) {
	active_reaction = reaction;
}

/** @type {null | Effect} */
export let active_effect = null;

/** @param {null | Effect} effect */
export function set_active_effect(effect) {
	active_effect = effect;
}

/**
 * When sources are created within a reaction, reading and writing
 * them within that reaction should not cause a re-run
 * @type {null | Source[]}
 */
export let current_sources = null;

/** @param {Value} value */
export function push_reaction_value(value) {
	if (active_reaction !== null && (!async_mode_flag || (active_reaction.f & DERIVED) !== 0)) {
		if (current_sources === null) {
			current_sources = [value];
		} else {
			current_sources.push(value);
		}
	}
}

/**
 * The dependencies of the reaction that is currently being executed. In many cases,
 * the dependencies are unchanged between runs, and so this will be `null` unless
 * and until a new dependency is accessed — we track this via `skipped_deps`
 * @type {null | Value[]}
 */
let new_deps = null;

let skipped_deps = 0;

/**
 * Tracks writes that the effect it's executed in doesn't listen to yet,
 * so that the dependency can be added to the effect later on if it then reads it
 * @type {null | Source[]}
 */
export let untracked_writes = null;

/** @param {null | Source[]} value */
export function set_untracked_writes(value) {
	untracked_writes = value;
}

/**
 * @type {number} Used by sources and deriveds for handling updates.
 * Version starts from 1 so that unowned deriveds differentiate between a created effect and a run one for tracing
 **/
export let write_version = 1;

/** @type {number} Used to version each read of a source of derived to avoid duplicating depedencies inside a reaction */
let read_version = 0;

export let update_version = read_version;

/** @param {number} value */
export function set_update_version(value) {
	update_version = value;
}

// If we are working with a get() chain that has no active container,
// to prevent memory leaks, we skip adding the reaction.
export let skip_reaction = false;

export function increment_write_version() {
	return ++write_version;
}

/**
 * Determines whether a derived or effect is dirty.
 * If it is MAYBE_DIRTY, will set the status to CLEAN
 * @param {Reaction} reaction
 * @returns {boolean}
 */
export function is_dirty(reaction) {
	var flags = reaction.f;

	if ((flags & DIRTY) !== 0) {
		return true;
	}

	if ((flags & MAYBE_DIRTY) !== 0) {
		var dependencies = reaction.deps;
		var is_unowned = (flags & UNOWNED) !== 0;

		if (dependencies !== null) {
			var i;
			var dependency;
			var is_disconnected = (flags & DISCONNECTED) !== 0;
			var is_unowned_connected = is_unowned && active_effect !== null && !skip_reaction;
			var length = dependencies.length;

			// If we are working with a disconnected or an unowned signal that is now connected (due to an active effect)
			// then we need to re-connect the reaction to the dependency, unless the effect has already been destroyed
			// (which can happen if the derived is read by an async derived)
			if (
				(is_disconnected || is_unowned_connected) &&
				(active_effect === null || (active_effect.f & DESTROYED) === 0)
			) {
				var derived = /** @type {Derived} */ (reaction);
				var parent = derived.parent;

				for (i = 0; i < length; i++) {
					dependency = dependencies[i];

					// We always re-add all reactions (even duplicates) if the derived was
					// previously disconnected, however we don't if it was unowned as we
					// de-duplicate dependencies in that case
					if (is_disconnected || !dependency?.reactions?.includes(derived)) {
						(dependency.reactions ??= []).push(derived);
					}
				}

				if (is_disconnected) {
					derived.f ^= DISCONNECTED;
				}
				// If the unowned derived is now fully connected to the graph again (it's unowned and reconnected, has a parent
				// and the parent is not unowned), then we can mark it as connected again, removing the need for the unowned
				// flag
				if (is_unowned_connected && parent !== null && (parent.f & UNOWNED) === 0) {
					derived.f ^= UNOWNED;
				}
			}

			for (i = 0; i < length; i++) {
				dependency = dependencies[i];

				if (is_dirty(/** @type {Derived} */ (dependency))) {
					update_derived(/** @type {Derived} */ (dependency));
				}

				if (dependency.wv > reaction.wv) {
					return true;
				}
			}
		}

		// Unowned signals should never be marked as clean unless they
		// are used within an active_effect without skip_reaction
		if (!is_unowned || (active_effect !== null && !skip_reaction)) {
			set_signal_status(reaction, CLEAN);
		}
	}

	return false;
}

/**
 * @param {Value} signal
 * @param {Effect} effect
 * @param {boolean} [root]
 */
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
	var reactions = signal.reactions;
	if (reactions === null) return;

	if (!async_mode_flag && current_sources?.includes(signal)) {
		return;
	}

	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];

		if ((reaction.f & DERIVED) !== 0) {
			schedule_possible_effect_self_invalidation(/** @type {Derived} */ (reaction), effect, false);
		} else if (effect === reaction) {
			if (root) {
				set_signal_status(reaction, DIRTY);
			} else if ((reaction.f & CLEAN) !== 0) {
				set_signal_status(reaction, MAYBE_DIRTY);
			}
			schedule_effect(/** @type {Effect} */ (reaction));
		}
	}
}

/** @param {Reaction} reaction */
export function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_skip_reaction = skip_reaction;
	var previous_sources = current_sources;
	var previous_component_context = component_context;
	var previous_untracking = untracking;
	var previous_update_version = update_version;

	var flags = reaction.f;

	new_deps = /** @type {null | Value[]} */ (null);
	skipped_deps = 0;
	untracked_writes = null;
	skip_reaction =
		(flags & UNOWNED) !== 0 && (untracking || !is_updating_effect || active_reaction === null);
	active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;

	current_sources = null;
	set_component_context(reaction.ctx);
	untracking = false;
	update_version = ++read_version;

	if (reaction.ac !== null) {
		reaction.ac.abort(STALE_REACTION);
		reaction.ac = null;
	}

	try {
		reaction.f |= REACTION_IS_UPDATING;
		var result = /** @type {Function} */ (0, reaction.fn)();
		var deps = reaction.deps;

		if (new_deps !== null) {
			var i;

			remove_reactions(reaction, skipped_deps);

			if (deps !== null && skipped_deps > 0) {
				deps.length = skipped_deps + new_deps.length;
				for (i = 0; i < new_deps.length; i++) {
					deps[skipped_deps + i] = new_deps[i];
				}
			} else {
				reaction.deps = deps = new_deps;
			}

			if (
				!skip_reaction ||
				// Deriveds that already have reactions can cleanup, so we still add them as reactions
				((flags & DERIVED) !== 0 &&
					/** @type {import('#client').Derived} */ (reaction).reactions !== null)
			) {
				for (i = skipped_deps; i < deps.length; i++) {
					(deps[i].reactions ??= []).push(reaction);
				}
			}
		} else if (deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}

		// If we're inside an effect and we have untracked writes, then we need to
		// ensure that if any of those untracked writes result in re-invalidation
		// of the current effect, then that happens accordingly
		if (
			is_runes() &&
			untracked_writes !== null &&
			!untracking &&
			deps !== null &&
			(reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0
		) {
			for (i = 0; i < /** @type {Source[]} */ (untracked_writes).length; i++) {
				schedule_possible_effect_self_invalidation(
					untracked_writes[i],
					/** @type {Effect} */ (reaction)
				);
			}
		}

		// If we are returning to an previous reaction then
		// we need to increment the read version to ensure that
		// any dependencies in this reaction aren't marked with
		// the same version
		if (previous_reaction !== null && previous_reaction !== reaction) {
			read_version++;

			if (untracked_writes !== null) {
				if (previous_untracked_writes === null) {
					previous_untracked_writes = untracked_writes;
				} else {
					previous_untracked_writes.push(.../** @type {Source[]} */ (untracked_writes));
				}
			}
		}

		if ((reaction.f & ERROR_VALUE) !== 0) {
			reaction.f ^= ERROR_VALUE;
		}

		return result;
	} catch (error) {
		return handle_error(error);
	} finally {
		reaction.f ^= REACTION_IS_UPDATING;
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		skip_reaction = previous_skip_reaction;
		current_sources = previous_sources;
		set_component_context(previous_component_context);
		untracking = previous_untracking;
		update_version = previous_update_version;
	}
}

/**
 * @template V
 * @param {Reaction} signal
 * @param {Value<V>} dependency
 * @returns {void}
 */
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) {
				reactions = dependency.reactions = null;
			} else {
				// Swap with last element and then remove.
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}

	// If the derived has no reactions, then we can disconnect it from the graph,
	// allowing it to either reconnect in the future, or be GC'd by the VM.
	if (
		reactions === null &&
		(dependency.f & DERIVED) !== 0 &&
		// Destroying a child effect while updating a parent effect can cause a dependency to appear
		// to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
		// allows us to skip the expensive work of disconnecting and immediately reconnecting it
		(new_deps === null || !new_deps.includes(dependency))
	) {
		set_signal_status(dependency, MAYBE_DIRTY);
		// If we are working with a derived that is owned by an effect, then mark it as being
		// disconnected.
		if ((dependency.f & (UNOWNED | DISCONNECTED)) === 0) {
			dependency.f ^= DISCONNECTED;
		}
		// Disconnect any reactions owned by this reaction
		destroy_derived_effects(/** @type {Derived} **/ (dependency));
		remove_reactions(/** @type {Derived} **/ (dependency), 0);
	}
}

/**
 * @param {Reaction} signal
 * @param {number} start_index
 * @returns {void}
 */
export function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;

	for (var i = start_index; i < dependencies.length; i++) {
		remove_reaction(signal, dependencies[i]);
	}
}

/**
 * @param {Effect} effect
 * @returns {void}
 */
export function update_effect(effect) {
	var flags = effect.f;

	if ((flags & DESTROYED) !== 0) {
		return;
	}

	set_signal_status(effect, CLEAN);

	var previous_effect = active_effect;
	var was_updating_effect = is_updating_effect;

	active_effect = effect;
	is_updating_effect = true;

	if (DEV) {
		var previous_component_fn = dev_current_component_function;
		set_dev_current_component_function(effect.component_function);
		var previous_stack = /** @type {any} */ (dev_stack);
		// only block effects have a dev stack, keep the current one otherwise
		set_dev_stack(effect.dev_stack ?? dev_stack);
	}

	try {
		if ((flags & BLOCK_EFFECT) !== 0) {
			destroy_block_effect_children(effect);
		} else {
			destroy_effect_children(effect);
		}

		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === 'function' ? teardown : null;
		effect.wv = write_version;

		// In DEV, increment versions of any sources that were written to during the effect,
		// so that they are correctly marked as dirty when the effect re-runs
		if (DEV && tracing_mode_flag && (effect.f & DIRTY) !== 0 && effect.deps !== null) {
			for (var dep of effect.deps) {
				if (dep.set_during_effect) {
					dep.wv = increment_write_version();
					dep.set_during_effect = false;
				}
			}
		}
	} finally {
		is_updating_effect = was_updating_effect;
		active_effect = previous_effect;

		if (DEV) {
			set_dev_current_component_function(previous_component_fn);
			set_dev_stack(previous_stack);
		}
	}
}

/**
 * Returns a promise that resolves once any pending state changes have been applied.
 * @returns {Promise<void>}
 */
export async function tick() {
	if (async_mode_flag) {
		return new Promise((f) => requestAnimationFrame(() => f()));
	}

	await Promise.resolve();

	// By calling flushSync we guarantee that any pending state changes are applied after one tick.
	// TODO look into whether we can make flushing subsequent updates synchronously in the future.
	flushSync();
}

/**
 * Returns a promise that resolves once any state changes, and asynchronous work resulting from them,
 * have resolved and the DOM has been updated
 * @returns {Promise<void>}
 * @since 5.36
 */
export function settled() {
	return Batch.ensure().settled();
}

/**
 * @template V
 * @param {Value<V>} signal
 * @returns {V}
 */
export function get(signal) {
	var flags = signal.f;
	var is_derived = (flags & DERIVED) !== 0;

	captured_signals?.add(signal);

	// Register the dependency on the current reaction signal.
	if (active_reaction !== null && !untracking) {
		// if we're in a derived that is being read inside an _async_ derived,
		// it's possible that the effect was already destroyed. In this case,
		// we don't add the dependency, because that would create a memory leak
		var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;

		if (!destroyed && !current_sources?.includes(signal)) {
			var deps = active_reaction.deps;

			if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
				// we're in the effect init/update cycle
				if (signal.rv < read_version) {
					signal.rv = read_version;

					// If the signal is accessing the same dependencies in the same
					// order as it did last time, increment `skipped_deps`
					// rather than updating `new_deps`, which creates GC cost
					if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
						skipped_deps++;
					} else if (new_deps === null) {
						new_deps = [signal];
					} else if (!skip_reaction || !new_deps.includes(signal)) {
						// Normally we can push duplicated dependencies to `new_deps`, but if we're inside
						// an unowned derived because skip_reaction is true, then we need to ensure that
						// we don't have duplicates
						new_deps.push(signal);
					}
				}
			} else {
				// we're adding a dependency outside the init/update cycle
				// (i.e. after an `await`)
				(active_reaction.deps ??= []).push(signal);

				var reactions = signal.reactions;

				if (reactions === null) {
					signal.reactions = [active_reaction];
				} else if (!reactions.includes(active_reaction)) {
					reactions.push(active_reaction);
				}
			}
		}
	} else if (
		is_derived &&
		/** @type {Derived} */ (signal).deps === null &&
		/** @type {Derived} */ (signal).effects === null
	) {
		var derived = /** @type {Derived} */ (signal);
		var parent = derived.parent;

		if (parent !== null && (parent.f & UNOWNED) === 0) {
			// If the derived is owned by another derived then mark it as unowned
			// as the derived value might have been referenced in a different context
			// since and thus its parent might not be its true owner anymore
			derived.f ^= UNOWNED;
		}
	}

	if (DEV) {
		if (current_async_effect) {
			var tracking = (current_async_effect.f & REACTION_IS_UPDATING) !== 0;
			var was_read = current_async_effect.deps?.includes(signal);

			if (!tracking && !untracking && !was_read) {
				w.await_reactivity_loss(/** @type {string} */ (signal.label));

				var trace = get_stack('TracedAt');
				// eslint-disable-next-line no-console
				if (trace) console.warn(trace);
			}
		}

		recent_async_deriveds.delete(signal);

		if (
			tracing_mode_flag &&
			!untracking &&
			tracing_expressions !== null &&
			active_reaction !== null &&
			tracing_expressions.reaction === active_reaction
		) {
			// Used when mapping state between special blocks like `each`
			if (signal.trace) {
				signal.trace();
			} else {
				trace = get_stack('TracedAt');

				if (trace) {
					var entry = tracing_expressions.entries.get(signal);

					if (entry === undefined) {
						entry = { traces: [] };
						tracing_expressions.entries.set(signal, entry);
					}

					var last = entry.traces[entry.traces.length - 1];

					// traces can be duplicated, e.g. by `snapshot` invoking both
					// both `getOwnPropertyDescriptor` and `get` traps at once
					if (trace.stack !== last?.stack) {
						entry.traces.push(trace);
					}
				}
			}
		}
	}

	if (is_destroying_effect) {
		if (old_values.has(signal)) {
			return old_values.get(signal);
		}

		if (is_derived) {
			derived = /** @type {Derived} */ (signal);

			var value = derived.v;

			// if the derived is dirty and has reactions, or depends on the values that just changed, re-execute
			// (a derived can be maybe_dirty due to the effect destroy removing its last reaction)
			if (
				((derived.f & CLEAN) === 0 && derived.reactions !== null) ||
				depends_on_old_values(derived)
			) {
				value = execute_derived(derived);
			}

			old_values.set(derived, value);

			return value;
		}
	} else if (is_derived) {
		derived = /** @type {Derived} */ (signal);

		if (batch_deriveds?.has(derived)) {
			return batch_deriveds.get(derived);
		}

		if (is_dirty(derived)) {
			update_derived(derived);
		}
	}

	if ((signal.f & ERROR_VALUE) !== 0) {
		throw signal.v;
	}

	return signal.v;
}

/** @param {Derived} derived */
function depends_on_old_values(derived) {
	if (derived.v === UNINITIALIZED) return true; // we don't know, so assume the worst
	if (derived.deps === null) return false;

	for (const dep of derived.deps) {
		if (old_values.has(dep)) {
			return true;
		}

		if ((dep.f & DERIVED) !== 0 && depends_on_old_values(/** @type {Derived} */ (dep))) {
			return true;
		}
	}

	return false;
}

/**
 * Like `get`, but checks for `undefined`. Used for `var` declarations because they can be accessed before being declared
 * @template V
 * @param {Value<V> | undefined} signal
 * @returns {V | undefined}
 */
export function safe_get(signal) {
	return signal && get(signal);
}

/**
 * When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
 * any state read inside `fn` will not be treated as a dependency.
 *
 * ```ts
 * $effect(() => {
 *   // this will run when `data` changes, but not when `time` changes
 *   save(data, {
 *     timestamp: untrack(() => time)
 *   });
 * });
 * ```
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}

const STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);

/**
 * @param {Signal} signal
 * @param {number} status
 * @returns {void}
 */
export function set_signal_status(signal, status) {
	signal.f = (signal.f & STATUS_MASK) | status;
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string[]} keys
 * @returns {Record<string, unknown>}
 */
export function exclude_from_object(obj, keys) {
	/** @type {Record<string, unknown>} */
	var result = {};

	for (var key in obj) {
		if (!keys.includes(key)) {
			result[key] = obj[key];
		}
	}

	return result;
}

/**
 * Possibly traverse an object and read all its properties so that they're all reactive in case this is `$state`.
 * Does only check first level of an object for performance reasons (heuristic should be good for 99% of all cases).
 * @param {any} value
 * @returns {void}
 */
export function deep_read_state(value) {
	if (typeof value !== 'object' || !value || value instanceof EventTarget) {
		return;
	}

	if (STATE_SYMBOL in value) {
		deep_read(value);
	} else if (!Array.isArray(value)) {
		for (let key in value) {
			const prop = value[key];
			if (typeof prop === 'object' && prop && STATE_SYMBOL in prop) {
				deep_read(prop);
			}
		}
	}
}

/**
 * Deeply traverse an object and read all its properties
 * so that they're all reactive in case this is `$state`
 * @param {any} value
 * @param {Set<any>} visited
 * @returns {void}
 */
export function deep_read(value, visited = new Set()) {
	if (
		typeof value === 'object' &&
		value !== null &&
		// We don't want to traverse DOM elements
		!(value instanceof EventTarget) &&
		!visited.has(value)
	) {
		visited.add(value);
		// When working with a possible SvelteDate, this
		// will ensure we capture changes to it.
		if (value instanceof Date) {
			value.getTime();
		}
		for (let key in value) {
			try {
				deep_read(value[key], visited);
			} catch (e) {
				// continue
			}
		}
		const proto = get_prototype_of(value);
		if (
			proto !== Object.prototype &&
			proto !== Array.prototype &&
			proto !== Map.prototype &&
			proto !== Set.prototype &&
			proto !== Date.prototype
		) {
			const descriptors = get_descriptors(proto);
			for (let key in descriptors) {
				const get = descriptors[key].get;
				if (get) {
					try {
						get.call(value);
					} catch (e) {
						// continue
					}
				}
			}
		}
	}
}
