import { DEV } from 'esm-env';
import {
	current_block,
	current_component_context,
	current_effect,
	current_reaction,
	destroy_children,
	get,
	remove_reactions,
	schedule_effect,
	set_signal_status,
	untrack
} from '../runtime.js';
import { DIRTY, MANAGED, RENDER_EFFECT, EFFECT, PRE_EFFECT, DESTROYED } from '../constants.js';
import { set } from './sources.js';

/**
 * @param {import('./types.js').EffectType} type
 * @param {(() => void | (() => void)) | ((b: import('#client').Block) => void | (() => void))} fn
 * @param {boolean} sync
 * @param {null | import('#client').Block} block
 * @param {boolean} init
 * @returns {import('#client').Effect}
 */
function create_effect(type, fn, sync, block = current_block, init = true) {
	/** @type {import('#client').Effect} */
	const signal = {
		block,
		deps: null,
		f: type | DIRTY,
		l: 0,
		fn,
		effects: null,
		deriveds: null,
		teardown: null,
		ctx: current_component_context,
		ondestroy: null
	};

	if (current_effect !== null) {
		signal.l = current_effect.l + 1;
	}

	if (current_reaction !== null) {
		if (current_reaction.effects === null) {
			current_reaction.effects = [signal];
		} else {
			current_reaction.effects.push(signal);
		}
	}

	if (init) {
		schedule_effect(signal, sync);
	}

	return signal;
}

/**
 * Internal representation of `$effect.active()`
 * @returns {boolean}
 */
export function effect_active() {
	return current_effect ? (current_effect.f & MANAGED) === 0 : false;
}

/**
 * Internal representation of `$effect(...)`
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function user_effect(fn) {
	if (current_effect === null) {
		throw new Error(
			'ERR_SVELTE_ORPHAN_EFFECT' +
				(DEV ? ': The Svelte $effect rune can only be used during component initialisation.' : '')
		);
	}

	// Non-nested `$effect(...)` in a component should be deferred
	// until the component is mounted
	const defer =
		current_effect.f & RENDER_EFFECT &&
		// TODO do we actually need this? removing them changes nothing
		current_component_context !== null &&
		!current_component_context.m;

	const effect = create_effect(EFFECT, fn, false, current_block, !defer);

	if (defer) {
		const context = /** @type {import('#client').ComponentContext} */ (current_component_context);
		(context.e ??= []).push(effect);
	}

	return effect;
}

/**
 * Internal representation of `$effect.root(...)`
 * @param {() => void | (() => void)} fn
 * @returns {() => void}
 */
export function user_root_effect(fn) {
	const effect = render_effect(fn, current_block, true);
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
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function managed_effect(fn) {
	return create_effect(EFFECT | MANAGED, fn, false);
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function managed_pre_effect(fn) {
	return create_effect(PRE_EFFECT | MANAGED, fn, false);
}

/**
 * Internal representation of `$effect.pre(...)`
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function pre_effect(fn) {
	if (current_effect === null) {
		throw new Error(
			'ERR_SVELTE_ORPHAN_EFFECT' +
				(DEV
					? ': The Svelte $effect.pre rune can only be used during component initialisation.'
					: '')
		);
	}
	const sync = current_effect !== null && (current_effect.f & RENDER_EFFECT) !== 0;

	return create_effect(PRE_EFFECT, fn, sync);
}

/**
 * Internal representation of `$: ..`
 * @param {() => any} deps
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function legacy_pre_effect(deps, fn) {
	const component_context = /** @type {import('#client').ComponentContext} */ (
		current_component_context
	);
	const token = {};
	return create_effect(
		PRE_EFFECT,
		() => {
			deps();
			if (component_context.l1.includes(token)) {
				return;
			}
			component_context.l1.push(token);
			set(component_context.l2, true);
			return untrack(fn);
		},
		true
	);
}

export function legacy_pre_effect_reset() {
	const component_context = /** @type {import('#client').ComponentContext} */ (
		current_component_context
	);
	return render_effect(() => {
		const x = get(component_context.l2);
		if (x) {
			component_context.l1.length = 0;
			component_context.l2.v = false; // set directly to avoid rerunning this effect
		}
	});
}

/**
 * This effect is used to ensure binding are kept in sync. We use a pre effect to ensure we run before the
 * bindings which are in later effects. However, we don't use a pre_effect directly as we don't want to flush anything.
 *
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function invalidate_effect(fn) {
	return create_effect(PRE_EFFECT, fn, true);
}

/**
 * @template {import('#client').Block} B
 * @param {(block: B) => void | (() => void)} fn
 * @param {any} block
 * @param {any} managed
 * @param {any} sync
 * @returns {import('#client').Effect}
 */
export function render_effect(fn, block = current_block, managed = false, sync = true) {
	let flags = RENDER_EFFECT;
	if (managed) {
		flags |= MANAGED;
	}
	return create_effect(flags, /** @type {any} */ (fn), sync, block);
}

/**
 * @param {import('#client').Effect} signal
 * @returns {void}
 */
export function destroy_effect(signal) {
	destroy_children(signal);
	remove_reactions(signal, 0);
	set_signal_status(signal, DESTROYED);

	signal.teardown?.();
	signal.ondestroy?.();
	signal.fn =
		signal.effects =
		signal.teardown =
		signal.ondestroy =
		signal.ctx =
		signal.block =
		signal.deps =
			null;
}
