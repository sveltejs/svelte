/** @import { ComponentContext as InternalComponentContext, Derived as InternalDerived, Effect as InternalEffect, Reaction as InternalReaction, Value } from '#client' */
/** @import { Batch as InternalBatch } from '../client/reactivity/batch.js' */
/** @import { Batch, ComponentContext, Effect, EffectKind, Reaction, Signal, SignalKind } from './public.js' */
import { FILENAME, UNINITIALIZED } from '../../constants.js';
import {
	ASYNC,
	BLOCK_EFFECT,
	BRANCH_EFFECT,
	DERIVED,
	DESTROYED,
	EAGER_EFFECT,
	MANAGED_EFFECT,
	PROXY_SOURCES_SYMBOL,
	RENDER_EFFECT,
	ROOT_EFFECT,
	STATE_SYMBOL,
	USER_EFFECT
} from '../client/constants.js';

// This is an internal, DEV-only, observe-only channel for the official Svelte devtools.
// It has no stability guarantee and can change in any release.

export { listen } from '../client/dev/devtools.js';

/**
 * @param {Signal} signal
 * @returns {Value}
 */
function internal_signal(signal) {
	return /** @type {any} */ (signal);
}

/**
 * @param {Reaction} reaction
 * @returns {InternalReaction}
 */
function internal_reaction(reaction) {
	return /** @type {any} */ (reaction);
}

/**
 * @param {Effect} effect
 * @returns {InternalEffect}
 */
function internal_effect(effect) {
	return /** @type {any} */ (effect);
}

/**
 * @param {ComponentContext} ctx
 * @returns {InternalComponentContext}
 */
function internal_ctx(ctx) {
	return /** @type {any} */ (ctx);
}

/**
 * @param {Batch} batch
 * @returns {InternalBatch}
 */
function internal_batch(batch) {
	return /** @type {any} */ (batch);
}

/** @param {any} value */
function is_effect(value) {
	return 'teardown' in value;
}

/**
 * The committed value of a signal, read without tracking. Deriveds are never executed, so this
 * may be stale or `undefined` (see `isUninitialized`). `$state` proxies are returned as-is,
 * use `snapshot` to read them without side effects
 * @param {Signal} signal
 * @returns {unknown}
 */
export function signalValue(signal) {
	var v = internal_signal(signal).v;
	return v === UNINITIALIZED ? undefined : v;
}

/**
 * Whether a signal has no value yet: a derived that never ran, or a deleted proxy property
 * @param {Signal} signal
 * @returns {boolean}
 */
export function isUninitialized(signal) {
	return internal_signal(signal).v === UNINITIALIZED;
}

/**
 * The signals a reaction read during its last run
 * @param {Reaction} reaction
 * @returns {Signal[]}
 */
export function deps(reaction) {
	return /** @type {any} */ (internal_reaction(reaction).deps?.slice() ?? []);
}

/**
 * The reactions that currently depend on a signal
 * @param {Signal} signal
 * @returns {Reaction[]}
 */
export function reactions(signal) {
	return /** @type {any} */ (internal_signal(signal).reactions?.slice() ?? []);
}

/**
 * The child effects of an effect, in order
 * @param {Effect} effect
 * @returns {Effect[]}
 */
export function children(effect) {
	/** @type {Effect[]} */
	var result = [];
	var child = internal_effect(effect).first;

	while (child !== null) {
		result.push(/** @type {any} */ (child));
		child = child.next;
	}

	return result;
}

/**
 * The effect a reaction belongs to: the parent effect of an effect, or the effect a derived was
 * created in
 * @param {Reaction} reaction
 * @returns {Effect | null}
 */
export function parentEffect(reaction) {
	return /** @type {any} */ (reaction).parent;
}

/**
 * @overload
 * @param {Effect} value
 * @returns {EffectKind}
 */
/**
 * @overload
 * @param {Signal} value
 * @returns {SignalKind}
 */
/**
 * @overload
 * @param {Reaction} value
 * @returns {EffectKind | SignalKind}
 */
/**
 * What kind of signal or effect this is, computed from its flags. Proxy properties can't be told
 * apart from `$state` this way, use the `kind` passed to `signalCreated` for that.
 * `effect` and `effectPre` are `$effect` and `$effect.pre` (which have a `location`) and APIs built
 * on them, like `onMount`, `beforeUpdate`/`afterUpdate` and `run` from `svelte/legacy`. `render`
 * includes template effects and the other effects Svelte creates for the template, like actions,
 * attachments, bindings and transitions
 * @param {Signal | Reaction} value
 * @returns {SignalKind | EffectKind}
 */
export function kind(value) {
	var f = /** @type {any} */ (value).f;

	if (!is_effect(value)) {
		if ((f & DERIVED) !== 0) return 'derived';
		if ((f & ASYNC) !== 0) return 'async-derived';
		return 'state';
	}

	if ((f & ROOT_EFFECT) !== 0) return 'root';
	if ((f & BRANCH_EFFECT) !== 0) return 'branch';
	if ((f & BLOCK_EFFECT) !== 0) return 'block';
	if ((f & MANAGED_EFFECT) !== 0) return 'managed';
	if ((f & EAGER_EFFECT) !== 0) return 'eager';
	if ((f & ASYNC) !== 0) return 'async';
	if ((f & USER_EFFECT) !== 0) return (f & RENDER_EFFECT) !== 0 ? 'effectPre' : 'effect';

	return 'render';
}

/**
 * @param {Effect | Reaction} effect
 * @returns {boolean}
 */
export function isDestroyed(effect) {
	return (internal_reaction(effect).f & DESTROYED) !== 0;
}

/**
 * The DEV label of a signal, e.g. `count` or `todos[0].text`
 * @param {Signal} signal
 * @returns {string | undefined}
 */
export function label(signal) {
	return internal_signal(signal).label;
}

/**
 * Where a signal or effect was declared, as `file:line:column`, if known
 * @param {Signal | Reaction} value
 * @returns {string | undefined}
 */
export function location(value) {
	return /** @type {any} */ (value).location ?? undefined;
}

/**
 * The component an effect belongs to. `null` once the effect is destroyed
 * @param {Effect | Reaction} effect
 * @returns {ComponentContext | null}
 */
export function componentOf(effect) {
	return /** @type {any} */ (internal_reaction(effect).ctx);
}

/**
 * The component function of a component context. `undefined` for the context `mount`/`hydrate`
 * create around the root component
 * @param {ComponentContext} ctx
 * @returns {Function | undefined}
 */
export function componentFunction(ctx) {
	return internal_ctx(ctx).function ?? undefined;
}

/**
 * The filename of a component, as passed to the compiler
 * @param {ComponentContext} ctx
 * @returns {string | undefined}
 */
export function filename(ctx) {
	return internal_ctx(ctx).function?.[FILENAME];
}

/**
 * The parent component in the render tree
 * @param {ComponentContext} ctx
 * @returns {ComponentContext | null}
 */
export function parentComponent(ctx) {
	return /** @type {any} */ (internal_ctx(ctx).p);
}

/**
 * The effect that was active when the component was created. Sibling components may share it
 * @param {ComponentContext} ctx
 * @returns {Effect | null}
 */
export function componentEffect(ctx) {
	return /** @type {any} */ (internal_ctx(ctx).r ?? null);
}

/**
 * @param {Batch} batch
 * @returns {number}
 */
export function batchId(batch) {
	return internal_batch(batch).id;
}

/**
 * @param {Batch} batch
 * @returns {boolean}
 */
export function isFork(batch) {
	return internal_batch(batch).is_fork;
}

/**
 * Read a value, turning `$state` proxies into plain objects and arrays, without going through
 * the proxy traps (so nothing is tracked, and no proxy signals are created). Objects that are
 * not `$state` proxies are returned as-is
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function snapshot(value) {
	return snapshot_value(value, new Map());
}

/**
 * @param {any} value
 * @param {Map<any, any>} seen
 * @returns {any}
 */
function snapshot_value(value, seen) {
	if (typeof value !== 'object' || value === null) {
		return value;
	}

	var sources;

	try {
		if (!(STATE_SYMBOL in value)) return value;
		sources = value[PROXY_SOURCES_SYMBOL];
	} catch {
		// e.g. a cross-origin window
		return value;
	}

	if (sources === undefined) return value;

	var existing = seen.get(value);
	if (existing !== undefined) return existing;

	var target = value[STATE_SYMBOL];

	if (Array.isArray(target)) {
		var length_source = sources.get('length');
		var length = length_source !== undefined ? length_source.v : target.length;

		// sized up front, so that trailing holes are kept
		/** @type {any[]} */
		var array = new Array(length);
		seen.set(value, array);

		for (var i = 0; i < length; i += 1) {
			var s = sources.get(String(i));

			if (s !== undefined) {
				if (s.v !== UNINITIALIZED) array[i] = snapshot_value(s.v, seen);
			} else if (i in target) {
				array[i] = snapshot_value(target[i], seen);
			}
		}

		return array;
	}

	/** @type {Record<PropertyKey, any>} */
	var object = {};
	seen.set(value, object);

	for (var key of Object.keys(target)) {
		var source = sources.get(key);

		if (source === undefined) {
			object[key] = snapshot_value(target[key], seen);
		} else if (source.v !== UNINITIALIZED) {
			object[key] = snapshot_value(source.v, seen);
		}
	}

	for (var [k, entry] of sources) {
		if (typeof k === 'string' && !(k in object) && entry.v !== UNINITIALIZED) {
			object[k] = snapshot_value(entry.v, seen);
		}
	}

	return object;
}
