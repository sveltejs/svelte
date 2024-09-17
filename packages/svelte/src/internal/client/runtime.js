/** @import { ComponentContext, Derived, Effect, Reaction, Signal, Source, Value } from '#client' */
import { DEV } from 'esm-env';
import { define_property, get_descriptors, get_prototype_of } from '../shared/utils.js';
import {
	destroy_effect,
	effect,
	execute_effect_teardown,
	unlink_effect
} from './reactivity/effects.js';
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
	DISCONNECTED
} from './constants.js';
import { flush_tasks } from './dom/task.js';
import { add_owner } from './dev/ownership.js';
import { mutate, set, source } from './reactivity/sources.js';
import { update_derived } from './reactivity/deriveds.js';
import * as e from './errors.js';
import { lifecycle_outside_component } from '../shared/errors.js';
import { FILENAME } from '../../constants.js';

const FLUSH_MICROTASK = 0;
const FLUSH_SYNC = 1;

// Used for DEV time error handling
/** @param {WeakSet<Error>} value */
const handled_errors = new WeakSet();
// Used for controlling the flush of effects.
let scheduler_mode = FLUSH_MICROTASK;
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

// Handle effect queues

/** @type {Effect[]} */
let queued_root_effects = [];

let flush_count = 0;
/** @type {Effect[]} Stack of effects, dev only */
let dev_effect_stack = [];
// Handle signal reactivity tree dependencies and reactions

/** @type {null | Reaction} */
export let active_reaction = null;

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
 * When sources are created within a derived, we record them so that we can safely allow
 * local mutations to these sources without the side-effect error being invoked unnecessarily.
 * @type {null | Source[]}
 */
export let derived_sources = null;

/**
 * @param {Source[] | null} sources
 */
export function set_derived_sources(sources) {
	derived_sources = sources;
}

/**
 * The dependencies of the reaction that is currently being executed. In many cases,
 * the dependencies are unchanged between runs, and so this will be `null` unless
 * and until a new dependency is accessed — we track this via `skipped_deps`
 * @type {null | Value[]}
 */
export let new_deps = null;

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

/** @type {number} Used by sources and deriveds for handling updates to unowned deriveds */
let current_version = 0;

// If we are working with a get() chain that has no active container,
// to prevent memory leaks, we skip adding the reaction.
export let skip_reaction = false;
// Handle collecting all signals which are read during a specific time frame
export let is_signals_recorded = false;
let captured_signals = new Set();

// Handling runtime component context
/** @type {ComponentContext | null} */
export let component_context = null;

/** @param {ComponentContext | null} context */
export function set_component_context(context) {
	component_context = context;
}

/**
 * The current component function. Different from current component context:
 * ```html
 * <!-- App.svelte -->
 * <Foo>
 *   <Bar /> <!-- context == Foo.svelte, function == App.svelte -->
 * </Foo>
 * ```
 * @type {ComponentContext['function']}
 */
export let dev_current_component_function = null;

/** @param {ComponentContext['function']} fn */
export function set_dev_current_component_function(fn) {
	dev_current_component_function = fn;
}

export function increment_version() {
	return ++current_version;
}

/** @returns {boolean} */
export function is_runes() {
	return component_context !== null && component_context.l === null;
}

/**
 * Determines whether a derived or effect is dirty.
 * If it is MAYBE_DIRTY, will set the status to CLEAN
 * @param {Reaction} reaction
 * @returns {boolean}
 */
export function check_dirtiness(reaction) {
	var flags = reaction.f;

	if ((flags & DIRTY) !== 0) {
		return true;
	}

	if ((flags & MAYBE_DIRTY) !== 0) {
		var dependencies = reaction.deps;
		var is_unowned = (flags & UNOWNED) !== 0;

		if (dependencies !== null) {
			var i;

			if ((flags & DISCONNECTED) !== 0) {
				for (i = 0; i < dependencies.length; i++) {
					(dependencies[i].reactions ??= []).push(reaction);
				}

				reaction.f ^= DISCONNECTED;
			}

			for (i = 0; i < dependencies.length; i++) {
				var dependency = dependencies[i];

				if (check_dirtiness(/** @type {Derived} */ (dependency))) {
					update_derived(/** @type {Derived} */ (dependency));
				}

				// If we are working with an unowned signal as part of an effect (due to !skip_reaction)
				// and the version hasn't changed, we still need to check that this reaction
				// is linked to the dependency source – otherwise future updates will not be caught.
				if (
					is_unowned &&
					active_effect !== null &&
					!skip_reaction &&
					!dependency?.reactions?.includes(reaction)
				) {
					(dependency.reactions ??= []).push(reaction);
				}

				if (dependency.version > reaction.version) {
					return true;
				}
			}
		}

		// Unowned signals should never be marked as clean.
		if (!is_unowned) {
			set_signal_status(reaction, CLEAN);
		}
	}

	return false;
}

/**
 * @param {Error} error
 * @param {Effect} effect
 * @param {ComponentContext | null} component_context
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

	/** @type {ComponentContext | null} */
	let current_context = component_context;

	while (current_context !== null) {
		if (DEV) {
			/** @type {string} */
			var filename = current_context.function?.[FILENAME];

			if (filename) {
				const file = filename.split('/').pop();
				component_stack.push(file);
			}
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
 * @param {Reaction} reaction
 * @returns {V}
 */
export function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_skip_reaction = skip_reaction;
	var prev_derived_sources = derived_sources;

	new_deps = /** @type {null | Value[]} */ (null);
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (reaction.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
	skip_reaction = !is_flushing_effect && (reaction.f & UNOWNED) !== 0;
	derived_sources = null;

	try {
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

			if (!skip_reaction) {
				for (i = skipped_deps; i < deps.length; i++) {
					(deps[i].reactions ??= []).push(reaction);
				}
			}
		} else if (deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}

		return result;
	} finally {
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		skip_reaction = previous_skip_reaction;
		derived_sources = prev_derived_sources;
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
		var index = reactions.indexOf(signal);
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
 * @param {Effect} signal
 * @param {boolean} remove_dom
 * @returns {void}
 */
export function destroy_effect_children(signal, remove_dom = false) {
	var effect = signal.first;
	signal.first = signal.last = null;

	while (effect !== null) {
		var next = effect.next;
		destroy_effect(effect, remove_dom);
		effect = next;
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
	var previous_component_context = component_context;

	active_effect = effect;
	component_context = effect.ctx;

	if (DEV) {
		var previous_component_fn = dev_current_component_function;
		dev_current_component_function = effect.component_function;
	}

	try {
		if ((flags & BLOCK_EFFECT) === 0) {
			destroy_effect_children(effect);
		}

		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === 'function' ? teardown : null;
		effect.version = current_version;

		if (DEV) {
			dev_effect_stack.push(effect);
		}
	} catch (error) {
		handle_error(/** @type {Error} */ (error), effect, previous_component_context);
	} finally {
		active_effect = previous_effect;
		component_context = previous_component_context;

		if (DEV) {
			dev_current_component_function = previous_component_fn;
		}
	}
}

function infinite_loop_guard() {
	if (flush_count > 1000) {
		flush_count = 0;
		if (DEV) {
			try {
				e.effect_update_depth_exceeded();
			} catch (error) {
				// stack is garbage, ignore. Instead add a console.error message.
				define_property(error, 'stack', {
					value: ''
				});
				// eslint-disable-next-line no-console
				console.error(
					'Last ten effects were: ',
					dev_effect_stack.slice(-10).map((d) => d.fn)
				);
				dev_effect_stack = [];
				throw error;
			}
		} else {
			e.effect_update_depth_exceeded();
		}
	}
	flush_count++;
}

/**
 * @param {Array<Effect>} root_effects
 * @returns {void}
 */
function flush_queued_root_effects(root_effects) {
	var length = root_effects.length;
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
				/** @type {Effect[]} */
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
 * @param {Array<Effect>} effects
 * @returns {void}
 */
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;

	for (var i = 0; i < length; i++) {
		var effect = effects[i];

		if ((effect.f & (DESTROYED | INERT)) === 0 && check_dirtiness(effect)) {
			update_effect(effect);

			// Effects with no dependencies or teardown do not get added to the effect tree.
			// Deferred effects (e.g. `$effect(...)`) _are_ added to the tree because we
			// don't know if we need to keep them until they are executed. Doing the check
			// here (rather than in `update_effect`) allows us to skip the work for
			// immediate effects.
			if (effect.deps === null && effect.first === null && effect.nodes_start === null) {
				if (effect.teardown === null) {
					// remove this effect from the graph
					unlink_effect(effect);
				} else {
					// keep the effect in the graph, but free up some memory
					effect.fn = null;
				}
			}
		}
	}
}

function process_deferred() {
	is_micro_task_queued = false;
	if (flush_count > 1001) {
		return;
	}
	const previous_queued_root_effects = queued_root_effects;
	queued_root_effects = [];
	flush_queued_root_effects(previous_queued_root_effects);
	if (!is_micro_task_queued) {
		flush_count = 0;
		if (DEV) {
			dev_effect_stack = [];
		}
	}
}

/**
 * @param {Effect} signal
 * @returns {void}
 */
export function schedule_effect(signal) {
	if (scheduler_mode === FLUSH_MICROTASK) {
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

	queued_root_effects.push(effect);
}

/**
 *
 * This function both runs render effects and collects user effects in topological order
 * from the starting effect passed in. Effects will be collected when they match the filtered
 * bitwise flag passed in only. The collected effects array will be populated with all the user
 * effects to be flushed.
 *
 * @param {Effect} effect
 * @param {Effect[]} collected_effects
 * @returns {void}
 */
function process_effects(effect, collected_effects) {
	var current_effect = effect.first;
	var effects = [];

	main_loop: while (current_effect !== null) {
		var flags = current_effect.f;
		var is_active = (flags & INERT) === 0;
		var is_branch = (flags & BRANCH_EFFECT) !== 0;
		var is_clean = (flags & CLEAN) !== 0;
		var child = current_effect.first;

		// Skip this branch if it's clean
		if (is_active && (!is_branch || !is_clean)) {
			if (is_branch) {
				set_signal_status(current_effect, CLEAN);
			}

			if ((flags & RENDER_EFFECT) !== 0) {
				if (!is_branch && check_dirtiness(current_effect)) {
					update_effect(current_effect);
				}
				// Child might have been mutated since running the effect or checking dirtiness
				child = current_effect.first;

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
 * @returns {any}
 */
export function flush_sync(fn) {
	var previous_scheduler_mode = scheduler_mode;
	var previous_queued_root_effects = queued_root_effects;

	try {
		infinite_loop_guard();

		/** @type {Effect[]} */
		const root_effects = [];

		scheduler_mode = FLUSH_SYNC;
		queued_root_effects = root_effects;
		is_micro_task_queued = false;

		flush_queued_root_effects(previous_queued_root_effects);

		var result = fn?.();

		flush_tasks();
		if (queued_root_effects.length > 0 || root_effects.length > 0) {
			flush_sync();
		}

		flush_count = 0;
		if (DEV) {
			dev_effect_stack = [];
		}

		return result;
	} finally {
		scheduler_mode = previous_scheduler_mode;
		queued_root_effects = previous_queued_root_effects;
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
 * @param {Value<V>} signal
 * @returns {V}
 */
export function get(signal) {
	var flags = signal.f;

	if ((flags & DESTROYED) !== 0) {
		return signal.v;
	}

	if (is_signals_recorded) {
		captured_signals.add(signal);
	}

	// Register the dependency on the current reaction signal.
	if (active_reaction !== null) {
		if (derived_sources !== null && derived_sources.includes(signal)) {
			e.state_unsafe_local_read();
		}
		var deps = active_reaction.deps;

		// If the signal is accessing the same dependencies in the same
		// order as it did last time, increment `skipped_deps`
		// rather than updating `new_deps`, which creates GC cost
		if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
			skipped_deps++;
		} else if (new_deps === null) {
			new_deps = [signal];
		} else {
			new_deps.push(signal);
		}

		if (
			untracked_writes !== null &&
			active_effect !== null &&
			(active_effect.f & CLEAN) !== 0 &&
			(active_effect.f & BRANCH_EFFECT) === 0 &&
			untracked_writes.includes(signal)
		) {
			set_signal_status(active_effect, DIRTY);
			schedule_effect(active_effect);
		}
	}

	if ((flags & DERIVED) !== 0) {
		var derived = /** @type {Derived} */ (signal);

		if (check_dirtiness(derived)) {
			update_derived(derived);
		}
	}

	return signal.v;
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
			for (const dep of /** @type {Derived} */ (signal).deps || []) {
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
 * Use `untrack` to prevent something from being treated as an `$effect`/`$derived` dependency.
 *
 * https://svelte-5-preview.vercel.app/docs/functions#untrack
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function untrack(fn) {
	const previous_reaction = active_reaction;
	try {
		active_reaction = null;
		return fn();
	} finally {
		active_reaction = previous_reaction;
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
		const fn = /** @type {ComponentContext} */ (component_context).function;
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
		const fn = component_context?.function;
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
	if (component_context === null) {
		lifecycle_outside_component(name);
	}

	return (component_context.c ??= new Map(get_parent_context(component_context) || undefined));
}

/**
 * @param {ComponentContext} component_context
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
 * @param {Value<number>} signal
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update(signal, d = 1) {
	var value = +get(signal);
	set(signal, value + d);
	return value;
}

/**
 * @param {Value<number>} signal
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
 * @param {Record<string, unknown>} props
 * @param {any} runes
 * @param {Function} [fn]
 * @returns {void}
 */
export function push(props, runes = false, fn) {
	component_context = {
		p: component_context,
		c: null,
		e: null,
		m: false,
		s: props,
		x: null,
		l: null
	};

	if (!runes) {
		component_context.l = {
			s: null,
			u: null,
			r1: [],
			r2: source(false)
		};
	}

	if (DEV) {
		// component function
		component_context.function = fn;
		dev_current_component_function = fn;
	}
}

/**
 * @template {Record<string, any>} T
 * @param {T} [component]
 * @returns {T}
 */
export function pop(component) {
	const context_stack_item = component_context;
	if (context_stack_item !== null) {
		if (component !== undefined) {
			context_stack_item.x = component;
		}
		const component_effects = context_stack_item.e;
		if (component_effects !== null) {
			var previous_effect = active_effect;
			context_stack_item.e = null;
			try {
				for (var i = 0; i < component_effects.length; i++) {
					var component_effect = component_effects[i];
					set_active_effect(component_effect.parent);
					effect(component_effect.fn);
				}
			} finally {
				set_active_effect(previous_effect);
			}
		}
		component_context = context_stack_item.p;
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
