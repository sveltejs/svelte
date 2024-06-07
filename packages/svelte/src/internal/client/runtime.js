import { DEV } from 'esm-env';
import {
	define_property,
	get_descriptors,
	get_prototype_of,
	is_frozen,
	object_freeze
} from './utils.js';
import { snapshot } from './proxy.js';
import { destroy_effect, effect, execute_effect_teardown } from './reactivity/effects.js';
import {
	EFFECT,
	RENDER_EFFECT,
	DIRTY,
	MAYBE_DIRTY,
	CLEAN,
	DERIVED,
	UNOWNED,
	DESTROYED,
	INERT,
	BRANCH_EFFECT,
	STATE_SYMBOL,
	BLOCK_EFFECT,
	ROOT_EFFECT,
	LEGACY_DERIVED_PROP,
	DISCONNECTED,
	STATE_FROZEN_SYMBOL
} from './constants.js';
import { flush_tasks } from './dom/task.js';
import { add_owner } from './dev/ownership.js';
import { mutate, set, source } from './reactivity/sources.js';
import { update_derived } from './reactivity/deriveds.js';
import { inspect_captured_signals, inspect_fn, set_inspect_fn } from './dev/inspect.js';
import * as e from './errors.js';
import { lifecycle_outside_component } from '../shared/errors.js';

const FLUSH_MICROTASK = 0;
const FLUSH_SYNC = 1;

// Used for DEV time error handling
/** @param {WeakSet<Error>} value */
const handled_errors = new WeakSet();
// Used for controlling the flush of effects.
let current_scheduler_mode = FLUSH_MICROTASK;
// Used for handling scheduling
let is_micro_task_queued = false;

export let is_flushing_effect = false;
export let is_destroying_effect = false;

/** @param {boolean} value */
export function set_is_flushing_effect(value) {
	is_flushing_effect = value;
}

/** @param {boolean} value */
export function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}

/** @param {boolean} value */
export function set_untracking(value) {
	current_untracking = value;
}

// Used for $inspect
export let is_batching_effect = false;
let is_inspecting_signal = false;

// Handle effect queues

/** @type {import('#client').Effect[]} */
let current_queued_root_effects = [];

let flush_count = 0;
// Handle signal reactivity tree dependencies and reactions

/** @type {null | import('#client').Reaction} */
export let current_reaction = null;

/** @param {null | import('#client').Reaction} reaction */
export function set_current_reaction(reaction) {
	current_reaction = reaction;
}

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

/** @param {null | import('#client').Source[]} value */
export function set_current_untracked_writes(value) {
	current_untracked_writes = value;
}

/** @type {null | import('#client').ValueDebug} */
export let last_inspected_signal = null;

/** @param {null | import('#client').ValueDebug} signal */
export function set_last_inspected_signal(signal) {
	last_inspected_signal = signal;
}

/** If `true`, `get`ting the signal should not register it as a dependency */
export let current_untracking = false;

// If we are working with a get() chain that has no active container,
// to prevent memory leaks, we skip adding the reaction.
export let current_skip_reaction = false;
// Handle collecting all signals which are read during a specific time frame
export let is_signals_recorded = false;
let captured_signals = new Set();

// Handling runtime component context
/** @type {import('#client').ComponentContext | null} */
export let current_component_context = null;

/** @param {import('#client').ComponentContext | null} context */
export function set_current_component_context(context) {
	current_component_context = context;
}

/**
 * The current component function. Different from current component context:
 * ```html
 * <!-- App.svelte -->
 * <Foo>
 *   <Bar /> <!-- context == Foo.svelte, function == App.svelte -->
 * </Foo>
 * ```
 * @type {import('#client').ComponentContext['function']}
 */
export let dev_current_component_function = null;

/** @param {import('#client').ComponentContext['function']} fn */
export function set_dev_current_component_function(fn) {
	dev_current_component_function = fn;
}

/** @returns {boolean} */
export function is_runes() {
	return current_component_context !== null && current_component_context.l === null;
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
 * Determines whether a derived or effect is dirty.
 * If it is MAYBE_DIRTY, will set the status to CLEAN
 * @param {import('#client').Reaction} reaction
 * @returns {boolean}
 */
export function check_dirtiness(reaction) {
	var flags = reaction.f;
	var is_dirty = (flags & DIRTY) !== 0;
	var is_unowned = (flags & UNOWNED) !== 0;

	// If we are unowned, we still need to ensure that we update our version to that
	// of our dependencies.
	if (is_dirty && !is_unowned) {
		return true;
	}

	var is_disconnected = (flags & DISCONNECTED) !== 0;

	if ((flags & MAYBE_DIRTY) !== 0 || (is_dirty && is_unowned)) {
		var dependencies = reaction.deps;

		if (dependencies !== null) {
			var length = dependencies.length;
			var is_equal;
			var reactions;

			for (var i = 0; i < length; i++) {
				var dependency = dependencies[i];

				if (!is_dirty && check_dirtiness(/** @type {import('#client').Derived} */ (dependency))) {
					is_equal = update_derived(/** @type {import('#client').Derived} **/ (dependency), true);
				}
				var version = dependency.version;

				if (is_unowned) {
					// If we're working with an unowned derived signal, then we need to check
					// if our dependency write version is higher. If it is then we can assume
					// that state has changed to a newer version and thus this unowned signal
					// is also dirty.

					if (version > /** @type {import('#client').Derived} */ (reaction).version) {
						/** @type {import('#client').Derived} */ (reaction).version = version;
						return !is_equal;
					}

					if (!current_skip_reaction && !dependency?.reactions?.includes(reaction)) {
						// If we are working with an unowned signal as part of an effect (due to !current_skip_reaction)
						// and the version hasn't changed, we still need to check that this reaction
						// if linked to the dependency source – otherwise future updates will not be caught.
						reactions = dependency.reactions;
						if (reactions === null) {
							dependency.reactions = [reaction];
						} else {
							reactions.push(reaction);
						}
					}
				} else if ((reaction.f & DIRTY) !== 0) {
					// `signal` might now be dirty, as a result of calling `check_dirtiness` and/or `update_derived`
					return true;
				} else if (is_disconnected) {
					// It might be that the derived was was dereferenced from its dependencies but has now come alive again.
					// In thise case, we need to re-attach it to the graph and mark it dirty if any of its dependencies have
					// changed since.
					if (version > /** @type {import('#client').Derived} */ (reaction).version) {
						/** @type {import('#client').Derived} */ (reaction).version = version;
						is_dirty = true;
					}
					reactions = dependency.reactions;
					if (reactions === null) {
						dependency.reactions = [reaction];
					} else if (!reactions.includes(reaction)) {
						reactions.push(reaction);
					}
				}
			}
		}

		// Unowned signals are always maybe dirty, as we instead check their dependency versions.
		if (!is_unowned) {
			set_signal_status(reaction, CLEAN);
		}
		if (is_disconnected) {
			reaction.f ^= DISCONNECTED;
		}
	}

	return is_dirty;
}

/**
 * @param {Error} error
 * @param {import("#client").Effect} effect
 * @param {import("#client").ComponentContext | null} component_context
 */
function handle_error(error, effect, component_context) {
	// Given we don't yet have error boundaries, we will just always throw.
	if (!DEV || handled_errors.has(error) || component_context === null) {
		throw error;
	}

	const component_stack = [];

	const effect_name = effect.fn?.name;

	if (effect_name) {
		component_stack.push(effect_name);
	}

	/** @type {import("#client").ComponentContext | null} */
	let current_context = component_context;

	while (current_context !== null) {
		var filename = current_context.function?.filename;

		if (filename) {
			const file = filename.split('/').at(-1);
			component_stack.push(file);
		}

		current_context = current_context.p;
	}

	const indent = /Firefox/.test(navigator.userAgent) ? '  ' : '\t';
	define_property(error, 'message', {
		value: error.message + `\n${component_stack.map((name) => `\n${indent}in ${name}`).join('')}\n`
	});

	const stack = error.stack;

	// Filter out internal files from callstack
	if (stack) {
		const lines = stack.split('\n');
		const new_lines = [];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.includes('svelte/src/internal')) {
				continue;
			}
			new_lines.push(line);
		}
		define_property(error, 'stack', {
			value: error.stack + new_lines.join('\n')
		});
	}

	handled_errors.add(error);
	throw error;
}

/**
 * @template V
 * @param {import('#client').Reaction} signal
 * @returns {V}
 */
export function execute_reaction_fn(signal) {
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
		let res = /** @type {Function} */ (0, signal.fn)();
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
 * @param {import('#client').Reaction} signal
 * @param {import('#client').Value<V>} dependency
 * @returns {void}
 */
function remove_reaction(signal, dependency) {
	const reactions = dependency.reactions;
	let reactions_length = 0;
	if (reactions !== null) {
		reactions_length = reactions.length - 1;
		const index = reactions.indexOf(signal);
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
	// If the derived has no reactions, then we can disconnect it from the graph,
	// allowing it to either reconnect in the future, or be GC'd by the VM.
	if (reactions_length === 0 && (dependency.f & DERIVED) !== 0) {
		set_signal_status(dependency, MAYBE_DIRTY);
		// If we are working with a derived that is owned by an effect, then mark it as being
		// disconnected.
		if ((dependency.f & (UNOWNED | DISCONNECTED)) === 0) {
			dependency.f ^= DISCONNECTED;
		}
		remove_reactions(/** @type {import('#client').Derived} **/ (dependency), 0);
	}
}

/**
 * @param {import('#client').Reaction} signal
 * @param {number} start_index
 * @returns {void}
 */
export function remove_reactions(signal, start_index) {
	const dependencies = signal.deps;
	if (dependencies !== null) {
		const active_dependencies = start_index === 0 ? null : dependencies.slice(0, start_index);
		let i;
		for (i = start_index; i < dependencies.length; i++) {
			const dependency = dependencies[i];
			// Avoid removing a reaction if we know that it is active (start_index will not be 0)
			if (active_dependencies === null || !active_dependencies.includes(dependency)) {
				remove_reaction(signal, dependency);
			}
		}
	}
}

/**
 * @param {import('#client').Reaction} signal
 * @param {boolean} [remove_dom]
 * @returns {void}
 */
export function destroy_effect_children(signal, remove_dom = true) {
	let effect = signal.first;
	signal.first = null;
	signal.last = null;
	var sibling;
	while (effect !== null) {
		sibling = effect.next;
		destroy_effect(effect, remove_dom);
		effect = sibling;
	}
}

/**
 * @param {import('#client').Effect} effect
 * @returns {void}
 */
export function execute_effect(effect) {
	var flags = effect.f;

	if ((flags & DESTROYED) !== 0) {
		return;
	}

	set_signal_status(effect, CLEAN);

	var component_context = effect.ctx;

	var previous_effect = current_effect;
	var previous_component_context = current_component_context;

	current_effect = effect;
	current_component_context = component_context;

	if (DEV) {
		var previous_component_fn = dev_current_component_function;
		dev_current_component_function = effect.component_function;
	}

	try {
		if ((flags & BLOCK_EFFECT) === 0) {
			destroy_effect_children(effect);
		}

		execute_effect_teardown(effect);
		var teardown = execute_reaction_fn(effect);
		effect.teardown = typeof teardown === 'function' ? teardown : null;
	} catch (error) {
		handle_error(/** @type {Error} */ (error), effect, current_component_context);
	} finally {
		current_effect = previous_effect;
		current_component_context = previous_component_context;

		if (DEV) {
			dev_current_component_function = previous_component_fn;
		}
	}
}

function infinite_loop_guard() {
	if (flush_count > 1000) {
		flush_count = 0;
		e.effect_update_depth_exceeded();
	}
	flush_count++;
}

/**
 * @param {Array<import('#client').Effect>} root_effects
 * @returns {void}
 */
function flush_queued_root_effects(root_effects) {
	const length = root_effects.length;
	if (length === 0) {
		return;
	}
	infinite_loop_guard();

	var previously_flushing_effect = is_flushing_effect;
	is_flushing_effect = true;

	try {
		for (var i = 0; i < length; i++) {
			var effect = root_effects[i];

			// When working with custom elements, the root effects might not have a root
			if (effect.first === null && (effect.f & BRANCH_EFFECT) === 0) {
				flush_queued_effects([effect]);
			} else {
				/** @type {import('#client').Effect[]} */
				var collected_effects = [];

				process_effects(effect, collected_effects);
				flush_queued_effects(collected_effects);
			}
		}
	} finally {
		is_flushing_effect = previously_flushing_effect;
	}
}

/**
 * @param {Array<import('#client').Effect>} effects
 * @returns {void}
 */
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;

	for (var i = 0; i < length; i++) {
		var effect = effects[i];

		if ((effect.f & (DESTROYED | INERT)) === 0 && check_dirtiness(effect)) {
			execute_effect(effect);
		}
	}
}

function process_deferred() {
	is_micro_task_queued = false;
	if (flush_count > 1001) {
		return;
	}
	const previous_queued_root_effects = current_queued_root_effects;
	current_queued_root_effects = [];
	flush_queued_root_effects(previous_queued_root_effects);
	if (!is_micro_task_queued) {
		flush_count = 0;
	}
}

/**
 * @param {import('#client').Effect} signal
 * @returns {void}
 */
export function schedule_effect(signal) {
	if (current_scheduler_mode === FLUSH_MICROTASK) {
		if (!is_micro_task_queued) {
			is_micro_task_queued = true;
			queueMicrotask(process_deferred);
		}
	}

	var effect = signal;

	while (effect.parent !== null) {
		effect = effect.parent;
		var flags = effect.f;

		if ((flags & BRANCH_EFFECT) !== 0) {
			if ((flags & CLEAN) === 0) return;
			set_signal_status(effect, MAYBE_DIRTY);
		}
	}

	current_queued_root_effects.push(effect);
}

/**
 *
 * This function both runs render effects and collects user effects in topological order
 * from the starting effect passed in. Effects will be collected when they match the filtered
 * bitwise flag passed in only. The collected effects array will be populated with all the user
 * effects to be flushed.
 *
 * @param {import('#client').Effect} effect
 * @param {import('#client').Effect[]} collected_effects
 * @returns {void}
 */
function process_effects(effect, collected_effects) {
	var current_effect = effect.first;
	var effects = [];

	main_loop: while (current_effect !== null) {
		var flags = current_effect.f;
		// TODO: we probably don't need to check for destroyed as it shouldn't be encountered?
		var is_active = (flags & (DESTROYED | INERT)) === 0;
		var is_branch = flags & BRANCH_EFFECT;
		var is_clean = (flags & CLEAN) !== 0;
		var child = current_effect.first;

		// Skip this branch if it's clean
		if (is_active && (!is_branch || !is_clean)) {
			if (is_branch) {
				set_signal_status(current_effect, CLEAN);
			}

			if ((flags & RENDER_EFFECT) !== 0) {
				if (!is_branch && check_dirtiness(current_effect)) {
					execute_effect(current_effect);
					// Child might have been mutated since running the effect
					child = current_effect.first;
				}

				if (child !== null) {
					current_effect = child;
					continue;
				}
			} else if ((flags & EFFECT) !== 0) {
				if (is_branch || is_clean) {
					if (child !== null) {
						current_effect = child;
						continue;
					}
				} else {
					effects.push(current_effect);
				}
			}
		}
		var sibling = current_effect.next;

		if (sibling === null) {
			let parent = current_effect.parent;

			while (parent !== null) {
				if (effect === parent) {
					break main_loop;
				}
				var parent_sibling = parent.next;
				if (parent_sibling !== null) {
					current_effect = parent_sibling;
					continue main_loop;
				}
				parent = parent.parent;
			}
		}

		current_effect = sibling;
	}

	// We might be dealing with many effects here, far more than can be spread into
	// an array push call (callstack overflow). So let's deal with each effect in a loop.
	for (var i = 0; i < effects.length; i++) {
		child = effects[i];
		collected_effects.push(child);
		process_effects(child, collected_effects);
	}
}

/**
 * Internal version of `flushSync` with the option to not flush previous effects.
 * Returns the result of the passed function, if given.
 * @param {() => any} [fn]
 * @param {boolean} [flush_previous]
 * @returns {any}
 */
export function flush_sync(fn, flush_previous = true) {
	var previous_scheduler_mode = current_scheduler_mode;
	var previous_queued_root_effects = current_queued_root_effects;

	try {
		infinite_loop_guard();

		/** @type {import('#client').Effect[]} */
		const root_effects = [];

		current_scheduler_mode = FLUSH_SYNC;
		current_queued_root_effects = root_effects;
		is_micro_task_queued = false;

		if (flush_previous) {
			flush_queued_root_effects(previous_queued_root_effects);
		}

		var result = fn?.();

		flush_tasks();
		if (current_queued_root_effects.length > 0 || root_effects.length > 0) {
			flush_sync();
		}

		flush_count = 0;

		return result;
	} finally {
		current_scheduler_mode = previous_scheduler_mode;
		current_queued_root_effects = previous_queued_root_effects;
	}
}

/**
 * Returns a promise that resolves once any pending state changes have been applied.
 * @returns {Promise<void>}
 */
export async function tick() {
	await Promise.resolve();
	// By calling flush_sync we guarantee that any pending state changes are applied after one tick.
	// TODO look into whether we can make flushing subsequent updates synchronously in the future.
	flush_sync();
}

/**
 * @template V
 * @param {import('#client').Value<V>} signal
 * @returns {V}
 */
export function get(signal) {
	if (DEV && inspect_fn) {
		var s = /** @type {import('#client').ValueDebug} */ (signal);
		s.inspect.add(inspect_fn);
		inspect_captured_signals.push(s);
	}

	const flags = signal.f;
	if ((flags & DESTROYED) !== 0) {
		return signal.v;
	}

	if (is_signals_recorded) {
		captured_signals.add(signal);
	}

	// Register the dependency on the current reaction signal.
	if (
		current_reaction !== null &&
		(current_reaction.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 &&
		!current_untracking
	) {
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
			} else if (current_dependencies[current_dependencies.length - 1] !== signal) {
				current_dependencies.push(signal);
			}
		}
		if (
			current_untracked_writes !== null &&
			current_effect !== null &&
			(current_effect.f & CLEAN) !== 0 &&
			(current_effect.f & BRANCH_EFFECT) === 0 &&
			current_untracked_writes.includes(signal)
		) {
			set_signal_status(current_effect, DIRTY);
			schedule_effect(current_effect);
		}
	}

	if (
		(flags & DERIVED) !== 0 &&
		check_dirtiness(/** @type {import('#client').Derived} */ (signal))
	) {
		if (DEV) {
			// we want to avoid tracking indirect dependencies
			const previous_inspect_fn = inspect_fn;
			set_inspect_fn(null);
			update_derived(/** @type {import('#client').Derived} **/ (signal), false);
			set_inspect_fn(previous_inspect_fn);
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
		// Go one level up because derived signals created as part of props in legacy mode
		if ((signal.f & LEGACY_DERIVED_PROP) !== 0) {
			for (const dep of /** @type {import('#client').Derived} */ (signal).deps || []) {
				if ((dep.f & DERIVED) === 0) {
					mutate(dep, null /* doesnt matter */);
				}
			}
		} else {
			mutate(signal, null /* doesnt matter */);
		}
	}
}

/**
 * @param {import('#client').Value} signal
 * @param {number} to_status should be DIRTY or MAYBE_DIRTY
 * @param {boolean} force_schedule
 * @returns {void}
 */
export function mark_reactions(signal, to_status, force_schedule) {
	var reactions = signal.reactions;
	if (reactions === null) return;

	var runes = is_runes();
	var length = reactions.length;

	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags = reaction.f;

		// We skip any effects that are already dirty. Additionally, we also
		// skip if the reaction is the same as the current effect (except if we're not in runes or we
		// are in force schedule mode).
		if ((flags & DIRTY) !== 0 || ((!force_schedule || !runes) && reaction === current_effect)) {
			continue;
		}

		set_signal_status(reaction, to_status);

		// If the signal is not clean, then skip over it – with the exception of unowned signals that
		// are already maybe dirty. Unowned signals might be dirty because they are not captured as part of an
		// effect.
		var maybe_dirty = (flags & MAYBE_DIRTY) !== 0;
		var unowned = (flags & UNOWNED) !== 0;

		if ((flags & CLEAN) !== 0 || (maybe_dirty && unowned)) {
			if ((reaction.f & DERIVED) !== 0) {
				mark_reactions(
					/** @type {import('#client').Derived} */ (reaction),
					MAYBE_DIRTY,
					force_schedule
				);
			} else {
				schedule_effect(/** @type {import('#client').Effect} */ (reaction));
			}
		}
	}
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
	const context_map = get_or_init_context_map('getContext');
	const result = /** @type {T} */ (context_map.get(key));

	if (DEV) {
		const fn = /** @type {import('#client').ComponentContext} */ (current_component_context)
			.function;
		if (fn) {
			add_owner(result, fn, true);
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
	const context_map = get_or_init_context_map('setContext');
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
	const context_map = get_or_init_context_map('hasContext');
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
	const context_map = get_or_init_context_map('getAllContexts');

	if (DEV) {
		const fn = current_component_context?.function;
		if (fn) {
			for (const value of context_map.values()) {
				add_owner(value, fn, true);
			}
		}
	}

	return /** @type {T} */ (context_map);
}

/**
 * @param {string} name
 * @returns {Map<unknown, unknown>}
 */
function get_or_init_context_map(name) {
	if (current_component_context === null) {
		lifecycle_outside_component(name);
	}

	return (current_component_context.c ??= new Map(
		get_parent_context(current_component_context) || undefined
	));
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
 * @param {import('#client').Value<number>} signal
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update(signal, d = 1) {
	var value = +get(signal);
	set(signal, value + d);
	return value;
}

/**
 * @param {import('#client').Value<number>} signal
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update_pre(signal, d = 1) {
	return set(signal, +get(signal) + d);
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
 * @param {() => V} fallback lazy because could contain side effects
 * @returns {V}
 */
export function value_or_fallback(value, fallback) {
	return value === undefined ? fallback() : value;
}

/**
 * @template V
 * @param {V} value
 * @param {() => Promise<V>} fallback lazy because could contain side effects
 * @returns {Promise<V>}
 */
export async function value_or_fallback_async(value, fallback) {
	return value === undefined ? fallback() : value;
}

/**
 * @param {Record<string, unknown>} props
 * @param {any} runes
 * @param {Function} [fn]
 * @returns {void}
 */
export function push(props, runes = false, fn) {
	current_component_context = {
		p: current_component_context,
		c: null,
		e: null,
		m: false,
		s: props,
		x: null,
		l: null
	};

	if (!runes) {
		current_component_context.l = {
			s: null,
			u: null,
			r1: [],
			r2: source(false)
		};
	}

	if (DEV) {
		// component function
		current_component_context.function = fn;
		dev_current_component_function = fn;
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
			for (var i = 0; i < effects.length; i++) {
				effect(effects[i]);
			}
		}
		current_component_context = context_stack_item.p;
		if (DEV) {
			dev_current_component_function = context_stack_item.p?.function ?? null;
		}
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
		// When working with a possible ReactiveDate, this
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

/**
 * @template V
 * @param {V | import('#client').Value<V>} value
 * @returns {V}
 */
export function unwrap(value) {
	if (is_signal(value)) {
		// @ts-ignore
		return get(value);
	}
	// @ts-ignore
	return value;
}

if (DEV) {
	/**
	 * @param {string} rune
	 */
	function throw_rune_error(rune) {
		if (!(rune in globalThis)) {
			// TODO if people start adjusting the "this can contain runes" config through v-p-s more, adjust this message
			/** @type {any} */
			let value; // let's hope noone modifies this global, but belts and braces
			Object.defineProperty(globalThis, rune, {
				configurable: true,
				// eslint-disable-next-line getter-return
				get: () => {
					if (value !== undefined) {
						return value;
					}

					e.rune_outside_svelte(rune);
				},
				set: (v) => {
					value = v;
				}
			});
		}
	}

	throw_rune_error('$state');
	throw_rune_error('$effect');
	throw_rune_error('$derived');
	throw_rune_error('$inspect');
	throw_rune_error('$props');
	throw_rune_error('$bindable');
}

/**
 * Expects a value that was wrapped with `freeze` and makes it frozen in DEV.
 * @template T
 * @param {T} value
 * @returns {Readonly<T>}
 */
export function freeze(value) {
	if (
		typeof value === 'object' &&
		value != null &&
		!is_frozen(value) &&
		!(STATE_FROZEN_SYMBOL in value)
	) {
		// If the object is already proxified, then snapshot the value
		if (STATE_SYMBOL in value) {
			value = snapshot(value);
		}
		define_property(value, STATE_FROZEN_SYMBOL, {
			value: true,
			writable: true,
			enumerable: false
		});
		// Freeze the object in DEV
		if (DEV) {
			object_freeze(value);
		}
	}
	return value;
}
