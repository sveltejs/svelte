import { DEV } from 'esm-env';
import {
	array_prototype,
	get_descriptors,
	get_prototype_of,
	is_frozen,
	object_freeze,
	object_prototype
} from './utils.js';
import { unstate } from './proxy.js';
import { destroy_effect_children, pre_effect } from './reactivity/effects.js';
import {
	EFFECT,
	PRE_EFFECT,
	RENDER_EFFECT,
	DIRTY,
	UNINITIALIZED,
	MAYBE_DIRTY,
	CLEAN,
	DERIVED,
	UNOWNED,
	DESTROYED,
	INERT,
	MANAGED,
	STATE_SYMBOL,
	BRANCH_EFFECT
} from './constants.js';
import { flush_tasks } from './dom/task.js';
import { mutate } from './reactivity/sources.js';
import { add_owner } from './dev/ownership.js';

const IS_EFFECT = EFFECT | PRE_EFFECT | RENDER_EFFECT;

const FLUSH_MICROTASK = 0;
const FLUSH_SYNC = 1;

// Used for controlling the flush of effects.
let current_scheduler_mode = FLUSH_MICROTASK;
// Used for handling scheduling
let is_micro_task_queued = false;
let is_flushing_effect = false;
// Used for $inspect
export let is_batching_effect = false;
let is_inspecting_signal = false;

// Handle effect queues

/** @type {import('#client').Effect[]} */
let current_queued_pre_and_render_effects = [];

/** @type {import('#client').Effect[]} */
let current_queued_effects = [];

let flush_count = 0;

// Handle signal reactivity tree dependencies and reactions
/** @type {null | import('#client').Reaction} */
export let current_reaction = null;

/** @type {null | import('#client').Effect} */
export let current_effect = null;

/** @param {null | import('#client').Effect} effect */
export function set_current_effect(effect) {
	current_effect = effect;
}

/** @type {null | import('#client').Value[]} */
export let current_dependencies = null;
let current_dependencies_index = 0;

/**
 * Tracks writes that the effect it's executed in doesn't listen to yet,
 * so that the dependency can be added to the effect later on if it then reads it
 * @type {null | import('#client').Source[]}
 */
export let current_untracked_writes = null;

/** @param {null | import('#client').Source[]} writes */
export function set_current_untracked_writes(writes) {
	current_untracked_writes = writes;
}

/** @type {null | import('#client').SourceDebug} */
export let last_inspected_signal = null;

/** @param {import('#client').SourceDebug} signal */
export function set_last_inspected_signal(signal) {
	last_inspected_signal = signal;
}

/** If `true`, `get`ting the signal should not register it as a dependency */
export let current_untracking = false;
/** Exists to opt out of the mutation validation for stores which may be set for the first time during a derivation */
export let ignore_mutation_validation = false;
/** @param {boolean} value */
export function set_ignore_mutation_validation(value) {
	ignore_mutation_validation = value;
}

// If we are working with a get() chain that has no active container,
// to prevent memory leaks, we skip adding the reaction
let current_skip_reaction = false;

// Handle collecting all signals which are read during a specific time frame
export let is_signals_recorded = false;
let captured_signals = new Set();

/** @type {Function | null} */
export let inspect_fn = null;

/** @type {Array<import('#client').SourceDebug>} */
let inspect_captured_signals = [];

// Handling runtime component context
/** @type {import('#client').ComponentContext | null} */
export let current_component_context = null;

/** @param {import('#client').ComponentContext | null} context */
export function set_current_component_context(context) {
	current_component_context = context;
}

export let updating_derived = false;

/**
 * @param {null | import('#client').ComponentContext} context
 * @returns {boolean}
 */
export function is_runes(context) {
	const component_context = context || current_component_context;
	return component_context !== null && component_context.r;
}

/**
 * @param {import('#client').ProxyStateObject} target
 * @param {string | symbol} prop
 * @param {any} receiver
 */
export function batch_inspect(target, prop, receiver) {
	const value = Reflect.get(target, prop, receiver);
	/**
	 * @this {any}
	 */
	return function () {
		const previously_batching_effect = is_batching_effect;
		is_batching_effect = true;
		try {
			return Reflect.apply(value, this, arguments);
		} finally {
			is_batching_effect = previously_batching_effect;
			if (last_inspected_signal !== null && !is_inspecting_signal) {
				is_inspecting_signal = true;
				try {
					for (const fn of last_inspected_signal.inspect) {
						fn();
					}
				} finally {
					is_inspecting_signal = false;
				}
				last_inspected_signal = null;
			}
		}
	};
}

/**
 * @template V
 * @param {import('#client').Value<V> | import('#client').Effect} signal
 * @returns {boolean}
 */
function is_signal_dirty(signal) {
	const flags = signal.f;

	if ((flags & DIRTY) !== 0 || signal.v === UNINITIALIZED) {
		return true;
	}

	if ((flags & MAYBE_DIRTY) !== 0) {
		const dependencies = /** @type {import('#client').Reaction} **/ (signal).deps;

		if (dependencies !== null) {
			const length = dependencies.length;
			let i;

			for (i = 0; i < length; i++) {
				const dependency = dependencies[i];
				if ((dependency.f & MAYBE_DIRTY) !== 0 && !is_signal_dirty(dependency)) {
					set_signal_status(dependency, CLEAN);
					continue;
				}

				// The flags can be marked as dirty from the above is_signal_dirty call.
				if ((dependency.f & DIRTY) !== 0) {
					if ((dependency.f & DERIVED) !== 0) {
						update_derived(/** @type {import('#client').Derived} **/ (dependency), true);
						// Might have been mutated from above get.
						if ((signal.f & DIRTY) !== 0) {
							return true;
						}
					} else {
						return true;
					}
				}

				// If we're workig with an unowned derived signal, then we need to check
				// if our dependency write version is higher. If is is then we can assume
				// that state has changed to a newer version and thus this unowned signal
				// is also dirty.
				const is_unowned = (flags & UNOWNED) !== 0;
				const write_version = /** @type {import('#client').Derived} */ (signal).w;
				const dep_write_version = dependency.w;

				if (is_unowned && dep_write_version > write_version) {
					/** @type {import('#client').Derived} */ (signal).w = dep_write_version;
					return true;
				}
			}
		}
	}
	return false;
}

/**
 * @template V
 * @param {import('#client').Reaction} signal
 * @returns {V}
 */
function execute_reaction(signal) {
	const previous_dependencies = current_dependencies;
	const previous_dependencies_index = current_dependencies_index;
	const previous_untracked_writes = current_untracked_writes;
	const previous_reaction = current_reaction;
	const previous_skip_reaction = current_skip_reaction;
	const previous_untracking = current_untracking;
	current_dependencies = /** @type {null | import('#client').Value[]} */ (null);
	current_dependencies_index = 0;
	current_untracked_writes = null;
	current_reaction = signal;
	current_skip_reaction = !is_flushing_effect && (signal.f & UNOWNED) !== 0;
	current_untracking = false;

	try {
		const res = /** @type {() => V} */ (signal.fn)();
		let dependencies = /** @type {import('#client').Value<unknown>[]} **/ (signal.deps);
		if (current_dependencies !== null) {
			let i;
			if (dependencies !== null) {
				const deps_length = dependencies.length;
				// Include any dependencies up until the current_dependencies_index.
				const full_current_dependencies =
					current_dependencies_index === 0
						? current_dependencies
						: dependencies.slice(0, current_dependencies_index).concat(current_dependencies);
				const current_dep_length = full_current_dependencies.length;
				// If we have more than 16 elements in the array then use a Set for faster performance
				// TODO: evaluate if we should always just use a Set or not here?
				const full_current_dependencies_set =
					current_dep_length > 16 && deps_length - current_dependencies_index > 1
						? new Set(full_current_dependencies)
						: null;
				for (i = current_dependencies_index; i < deps_length; i++) {
					const dependency = dependencies[i];
					if (
						full_current_dependencies_set !== null
							? !full_current_dependencies_set.has(dependency)
							: !full_current_dependencies.includes(dependency)
					) {
						remove_reaction(signal, dependency);
					}
				}
			}

			if (dependencies !== null && current_dependencies_index > 0) {
				dependencies.length = current_dependencies_index + current_dependencies.length;
				for (i = 0; i < current_dependencies.length; i++) {
					dependencies[current_dependencies_index + i] = current_dependencies[i];
				}
			} else {
				signal.deps = /** @type {import('#client').Value<V>[]} **/ (
					dependencies = current_dependencies
				);
			}

			if (!current_skip_reaction) {
				for (i = current_dependencies_index; i < dependencies.length; i++) {
					const dependency = dependencies[i];
					const reactions = dependency.reactions;

					if (reactions === null) {
						dependency.reactions = [signal];
					} else if (reactions[reactions.length - 1] !== signal) {
						// TODO: should this be:
						//
						// } else if (!reactions.includes(signal)) {
						//
						reactions.push(signal);
					}
				}
			}
		} else if (dependencies !== null && current_dependencies_index < dependencies.length) {
			remove_reactions(signal, current_dependencies_index);
			dependencies.length = current_dependencies_index;
		}
		return res;
	} finally {
		current_dependencies = previous_dependencies;
		current_dependencies_index = previous_dependencies_index;
		current_untracked_writes = previous_untracked_writes;
		current_reaction = previous_reaction;
		current_skip_reaction = previous_skip_reaction;
		current_untracking = previous_untracking;
	}
}

/**
 * @template V
 * @param {import('#client').Reaction} reaction
 * @param {import('#client').Value<V>} dependency
 * @returns {void}
 */
function remove_reaction(reaction, dependency) {
	const reactions = dependency.reactions;
	let reactions_length = 0;
	if (reactions !== null) {
		reactions_length = reactions.length - 1;
		const index = reactions.indexOf(reaction);
		if (index !== -1) {
			if (reactions_length === 0) {
				dependency.reactions = null;
			} else {
				// Swap with last element and then remove.
				reactions[index] = reactions[reactions_length];
				reactions.pop();
			}
		}
	}
	if (reactions_length === 0 && (dependency.f & UNOWNED) !== 0) {
		// If the signal is unowned then we need to make sure to change it to dirty.
		set_signal_status(dependency, DIRTY);
		remove_reactions(/** @type {import('#client').Derived<V>} **/ (dependency), 0);
	}
}

/**
 * @param {import('#client').Reaction} reaction
 * @param {number} start_index
 * @returns {void}
 */
function remove_reactions(reaction, start_index) {
	const dependencies = reaction.deps;

	if (dependencies !== null) {
		const active_dependencies = start_index === 0 ? null : dependencies.slice(0, start_index);
		let i;

		for (i = start_index; i < dependencies.length; i++) {
			const dependency = dependencies[i];

			// Avoid removing a reaction if we know that it is active (start_index will not be 0)
			if (active_dependencies === null || !active_dependencies.includes(dependency)) {
				remove_reaction(reaction, dependency);
			}
		}
	}
}

/**
 * @param {import('#client').Effect} effect
 * @returns {void}
 */
function destroy_references(effect) {
	const deriveds = effect.r;
	effect.r = null;
	if (deriveds !== null) {
		let i;
		for (i = 0; i < deriveds.length; i++) {
			destroy_signal(deriveds[i]);
		}
	}
}

/** @param {import('#client').Derived} effect */
function destroy_effect(effect) {}

/**
 * @param {import('#client').Effect} effect
 * @returns {void}
 */
export function execute_effect(effect) {
	if ((effect.f & DESTROYED) !== 0) {
		return;
	}

	const teardown = effect.v;
	const previous_component_context = current_component_context;
	const previous_effect = current_effect;
	current_effect = effect;

	const component_context = effect.ctx;

	try {
		if ((effect.f & BRANCH_EFFECT) === 0) {
			// branch effects (i.e. {#if ...} blocks) need to keep their references
			// TODO their children should detach themselves from signal.r when destroyed
			destroy_effect_children(effect);
		}

		if (teardown !== null) {
			teardown();
		}

		current_component_context = component_context;

		const possible_teardown = execute_reaction(effect);

		if (typeof possible_teardown === 'function') {
			effect.v = possible_teardown;
		}
	} finally {
		current_component_context = previous_component_context;
		current_effect = previous_effect;
	}

	if (
		is_runes(component_context) && // Don't rerun pre effects more than once to accomodate for "$: only runs once" behavior
		(effect.f & PRE_EFFECT) !== 0 &&
		current_queued_pre_and_render_effects.length > 0
	) {
		const effects = [];

		for (let i = 0; i < current_queued_pre_and_render_effects.length; i++) {
			const effect = current_queued_pre_and_render_effects[i];
			if ((effect.f & PRE_EFFECT) !== 0 && effect.ctx === component_context) {
				effects.push(effect);
				current_queued_pre_and_render_effects.splice(i, 1);
				i--;
			}
		}

		flush_queued_effects(effects);
	}
}

function infinite_loop_guard() {
	if (flush_count > 100) {
		flush_count = 0;
		throw new Error(
			'ERR_SVELTE_TOO_MANY_UPDATES' +
				(DEV
					? ': Maximum update depth exceeded. This can happen when a reactive block or effect ' +
						'repeatedly sets a new value. Svelte limits the number of nested updates to prevent infinite loops.'
					: '')
		);
	}
	flush_count++;
}

/**
 * @param {Array<import('#client').Effect>} effects
 * @returns {void}
 */
function flush_queued_effects(effects) {
	const length = effects.length;
	if (length > 0) {
		infinite_loop_guard();
		const previously_flushing_effect = is_flushing_effect;
		is_flushing_effect = true;
		try {
			let i;
			for (i = 0; i < length; i++) {
				const signal = effects[i];
				const flags = signal.f;
				if ((flags & (DESTROYED | INERT)) === 0) {
					if (is_signal_dirty(signal)) {
						set_signal_status(signal, CLEAN);
						execute_effect(signal);
					} else if ((flags & MAYBE_DIRTY) !== 0) {
						set_signal_status(signal, CLEAN);
					}
				}
			}
		} finally {
			is_flushing_effect = previously_flushing_effect;
		}

		effects.length = 0;
	}
}

function process_microtask() {
	is_micro_task_queued = false;
	if (flush_count > 101) {
		return;
	}
	const previous_queued_pre_and_render_effects = current_queued_pre_and_render_effects;
	const previous_queued_effects = current_queued_effects;
	current_queued_pre_and_render_effects = [];
	current_queued_effects = [];
	flush_queued_effects(previous_queued_pre_and_render_effects);
	flush_queued_effects(previous_queued_effects);
	if (!is_micro_task_queued) {
		flush_count = 0;
	}
}

/**
 * @param {import('#client').Effect} signal
 * @param {boolean} sync
 * @returns {void}
 */
export function schedule_effect(signal, sync) {
	const flags = signal.f;
	if (sync) {
		const previously_flushing_effect = is_flushing_effect;
		try {
			is_flushing_effect = true;
			execute_effect(signal);
			set_signal_status(signal, CLEAN);
		} finally {
			is_flushing_effect = previously_flushing_effect;
		}
	} else {
		if (current_scheduler_mode === FLUSH_MICROTASK) {
			if (!is_micro_task_queued) {
				is_micro_task_queued = true;
				queueMicrotask(process_microtask);
			}
		}
		if ((flags & EFFECT) !== 0) {
			current_queued_effects.push(signal);
			// Prevent any nested user effects from potentially triggering
			// before this effect is scheduled. We know they will be destroyed
			// so we can make them inert to avoid having to find them in the
			// queue and remove them.
			if ((flags & MANAGED) === 0) {
				// mark_subtree_children_inert(signal, true);
			}
		} else {
			// We need to ensure we insert the signal in the right topological order. In other words,
			// we need to evaluate where to insert the signal based off its level and whether or not it's
			// a pre-effect and within the same block. By checking the signals in the queue in reverse order
			// we can find the right place quickly. TODO: maybe opt to use a linked list rather than an array
			// for these operations.
			const length = current_queued_pre_and_render_effects.length;
			let should_append = length === 0;

			if (!should_append) {
				const target_level = signal.l;
				// const target_block = signal.b;
				const is_pre_effect = (flags & PRE_EFFECT) !== 0;
				let target_signal;
				let is_target_pre_effect;
				let i = length;
				while (true) {
					target_signal = current_queued_pre_and_render_effects[--i];
					if (target_signal.l <= target_level) {
						if (i + 1 === length) {
							should_append = true;
						} else {
							is_target_pre_effect = (target_signal.f & PRE_EFFECT) !== 0;
							// if (target_signal.b !== target_block || (is_target_pre_effect && !is_pre_effect)) {
							// 	i++;
							// }
							current_queued_pre_and_render_effects.splice(i, 0, signal);
						}
						break;
					}
					if (i === 0) {
						current_queued_pre_and_render_effects.unshift(signal);
						break;
					}
				}
			}

			if (should_append) {
				current_queued_pre_and_render_effects.push(signal);
			}
		}
	}

	// temporary, we need to neaten up the types
	signal.ran = true;
}

/**
 * @returns {void}
 */
export function flush_local_render_effects() {
	const effects = [];
	for (let i = 0; i < current_queued_pre_and_render_effects.length; i++) {
		const effect = current_queued_pre_and_render_effects[i];
		if ((effect.f & RENDER_EFFECT) !== 0 && effect.ctx === current_component_context) {
			effects.push(effect);
			current_queued_pre_and_render_effects.splice(i, 1);
			i--;
		}
	}
	flush_queued_effects(effects);
}

/**
 * Synchronously flushes any pending state changes and those that result from it.
 * @param {() => void} [fn]
 * @returns {void}
 */
export function flushSync(fn) {
	flush_sync(fn);
}

/**
 * Internal version of `flushSync` with the option to not flush previous effects.
 * Returns the result of the passed function, if given.
 * @param {() => any} [fn]
 * @param {boolean} [flush_previous]
 * @returns {any}
 */
export function flush_sync(fn, flush_previous = true) {
	const previous_scheduler_mode = current_scheduler_mode;
	const previous_queued_pre_and_render_effects = current_queued_pre_and_render_effects;
	const previous_queued_effects = current_queued_effects;
	let result;

	try {
		infinite_loop_guard();
		/** @type {import('#client').Effect[]} */
		const pre_and_render_effects = [];

		/** @type {import('#client').Effect[]} */
		const effects = [];
		current_scheduler_mode = FLUSH_SYNC;
		current_queued_pre_and_render_effects = pre_and_render_effects;
		current_queued_effects = effects;
		if (flush_previous) {
			flush_queued_effects(previous_queued_pre_and_render_effects);
			flush_queued_effects(previous_queued_effects);
		}
		if (fn !== undefined) {
			result = fn();
		}
		if (current_queued_pre_and_render_effects.length > 0 || effects.length > 0) {
			flushSync();
		}
		flush_tasks();
		flush_count = 0;
	} finally {
		current_scheduler_mode = previous_scheduler_mode;
		current_queued_pre_and_render_effects = previous_queued_pre_and_render_effects;
		current_queued_effects = previous_queued_effects;
	}

	return result;
}

/**
 * Returns a promise that resolves once any pending state changes have been applied.
 * @returns {Promise<void>}
 */
export async function tick() {
	await Promise.resolve();
	// By calling flushSync we guarantee that any pending state changes are applied after one tick.
	// TODO look into whether we can make flushing subsequent updates synchronously in the future.
	flushSync();
}

/**
 * @param {import('#client').Derived} derived
 * @param {boolean} force_schedule
 * @returns {void}
 */
function update_derived(derived, force_schedule) {
	const previous_updating_derived = updating_derived;
	updating_derived = true;
	const value = execute_reaction(derived);
	updating_derived = previous_updating_derived;

	const status =
		(current_skip_reaction || (derived.f & UNOWNED) !== 0) && derived.deps !== null
			? MAYBE_DIRTY
			: CLEAN;

	set_signal_status(derived, status);

	if (!derived.eq(value, derived.v)) {
		derived.v = value;
		mark_signal_reactions(derived, DIRTY, force_schedule);

		// @ts-expect-error
		if (DEV && derived.inspect && force_schedule) {
			for (const fn of /** @type {import('#client').ValueDebug} */ (derived).inspect) fn();
		}
	}
}

/**
 * @template V
 * @param {import('#client').Value<V>} signal
 * @returns {V}
 */
export function get(signal) {
	// @ts-expect-error
	if (DEV && signal.inspect && inspect_fn) {
		/** @type {import('#client').SourceDebug} */ (signal).inspect.add(inspect_fn);
		// @ts-expect-error
		inspect_captured_signals.push(signal);
	}

	const flags = signal.f;
	if ((flags & DESTROYED) !== 0) {
		return signal.v;
	}

	if (is_signals_recorded) {
		captured_signals.add(signal);
	}

	// Register the dependency on the current reaction signal
	if (current_reaction !== null && (current_reaction.f & MANAGED) === 0 && !current_untracking) {
		const unowned = (current_reaction.f & UNOWNED) !== 0;
		const dependencies = current_reaction.deps;
		if (
			current_dependencies === null &&
			dependencies !== null &&
			dependencies[current_dependencies_index] === signal &&
			!(unowned && current_effect !== null)
		) {
			current_dependencies_index++;
		} else if (
			dependencies === null ||
			current_dependencies_index === 0 ||
			dependencies[current_dependencies_index - 1] !== signal
		) {
			if (current_dependencies === null) {
				current_dependencies = [signal];
			} else {
				current_dependencies.push(signal);
			}
		}
		if (
			current_untracked_writes !== null &&
			current_effect !== null &&
			(current_effect.f & CLEAN) !== 0 &&
			(current_effect.f & MANAGED) === 0 &&
			current_untracked_writes.includes(signal)
		) {
			set_signal_status(current_effect, DIRTY);
			schedule_effect(current_effect, false);
		}
	}

	if ((flags & DERIVED) !== 0 && is_signal_dirty(signal)) {
		if (DEV) {
			// we want to avoid tracking indirect dependencies
			const previous_inspect_fn = inspect_fn;
			inspect_fn = null;
			update_derived(/** @type {import('#client').Derived} **/ (signal), false);
			inspect_fn = previous_inspect_fn;
		} else {
			update_derived(/** @type {import('#client').Derived} **/ (signal), false);
		}
	}
	return signal.v;
}

/**
 * Invokes a function and captures all signals that are read during the invocation,
 * then invalidates them.
 * @param {() => any} fn
 */
export function invalidate_inner_signals(fn) {
	var previous_is_signals_recorded = is_signals_recorded;
	var previous_captured_signals = captured_signals;
	is_signals_recorded = true;
	captured_signals = new Set();
	var captured = captured_signals;
	var signal;
	try {
		untrack(fn);
	} finally {
		is_signals_recorded = previous_is_signals_recorded;
		if (is_signals_recorded) {
			for (signal of captured_signals) {
				previous_captured_signals.add(signal);
			}
		}
		captured_signals = previous_captured_signals;
	}
	for (signal of captured) {
		mutate(signal, null /* doesnt matter */);
	}
}

/**
 * @param {import('#client').Value} signal
 * @param {number} to_status
 * @param {boolean} force_schedule
 * @returns {void}
 */
export function mark_signal_reactions(signal, to_status, force_schedule) {
	const runes = is_runes(null);
	const reactions = signal.reactions;

	if (reactions !== null) {
		const length = reactions.length;
		let i;

		for (i = 0; i < length; i++) {
			const reaction = reactions[i];
			const flags = reaction.f;

			// We skip any effects that are already dirty (but not unowned). Additionally, we also
			// skip if the reaction is the same as the current effect (except if we're not in runes or we
			// are in force schedule mode).
			if ((!force_schedule || !runes) && reaction === current_effect) {
				continue;
			}

			set_signal_status(reaction, to_status);

			// If the signal is not clean, then skip over it – with the exception of unowned signals that
			// are already maybe dirty. Unowned signals might be dirty because they are not captured as part of an
			// effect.
			const maybe_dirty = (flags & MAYBE_DIRTY) !== 0;
			const unowned = (flags & UNOWNED) !== 0;

			if ((flags & CLEAN) !== 0 || (maybe_dirty && unowned)) {
				if ((flags & IS_EFFECT) !== 0) {
					schedule_effect(/** @type {import('#client').Effect} */ (reaction), false);
				} else {
					mark_signal_reactions(
						/** @type {import('#client').Value} */ (reaction),
						MAYBE_DIRTY,
						force_schedule
					);
				}
			}
		}
	}
}

/**
 * @param {import('#client').Reaction} signal
 * @returns {void}
 */
export function destroy_signal(signal) {
	return;
	// const teardown = /** @type {null | (() => void)} */ (signal.v);
	// const destroy = signal.y;
	// const flags = signal.f;
	// destroy_references(signal);
	// remove_consumers(signal, 0);
	// signal.i = signal.r = signal.y = signal.x = signal.b = signal.d = signal.c = null;
	// set_signal_status(signal, DESTROYED);
	// if (destroy !== null) {
	// 	if (is_array(destroy)) {
	// 		run_all(destroy);
	// 	} else {
	// 		destroy();
	// 	}
	// }
	// if (teardown !== null && (flags & IS_EFFECT) !== 0) {
	// 	teardown();
	// }
}

/**
 * Use `untrack` to prevent something from being treated as an `$effect`/`$derived` dependency.
 *
 * https://svelte-5-preview.vercel.app/docs/functions#untrack
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function untrack(fn) {
	const previous_untracking = current_untracking;
	try {
		current_untracking = true;
		return fn();
	} finally {
		current_untracking = previous_untracking;
	}
}

const STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);

/**
 * @param {import('#client').Signal} signal
 * @param {number} status
 * @returns {void}
 */
export function set_signal_status(signal, status) {
	signal.f = (signal.f & STATUS_MASK) | status;
}

/**
 * @template V
 * @param {V | import('#client').Value<V>} val
 * @returns {val is import('#client').Value<V>}
 */
export function is_signal(val) {
	return (
		typeof val === 'object' &&
		val !== null &&
		typeof (/** @type {import('#client').Value<V>} */ (val).f) === 'number'
	);
}

/**
 * Retrieves the context that belongs to the closest parent component with the specified `key`.
 * Must be called during component initialisation.
 *
 * https://svelte.dev/docs/svelte#getcontext
 * @template T
 * @param {any} key
 * @returns {T}
 */
export function getContext(key) {
	const context_map = get_or_init_context_map();
	const result = /** @type {T} */ (context_map.get(key));

	if (DEV) {
		// @ts-expect-error
		const fn = current_component_context?.function;
		if (fn) {
			add_owner(result, fn);
		}
	}

	return result;
}

/**
 * Associates an arbitrary `context` object with the current component and the specified `key`
 * and returns that object. The context is then available to children of the component
 * (including slotted content) with `getContext`.
 *
 * Like lifecycle functions, this must be called during component initialisation.
 *
 * https://svelte.dev/docs/svelte#setcontext
 * @template T
 * @param {any} key
 * @param {T} context
 * @returns {T}
 */
export function setContext(key, context) {
	const context_map = get_or_init_context_map();
	context_map.set(key, context);
	return context;
}

/**
 * Checks whether a given `key` has been set in the context of a parent component.
 * Must be called during component initialisation.
 *
 * https://svelte.dev/docs/svelte#hascontext
 * @param {any} key
 * @returns {boolean}
 */
export function hasContext(key) {
	const context_map = get_or_init_context_map();
	return context_map.has(key);
}

/**
 * Retrieves the whole context map that belongs to the closest parent component.
 * Must be called during component initialisation. Useful, for example, if you
 * programmatically create a component and want to pass the existing context to it.
 *
 * https://svelte.dev/docs/svelte#getallcontexts
 * @template {Map<any, any>} [T=Map<any, any>]
 * @returns {T}
 */
export function getAllContexts() {
	const context_map = get_or_init_context_map();

	if (DEV) {
		// @ts-expect-error
		const fn = current_component_context?.function;
		if (fn) {
			for (const value of context_map.values()) {
				add_owner(value, fn);
			}
		}
	}

	return /** @type {T} */ (context_map);
}

/** @returns {Map<unknown, unknown>} */
function get_or_init_context_map() {
	const component_context = current_component_context;
	if (component_context === null) {
		throw new Error(
			'ERR_SVELTE_ORPHAN_CONTEXT' +
				(DEV ? 'Context can only be used during component initialisation.' : '')
		);
	}
	return (component_context.c ??= new Map(get_parent_context(component_context) || undefined));
}

/**
 * @param {import('#client').ComponentContext} component_context
 * @returns {Map<unknown, unknown> | null}
 */
function get_parent_context(component_context) {
	let parent = component_context.p;
	while (parent !== null) {
		const context_map = parent.c;
		if (context_map !== null) {
			return context_map;
		}
		parent = parent.p;
	}
	return null;
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string[]} keys
 * @returns {Record<string, unknown>}
 */
export function exclude_from_object(obj, keys) {
	obj = { ...obj };
	let key;
	for (key of keys) {
		delete obj[key];
	}
	return obj;
}

/**
 * @template V
 * @param {V} value
 * @param {V} fallback
 * @returns {V}
 */
export function value_or_fallback(value, fallback) {
	return value === undefined ? fallback : value;
}

/**
 * @param {Record<string, unknown>} props
 * @param {any} runes
 * @param {Function} [fn]
 * @returns {void}
 */
export function push(props, runes = false, fn) {
	current_component_context = {
		// exports (and props, if `accessors: true`)
		x: null,
		// context
		c: null,
		// effects
		e: null,
		// mounted
		m: false,
		// parent
		p: current_component_context,
		// signals
		d: null,
		// props
		s: props,
		// runes
		r: runes,
		// update_callbacks
		u: null
	};

	if (DEV) {
		// component function
		// @ts-expect-error
		current_component_context.function = fn;
	}
}

/**
 * @template {Record<string, any>} T
 * @param {T} [component]
 * @returns {T}
 */
export function pop(component) {
	const context_stack_item = current_component_context;
	if (context_stack_item !== null) {
		if (component !== undefined) {
			context_stack_item.x = component;
		}
		const effects = context_stack_item.e;
		if (effects !== null) {
			context_stack_item.e = null;
			for (let i = 0; i < effects.length; i++) {
				schedule_effect(effects[i], false);
			}
		}
		current_component_context = context_stack_item.p;
		context_stack_item.m = true;
	}
	// Micro-optimization: Don't set .a above to the empty object
	// so it can be garbage-collected when the return here is unused
	return component || /** @type {T} */ ({});
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
		for (let key in value) {
			try {
				deep_read(value[key], visited);
			} catch (e) {
				// continue
			}
		}
		const proto = Object.getPrototypeOf(value);
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

/**
 * Like `unstate`, but recursively traverses into normal arrays/objects to find potential states in them.
 * @param {any} value
 * @param {Map<any, any>} visited
 * @returns {any}
 */
function deep_unstate(value, visited = new Map()) {
	if (typeof value === 'object' && value !== null && !visited.has(value)) {
		const unstated = unstate(value);
		if (unstated !== value) {
			visited.set(value, unstated);
			return unstated;
		}
		const prototype = get_prototype_of(value);
		// Only deeply unstate plain objects and arrays
		if (prototype === object_prototype || prototype === array_prototype) {
			let contains_unstated = false;
			/** @type {any} */
			const nested_unstated = Array.isArray(value) ? [] : {};
			for (let key in value) {
				const result = deep_unstate(value[key], visited);
				nested_unstated[key] = result;
				if (result !== value[key]) {
					contains_unstated = true;
				}
			}
			visited.set(value, contains_unstated ? nested_unstated : value);
		} else {
			visited.set(value, value);
		}
	}

	return visited.get(value) ?? value;
}

// TODO remove in a few versions, before 5.0 at the latest
let warned_inspect_changed = false;

/**
 * @param {() => any[]} get_value
 * @param {Function} [inspect]
 */
// eslint-disable-next-line no-console
export function inspect(get_value, inspect = console.log) {
	let initial = true;

	pre_effect(() => {
		const fn = () => {
			const value = untrack(() => get_value().map((v) => deep_unstate(v)));
			if (value.length === 2 && typeof value[1] === 'function' && !warned_inspect_changed) {
				// eslint-disable-next-line no-console
				console.warn(
					'$inspect() API has changed. See https://svelte-5-preview.vercel.app/docs/runes#$inspect for more information.'
				);
				warned_inspect_changed = true;
			}
			inspect(initial ? 'init' : 'update', ...value);
		};

		inspect_fn = fn;
		const value = get_value();
		deep_read(value);
		inspect_fn = null;

		const signals = inspect_captured_signals.slice();
		inspect_captured_signals = [];

		if (initial) {
			fn();
			initial = false;
		}

		return () => {
			for (const s of signals) {
				s.inspect.delete(fn);
			}
		};
	});
}

/**
 * @template V
 * @param {import('#client').Value<V> | (() => V)} value
 * @returns {V}
 */
export function unwrap(value) {
	// temporary!
	if (typeof value === 'function') {
		return value();
	}

	if (is_signal(value)) {
		// @ts-ignore
		return get(value);
	}
	// @ts-ignore
	return value;
}

if (DEV) {
	/** @param {string} rune */
	function throw_rune_error(rune) {
		if (!(rune in globalThis)) {
			// @ts-ignore
			globalThis[rune] = () => {
				// TODO if people start adjusting the "this can contain runes" config through v-p-s more, adjust this message
				throw new Error(`${rune} is only available inside .svelte and .svelte.js/ts files`);
			};
		}
	}

	throw_rune_error('$state');
	throw_rune_error('$effect');
	throw_rune_error('$derived');
	throw_rune_error('$inspect');
	throw_rune_error('$props');
}

/**
 * Expects a value that was wrapped with `freeze` and makes it frozen.
 * @template T
 * @param {T} value
 * @returns {Readonly<T>}
 */
export function freeze(value) {
	if (typeof value === 'object' && value != null && !is_frozen(value)) {
		// If the object is already proxified, then unstate the value
		if (STATE_SYMBOL in value) {
			return object_freeze(unstate(value));
		}
		// Otherwise freeze the object
		object_freeze(value);
	}
	return value;
}
