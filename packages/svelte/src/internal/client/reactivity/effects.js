/** @import { ComponentContext, ComponentContextLegacy, Derived, Effect, Reaction, TemplateNode, TransitionManager } from '#client' */
import {
	check_dirtiness,
	active_effect,
	active_reaction,
	update_effect,
	get,
	is_destroying_effect,
	remove_reactions,
	schedule_effect,
	set_active_reaction,
	set_is_destroying_effect,
	set_signal_status,
	untrack,
	untracking
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
	EFFECT_TRANSPARENT,
	DERIVED,
	UNOWNED,
	CLEAN,
	INSPECT_EFFECT,
	HEAD_EFFECT,
	MAYBE_DIRTY,
	EFFECT_HAS_DERIVED,
	BOUNDARY_EFFECT,
	EFFECT_IS_UPDATING,
	DISCONNECTED,
	LEGACY_DERIVED_PROP
} from '#client/constants';
import { set } from './sources.js';
import * as e from '../errors.js';
import { DEV } from 'esm-env';
import { define_property } from '../../shared/utils.js';
import { get_next_sibling } from '../dom/operations.js';
import { derived } from './deriveds.js';
import { component_context, dev_current_component_function } from '../context.js';
import { FILENAME } from '../../../constants.js';

/**
 * Get human-readable information about an effect for debugging
 * @param {Effect | null} effect
 * @returns {{
 *   type: string,
 *   typeFlags: string,
 *   typeNumeric: number,
 *   typeBinary: string,
 *   status: string,
 *   parent: string,
 *   parentChain: string,
 *   component: string,
 *   hasChildren: boolean,
 *   hasDeps: number,
 *   hasNodes: boolean
 * }}
 */
export function get_effect_debug_info(effect) {
	if (!effect)
		return {
			type: 'NO_EFFECT',
			typeFlags: '0x0 (0)',
			typeNumeric: 0,
			typeBinary: '00000000',
			status: 'NONE',
			parent: 'NO_PARENT',
			parentChain: 'NONE',
			component: 'NO_COMPONENT',
			hasChildren: false,
			hasDeps: 0,
			hasNodes: false
		};

	const flags = effect.f;

	// Core effect types
	const effectTypes = [];
	const statusFlags = [];

	// Core effect types
	if (flags & DERIVED) effectTypes.push('DERIVED');
	if (flags & EFFECT) effectTypes.push('EFFECT');
	if (flags & RENDER_EFFECT) effectTypes.push('RENDER_EFFECT');
	if (flags & BLOCK_EFFECT) effectTypes.push('BLOCK_EFFECT');
	if (flags & BRANCH_EFFECT) effectTypes.push('BRANCH_EFFECT');
	if (flags & ROOT_EFFECT) effectTypes.push('ROOT_EFFECT');
	if (flags & BOUNDARY_EFFECT) effectTypes.push('BOUNDARY_EFFECT');
	if (flags & INSPECT_EFFECT) effectTypes.push('INSPECT_EFFECT');
	if (flags & HEAD_EFFECT) effectTypes.push('HEAD_EFFECT');

	// Status flags
	if (flags & UNOWNED) statusFlags.push('UNOWNED');
	if (flags & DISCONNECTED) statusFlags.push('DISCONNECTED');
	if (flags & CLEAN) statusFlags.push('CLEAN');
	if (flags & DIRTY) statusFlags.push('DIRTY');
	if (flags & MAYBE_DIRTY) statusFlags.push('MAYBE_DIRTY');
	if (flags & INERT) statusFlags.push('INERT');
	if (flags & DESTROYED) statusFlags.push('DESTROYED');
	if (flags & EFFECT_RAN) statusFlags.push('EFFECT_RAN');
	if (flags & EFFECT_TRANSPARENT) statusFlags.push('EFFECT_TRANSPARENT');
	if (flags & LEGACY_DERIVED_PROP) statusFlags.push('LEGACY_DERIVED_PROP');
	if (flags & EFFECT_HAS_DERIVED) statusFlags.push('EFFECT_HAS_DERIVED');
	if (flags & EFFECT_IS_UPDATING) statusFlags.push('EFFECT_IS_UPDATING');

	// Build parent chain
	const parentChain = [];
	let current = effect.parent;
	let depth = 0;

	while (current && depth < 5) {
		// Limit depth to prevent infinite loops
		const parentTypes = [];
		const parentFlags = current.f;

		if (parentFlags & DERIVED) parentTypes.push('DERIVED');
		if (parentFlags & EFFECT) parentTypes.push('EFFECT');
		if (parentFlags & RENDER_EFFECT) parentTypes.push('RENDER');
		if (parentFlags & BLOCK_EFFECT) parentTypes.push('BLOCK');
		if (parentFlags & BRANCH_EFFECT) parentTypes.push('BRANCH');
		if (parentFlags & ROOT_EFFECT) parentTypes.push('ROOT');
		if (parentFlags & BOUNDARY_EFFECT) parentTypes.push('BOUNDARY');
		if (parentFlags & INSPECT_EFFECT) parentTypes.push('INSPECT');
		if (parentFlags & HEAD_EFFECT) parentTypes.push('HEAD');

		parentChain.push(parentTypes.length > 0 ? parentTypes.join('+') : 'UNKNOWN');
		current = current.parent;
		depth++;
	}

	return {
		type: effectTypes.length > 0 ? effectTypes.join(' + ') : 'UNKNOWN',
		typeFlags: `0x${flags.toString(16)} (${flags})`,
		typeNumeric: flags,
		typeBinary: flags.toString(2).padStart(8, '0'),
		status: statusFlags.join(' + ') || 'NONE',
		parent: effect.parent ? 'HAS_PARENT' : 'NO_PARENT',
		parentChain: parentChain.length > 0 ? parentChain.join(' → ') : 'NO_PARENTS',
		component: effect.component_function?.name || 'NO_COMPONENT',
		hasChildren: !!effect.first,
		hasDeps: effect.deps ? effect.deps.length : 0,
		hasNodes: !!effect.nodes_start
	};
}

/**
 * Decode reaction/effect flags (the 'f' property) into human-readable format
 * The 'f' property contains bitwise flags that represent:
 * - Type of effect (RENDER_EFFECT, BRANCH_EFFECT, etc.)
 * - Status flags (DIRTY, CLEAN, MAYBE_DIRTY, etc.)
 * - Behavior flags (UNOWNED, INERT, etc.)
 *
 * @param {number} flags - The flags value (reaction.f or effect.f)
 * @returns {{
 *   numeric: number,
 *   hex: string,
 *   binary: string,
 *   types: string[],
 *   status: string[],
 *   behavior: string[],
 *   all: string[],
 *   summary: string
 * }}
 */
export function decode_reaction_flags(flags) {
	const types = [];
	const status = [];
	const behavior = [];

	// Core effect/reaction types
	if (flags & DERIVED) types.push('DERIVED');
	if (flags & EFFECT) types.push('EFFECT');
	if (flags & RENDER_EFFECT) types.push('RENDER_EFFECT');
	if (flags & BLOCK_EFFECT) types.push('BLOCK_EFFECT');
	if (flags & BRANCH_EFFECT) types.push('BRANCH_EFFECT');
	if (flags & ROOT_EFFECT) types.push('ROOT_EFFECT');
	if (flags & BOUNDARY_EFFECT) types.push('BOUNDARY_EFFECT');
	if (flags & INSPECT_EFFECT) types.push('INSPECT_EFFECT');
	if (flags & HEAD_EFFECT) types.push('HEAD_EFFECT');

	// Status flags (mutually exclusive in some cases)
	if (flags & CLEAN) status.push('CLEAN');
	if (flags & DIRTY) status.push('DIRTY');
	if (flags & MAYBE_DIRTY) status.push('MAYBE_DIRTY');
	if (flags & DESTROYED) status.push('DESTROYED');
	if (flags & EFFECT_RAN) status.push('EFFECT_RAN');
	if (flags & EFFECT_IS_UPDATING) status.push('EFFECT_IS_UPDATING');

	// Behavior flags
	if (flags & UNOWNED) behavior.push('UNOWNED');
	if (flags & DISCONNECTED) behavior.push('DISCONNECTED');
	if (flags & INERT) behavior.push('INERT');
	if (flags & EFFECT_TRANSPARENT) behavior.push('EFFECT_TRANSPARENT');
	if (flags & LEGACY_DERIVED_PROP) behavior.push('LEGACY_DERIVED_PROP');
	if (flags & EFFECT_HAS_DERIVED) behavior.push('EFFECT_HAS_DERIVED');

	const all = [...types, ...status, ...behavior];

	return {
		numeric: flags,
		hex: `0x${flags.toString(16).toUpperCase()}`,
		binary: flags.toString(2).padStart(24, '0'), // 24 bits for better readability
		types,
		status,
		behavior,
		all,
		summary: all.length > 0 ? all.join(' + ') : 'NO_FLAGS'
	};
}

/**
 * Log the operation being performed on reaction flags for debugging
 * Usage: log_flag_operation(reaction, 'f ^= EFFECT_IS_UPDATING', EFFECT_IS_UPDATING)
 *
 * @param {any} reaction - The reaction/effect object
 * @param {string} operation - Description of the operation (e.g., 'f ^= EFFECT_IS_UPDATING')
 * @param {number} flagValue - The flag value being operated on
 */
export function log_flag_operation(reaction, operation, flagValue) {
	if (!DEV) return;

	const beforeFlags = decode_reaction_flags(reaction.f);
	const operationFlag = decode_reaction_flags(flagValue);

	// Create flags string with format "FLAG_NAME (number) + FLAG_NAME (number)"
	const flagsString =
		beforeFlags.all
			.map((flag) => {
				const flagNumeric = getFlagNumericValue(flag);
				return `${flag} (${flagNumeric})`;
			})
			.join(' + ') || 'NO_FLAGS (0)';

	// Create operation description
	const operationType = operation.includes('^=')
		? 'toggle flag'
		: operation.includes('|=')
			? 'add flag'
			: operation.includes('&=')
				? 'remove flag'
				: 'set flag';

	console.debug(`Flag operation: ${operation}`, {
		flags: flagsString,
		operation: `(${operation}) ${operationType}`,
		operationFlag: `${operationFlag.summary} (${flagValue})`
	});
}

/**
 * Helper to get numeric value for a flag name
 * @param {string} flagName
 * @returns {number}
 */
function getFlagNumericValue(flagName) {
	const flagMap = /** @type {Record<string, number>} */ ({
		DERIVED: DERIVED,
		EFFECT: EFFECT,
		RENDER_EFFECT: RENDER_EFFECT,
		BLOCK_EFFECT: BLOCK_EFFECT,
		BRANCH_EFFECT: BRANCH_EFFECT,
		ROOT_EFFECT: ROOT_EFFECT,
		BOUNDARY_EFFECT: BOUNDARY_EFFECT,
		INSPECT_EFFECT: INSPECT_EFFECT,
		HEAD_EFFECT: HEAD_EFFECT,
		CLEAN: CLEAN,
		DIRTY: DIRTY,
		MAYBE_DIRTY: MAYBE_DIRTY,
		DESTROYED: DESTROYED,
		EFFECT_RAN: EFFECT_RAN,
		EFFECT_IS_UPDATING: EFFECT_IS_UPDATING,
		UNOWNED: UNOWNED,
		DISCONNECTED: DISCONNECTED,
		INERT: INERT,
		EFFECT_TRANSPARENT: EFFECT_TRANSPARENT,
		LEGACY_DERIVED_PROP: LEGACY_DERIVED_PROP,
		EFFECT_HAS_DERIVED: EFFECT_HAS_DERIVED
	});
	return flagMap[flagName] || 0;
}

/**
 * Log effect processing information in a simplified format
 * @param {Effect} effect - The effect being processed
 */
export function get_effect_info(effect) {
	if (!DEV) return;

	const flags = effect.f;
	const effectInfo = decode_reaction_flags(flags);

	return {
		effectType: effectInfo.summary,
		component: effect.component_function?.[FILENAME] || 'NO_COMPONENT',
		effect: effect
	};
}

/**
 * Build a tree representation of effects starting from a root effect
 * @param {Effect} root - The root effect to start traversal from
 * @returns {{effectType: string, component: string, effect: Effect, children: any[]} | null} Tree representation
 */
export function get_effect_tree(root) {
	if (!root) return null;

	const map = new Map();

	// Create root object
	const rootObj = {
		effectType: decode_reaction_flags(root.f).summary,
		component: root.component_function?.[FILENAME] || 'NO_COMPONENT',
		effect: root,
		children: []
	};
	map.set(root, rootObj);

	// Start traversal from root's first child
	let effect = root.first;

	while (effect != null) {
		// Create object for current effect
		const effectObj = {
			effectType: decode_reaction_flags(effect.f).summary,
			component: effect.component_function?.[FILENAME] || 'NO_COMPONENT',
			effect: effect,
			children: []
		};
		map.set(effect, effectObj);

		// Add to parent's children array
		if (effect.parent && map.has(effect.parent)) {
			const parentObj = map.get(effect.parent);
			parentObj.children.push(effectObj);
		}

		// Navigate to children first (depth-first traversal)
		const child = effect.first;
		if (child !== null) {
			effect = child;
			continue;
		}

		// Then navigate to siblings
		let parent = effect.parent;
		effect = effect.next;

		// If no sibling, go up to parent and try its sibling
		while (effect === null && parent !== null) {
			effect = parent.next;
			parent = parent.parent;
		}
	}

	return rootObj;
}

/**
 * Get all parent effects of a given effect in an array
 * @param {Effect} effect - The effect to get parents for
 * @returns {Array<{effectType: string, component: string, effect: Effect}>} Array of parent effects
 */
export function get_effect_parents(effect) {
	if (!effect) return [];

	const parents = [];
	let current = effect.parent;

	while (current != null) {
		const parentObj = {
			effectType: decode_reaction_flags(current.f).summary,
			component: current.component_function?.[FILENAME] || 'NO_COMPONENT',
			effect: current
		};
		parents.push(parentObj);
		current = current.parent;
	}

	return parents;
}

/**
 * Comprehensive effect debugging information combining all logging utilities
 * @param {Effect} effect - The effect to get debugging info for
 * @returns {{
 *   info: {effectType: string, component: string, effect: Effect} | null,
 *   tree: {effectType: string, component: string, effect: Effect, children: any[]} | null,
 *   parents: Array<{effectType: string, component: string, effect: Effect}>
 * }} Combined debugging information
 */
export function get_comprehensive_effect_info(effect) {
	if (!DEV || !effect) {
		return {
			info: null,
			tree: null,
			parents: []
		};
	}

	return {
		info: get_effect_info(effect) || null,
		tree: get_effect_tree(effect),
		parents: get_effect_parents(effect)
	};
}

/**
 * @param {'$effect' | '$effect.pre' | '$inspect'} rune
 */
export function validate_effect(rune) {
	if (active_effect === null && active_reaction === null) {
		e.effect_orphan(rune);
	}

	if (active_reaction !== null && (active_reaction.f & UNOWNED) !== 0 && active_effect === null) {
		e.effect_in_unowned_derived();
	}

	if (is_destroying_effect) {
		e.effect_in_teardown(rune);
	}
}

/**
 * @param {Effect} effect
 * @param {Effect} parent_effect
 */
function push_effect(effect, parent_effect) {
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
 * @param {null | (() => void | (() => void))} fn
 * @param {boolean} sync
 * @param {boolean} push
 * @returns {Effect}
 */
function create_effect(type, fn, sync, push = true) {
	var parent = active_effect;

	if (DEV) {
		// Ensure the parent is never an inspect effect
		while (parent !== null && (parent.f & INSPECT_EFFECT) !== 0) {
			parent = parent.parent;
		}
	}

	/** @type {Effect} */
	var effect = {
		ctx: component_context,
		deps: null,
		nodes_start: null,
		nodes_end: null,
		f: type | DIRTY,
		first: null,
		fn,
		last: null,
		next: null,
		parent,
		prev: null,
		teardown: null,
		transitions: null,
		wv: 0
	};

	if (DEV) {
		// if (effect.component_function?.[FILENAME].includes('NestedComponent')) {
		// 	console.debug('create_effect', get_comprehensive_effect_info(effect));
		// }
	}

	if (DEV) {
		effect.component_function = dev_current_component_function;
	}

	if (sync) {
		try {
			update_effect(effect);
			effect.f |= EFFECT_RAN;
		} catch (e) {
			destroy_effect(effect);
			throw e;
		}
	} else if (fn !== null) {
		schedule_effect(effect);
	}

	// if an effect has no dependencies, no DOM and no teardown function,
	// don't bother adding it to the effect tree
	var inert =
		sync &&
		effect.deps === null &&
		effect.first === null &&
		effect.nodes_start === null &&
		effect.teardown === null &&
		(effect.f & (EFFECT_HAS_DERIVED | BOUNDARY_EFFECT)) === 0;

	if (!inert && push) {
		if (parent !== null) {
			push_effect(effect, parent);
		}

		// if we're in a derived, add the effect there too
		if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
			var derived = /** @type {Derived} */ (active_reaction);
			(derived.effects ??= []).push(effect);
		}
	}

	return effect;
}

/**
 * Internal representation of `$effect.tracking()`
 * @returns {boolean}
 */
export function effect_tracking() {
	return active_reaction !== null && !untracking;
}

/**
 * @param {() => void} fn
 */
export function teardown(fn) {
	const effect = create_effect(RENDER_EFFECT, null, false);
	set_signal_status(effect, CLEAN);
	effect.teardown = fn;
	return effect;
}

/**
 * Internal representation of `$effect(...)`
 * @param {() => void | (() => void)} fn
 */
export function user_effect(fn) {
	validate_effect('$effect');

	// Non-nested `$effect(...)` in a component should be deferred
	// until the component is mounted
	var defer =
		active_effect !== null &&
		(active_effect.f & BRANCH_EFFECT) !== 0 &&
		component_context !== null &&
		!component_context.m;

	if (DEV) {
		define_property(fn, 'name', {
			value: '$effect'
		});
	}

	if (defer) {
		var context = /** @type {ComponentContext} */ (component_context);
		(context.e ??= []).push({
			fn,
			effect: active_effect,
			reaction: active_reaction
		});
	} else {
		var signal = effect(fn);
		return signal;
	}
}

/**
 * Internal representation of `$effect.pre(...)`
 * @param {() => void | (() => void)} fn
 * @returns {Effect}
 */
export function user_pre_effect(fn) {
	validate_effect('$effect.pre');
	if (DEV) {
		define_property(fn, 'name', {
			value: '$effect.pre'
		});
	}
	return render_effect(fn);
}

/** @param {() => void | (() => void)} fn */
export function inspect_effect(fn) {
	return create_effect(INSPECT_EFFECT, fn, true);
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
 * An effect root whose children can transition out
 * @param {() => void} fn
 * @returns {(options?: { outro?: boolean }) => Promise<void>}
 */
export function component_root(fn) {
	const effect = create_effect(ROOT_EFFECT, fn, true);

	return (options = {}) => {
		return new Promise((fulfil) => {
			if (options.outro) {
				pause_effect(effect, () => {
					destroy_effect(effect);
					fulfil(undefined);
				});
			} else {
				destroy_effect(effect);
				fulfil(undefined);
			}
		});
	};
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {Effect}
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
	var context = /** @type {ComponentContextLegacy} */ (component_context);

	/** @type {{ effect: null | Effect, ran: boolean }} */
	var token = { effect: null, ran: false };
	context.l.r1.push(token);

	token.effect = render_effect(() => {
		deps();

		// If this legacy pre effect has already run before the end of the reset, then
		// bail out to emulate the same behavior.
		if (token.ran) return;

		token.ran = true;
		set(context.l.r2, true);
		untrack(fn);
	});
}

export function legacy_pre_effect_reset() {
	var context = /** @type {ComponentContextLegacy} */ (component_context);

	render_effect(() => {
		if (!get(context.l.r2)) return;

		// Run dirty `$:` statements
		for (var token of context.l.r1) {
			var effect = token.effect;

			// If the effect is CLEAN, then make it MAYBE_DIRTY. This ensures we traverse through
			// the effects dependencies and correctly ensure each dependency is up-to-date.
			if ((effect.f & CLEAN) !== 0) {
				set_signal_status(effect, MAYBE_DIRTY);
			}

			if (check_dirtiness(effect)) {
				update_effect(effect);
			}

			token.ran = false;
		}

		context.l.r2.v = false; // set directly to avoid rerunning this effect
	});
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {Effect}
 */
export function render_effect(fn) {
	return create_effect(RENDER_EFFECT, fn, true);
}

/**
 * @param {(...expressions: any) => void | (() => void)} fn
 * @param {Array<() => any>} thunks
 * @returns {Effect}
 */
export function template_effect(fn, thunks = [], d = derived) {
	const deriveds = thunks.map(d);
	const effect = () => fn(...deriveds.map(get));

	if (DEV) {
		define_property(effect, 'name', {
			value: '{expression}'
		});
	}

	return block(effect);
}

/**
 * @param {(() => void)} fn
 * @param {number} flags
 */
export function block(fn, flags = 0) {
	return create_effect(RENDER_EFFECT | BLOCK_EFFECT | flags, fn, true);
}

/**
 * @param {(() => void)} fn
 * @param {boolean} [push]
 */
export function branch(fn, push = true) {
	return create_effect(RENDER_EFFECT | BRANCH_EFFECT, fn, true, push);
}

/**
 * @param {Effect} effect
 */
export function execute_effect_teardown(effect) {
	var teardown = effect.teardown;
	if (teardown !== null) {
		const previously_destroying_effect = is_destroying_effect;
		const previous_reaction = active_reaction;
		set_is_destroying_effect(true);
		set_active_reaction(null);
		try {
			teardown.call(null);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
			set_active_reaction(previous_reaction);
		}
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

		if ((effect.f & ROOT_EFFECT) !== 0) {
			// this is now an independent root
			effect.parent = null;
		} else {
			destroy_effect(effect, remove_dom);
		}

		effect = next;
	}
}

/**
 * @param {Effect} signal
 * @returns {void}
 */
export function destroy_block_effect_children(signal) {
	var effect = signal.first;

	while (effect !== null) {
		var next = effect.next;
		if ((effect.f & BRANCH_EFFECT) === 0) {
			destroy_effect(effect);
		}
		effect = next;
	}
}

/**
 * @param {Effect} effect
 * @param {boolean} [remove_dom]
 * @returns {void}
 */
export function destroy_effect(effect, remove_dom = true) {
	var removed = false;

	if ((remove_dom || (effect.f & HEAD_EFFECT) !== 0) && effect.nodes_start !== null) {
		remove_effect_dom(effect.nodes_start, /** @type {TemplateNode} */ (effect.nodes_end));
		removed = true;
	}

	destroy_effect_children(effect, remove_dom && !removed);
	remove_reactions(effect, 0);
	set_signal_status(effect, DESTROYED);

	var transitions = effect.transitions;

	if (transitions !== null) {
		for (const transition of transitions) {
			transition.stop();
		}
	}

	execute_effect_teardown(effect);

	var parent = effect.parent;

	// If the parent doesn't have any children, then skip this work altogether
	if (parent !== null && parent.first !== null) {
		unlink_effect(effect);
	}

	if (DEV) {
		effect.component_function = null;
	}

	// `first` and `child` are nulled out in destroy_effect_children
	// we don't null out `parent` so that error propagation can work correctly
	effect.next =
		effect.prev =
		effect.teardown =
		effect.ctx =
		effect.deps =
		effect.fn =
		effect.nodes_start =
		effect.nodes_end =
			null;
}

/**
 *
 * @param {TemplateNode | null} node
 * @param {TemplateNode} end
 */
export function remove_effect_dom(node, end) {
	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /** @type {TemplateNode} */ (get_next_sibling(node));

		node.remove();
		node = next;
	}
}

/**
 * Detach an effect from the effect tree, freeing up memory and
 * reducing the amount of work that happens on subsequent traversals
 * @param {Effect} effect
 */
export function unlink_effect(effect) {
	var parent = effect.parent;
	var prev = effect.prev;
	var next = effect.next;

	if (prev !== null) prev.next = next;
	if (next !== null) next.prev = prev;

	if (parent !== null) {
		if (parent.first === effect) parent.first = next;
		if (parent.last === effect) parent.last = prev;
	}
}

/**
 * When a block effect is removed, we don't immediately destroy it or yank it
 * out of the DOM, because it might have transitions. Instead, we 'pause' it.
 * It stays around (in memory, and in the DOM) until outro transitions have
 * completed, and if the state change is reversed then we _resume_ it.
 * A paused effect does not update, and the DOM subtree becomes inert.
 * @param {Effect} effect
 * @param {() => void} [callback]
 */
export function pause_effect(effect, callback) {
	/** @type {TransitionManager[]} */
	var transitions = [];

	pause_children(effect, transitions, true);

	run_out_transitions(transitions, () => {
		destroy_effect(effect);
		if (callback) callback();
	});
}

/**
 * @param {TransitionManager[]} transitions
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
 * @param {Effect} effect
 * @param {TransitionManager[]} transitions
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
 * @param {Effect} effect
 */
export function resume_effect(effect) {
	resume_children(effect, true);
}

/**
 * @param {Effect} effect
 * @param {boolean} local
 */
function resume_children(effect, local) {
	if ((effect.f & INERT) === 0) return;
	effect.f ^= INERT;

	// Ensure the effect is marked as clean again so that any dirty child
	// effects can schedule themselves for execution
	if ((effect.f & CLEAN) === 0) {
		effect.f ^= CLEAN;
	}

	// If a dependency of this effect changed while it was paused,
	// schedule the effect to update
	if (check_dirtiness(effect)) {
		set_signal_status(effect, DIRTY);
		schedule_effect(effect);
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
