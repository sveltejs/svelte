/** @import { ComponentContext, Effect, Value } from '#client' */
/** @import { DevtoolsHooks } from '../../devtools/public.js' */
/** @import { SignalCreatedInfo } from '../../devtools/public.js' */
import { DEV } from 'esm-env';
import { ASYNC, DERIVED } from '#client/constants';
import { noop } from '../../shared/utils.js';
import { active_reaction, set_active_reaction, untrack, active_effect } from '../runtime.js';
import { component_context } from '../context.js';

/**
 * The names of every event a devtools plugin can subscribe to.
 * @type {Array<Exclude<keyof DevtoolsHooks, 'name'>>}
 */
const EVENTS = [
	'componentCreated',
	'componentInitialized',
	'componentDestroyed',
	'signalCreated',
	'signalWritten',
	'effectCreated',
	'effectDestroyed',
	'reactionRunStart',
	'reactionRunEnd',
	'flushStart',
	'flushEnd',
	'batchCommitted',
	'batchDiscarded',
	'hmrUpdateStart',
	'hmrUpdateEnd',
	'warningEmitted'
];

/**
 * @typedef {{ name: string, plugin: DevtoolsHooks, fn: Function }} Listener
 */

/**
 * Per-event listener arrays, rebuilt whenever a plugin subscribes or unsubscribes.
 * `null` means nobody listens, so a call site is `if (DEV && hooks.x !== null)`
 * @type {Record<Exclude<keyof DevtoolsHooks, 'name'>, Listener[] | null>}
 */
export const hooks = {
	componentCreated: null,
	componentInitialized: null,
	componentDestroyed: null,
	signalCreated: null,
	signalWritten: null,
	effectCreated: null,
	effectDestroyed: null,
	reactionRunStart: null,
	reactionRunEnd: null,
	flushStart: null,
	flushEnd: null,
	batchCommitted: null,
	batchDiscarded: null,
	hmrUpdateStart: null,
	hmrUpdateEnd: null,
	warningEmitted: null
};

/**
 * One entry per `listen` call, so that a stale unsubscribe can't remove a later subscription of
 * the same plugin object
 * @type {Array<{ plugin: DevtoolsHooks }>}
 */
let plugins = [];

/**
 * How many plugin callbacks are currently running. Used to forbid state writes inside callbacks
 */
export let devtools_depth = 0;

/**
 * Sources that were already announced through `signalCreated`, so that relabels don't re-fire.
 * Only populated while somebody listens to `signalCreated`
 * @type {WeakSet<Value>}
 */
let announced = new WeakSet();

/**
 * Effects whose `effectDestroyed` was already reported (e.g. because they were elided), so that a
 * later `destroy_effect` call doesn't report them twice
 * @type {WeakSet<Effect>}
 */
let destroyed = new WeakSet();

/**
 * Component contexts, keyed by the effect that was active when they were pushed (`ctx.r`).
 * Consumed in `destroy_effect` to emit `componentDestroyed`. Only populated while somebody
 * listens to `componentDestroyed`
 * @type {WeakMap<Effect, ComponentContext[]>}
 */
let component_effects = new WeakMap();

function rebuild() {
	for (const event of EVENTS) {
		/** @type {Listener[]} */
		const listeners = [];

		for (const { plugin } of plugins) {
			const fn = plugin[event];
			if (typeof fn === 'function') {
				listeners.push({ name: plugin.name, plugin, fn });
			}
		}

		hooks[event] = listeners.length > 0 ? listeners : null;
	}
}

/**
 * Subscribe a devtools plugin. Plugins are called synchronously, in the order they subscribed.
 * Subscribing with the `name` of an existing plugin replaces it in place.
 * @param {DevtoolsHooks} plugin
 * @returns {() => void}
 */
export function listen(plugin) {
	if (!DEV) return noop;

	if (typeof plugin?.name !== 'string' || plugin.name === '') {
		throw new Error('A devtools plugin must have a non-empty `name`');
	}

	const entry = { plugin };
	const index = plugins.findIndex((p) => p.plugin.name === plugin.name);

	// copy, so that an emit in progress keeps iterating over the old list
	plugins = plugins.slice();

	if (index === -1) {
		plugins.push(entry);
	} else {
		plugins[index] = entry;
	}

	rebuild();

	return () => {
		const index = plugins.indexOf(entry);
		if (index === -1) return;

		plugins = plugins.slice();
		plugins.splice(index, 1);
		rebuild();
	};
}

/**
 * Call every listener of `event`. Callbacks run untracked, can't write state, and a throwing
 * plugin doesn't affect the app or other plugins.
 * @param {Exclude<keyof DevtoolsHooks, 'name'>} event
 * @param {any} [a]
 * @param {any} [b]
 */
export function emit(event, a, b) {
	const listeners = hooks[event];
	if (listeners === null) return;

	const previous_reaction = active_reaction;
	set_active_reaction(null);
	devtools_depth++;

	try {
		untrack(() => {
			for (const listener of listeners) {
				try {
					listener.fn.call(listener.plugin, a, b);
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error(`[svelte] devtools plugin "${listener.name}" threw in \`${event}\``, error);
				}
			}
		});
	} finally {
		devtools_depth--;
		set_active_reaction(previous_reaction);
	}
}

export function devtools_state_write() {
	throw new Error('Devtools plugins must not write state inside their callbacks');
}

/**
 * Announce a source through `signalCreated`, once
 * @param {Value} source
 * @param {string | undefined} label
 * @param {string | undefined} location
 * @param {object} [proxy] the proxy owning this source, if any
 * @param {PropertyKey} [key] the property of `proxy` this source belongs to (`undefined` for the version source)
 * @param {ComponentContext | null} [ctx] the component the source was declared in
 */
export function announce_signal(source, label, location, proxy, key, ctx = component_context) {
	if (announced.has(source)) return;
	announced.add(source);

	/** @type {SignalCreatedInfo['kind']} */
	var kind;

	if (proxy !== undefined) {
		kind = key === undefined ? 'proxy-version' : 'proxy-prop';
	} else if ((source.f & DERIVED) !== 0) {
		kind = 'derived';
	} else if ((source.f & ASYNC) !== 0) {
		kind = 'async-derived';
	} else {
		kind = 'state';
	}

	/** @type {SignalCreatedInfo} */
	var info = {
		kind,
		label,
		location,
		ctx: /** @type {any} */ (ctx),
		effect: /** @type {any} */ (active_effect)
	};

	if (proxy !== undefined) {
		info.proxy = proxy;
		info.key = key;
	}

	emit('signalCreated', source, info);
}

/**
 * @param {ComponentContext} ctx
 */
export function track_component(ctx) {
	var effect = ctx.r;
	if (effect === null) return;

	var list = component_effects.get(effect);

	if (list === undefined) {
		component_effects.set(effect, [ctx]);
	} else {
		list.push(ctx);
	}
}

/**
 * Called from `destroy_effect`: emit `componentDestroyed` for every component that was pushed
 * while `effect` was active. Children are reported before their parents
 * @param {Effect} effect
 */
export function destroy_components(effect) {
	var list = component_effects.get(effect);
	if (list === undefined) return;

	component_effects.delete(effect);

	for (var i = list.length - 1; i >= 0; i--) {
		emit('componentDestroyed', list[i]);
	}
}

/**
 * Called when `create_effect` elides `effect` from the tree. The effect will never be
 * destroyed, so we report it now, and move its components to the effect that replaces it
 * @param {Effect} effect
 * @param {Effect | null} replacement
 */
export function elide_effect(effect, replacement) {
	var list = component_effects.get(effect);

	if (list !== undefined) {
		if (replacement === null) {
			destroy_components(effect);
		} else {
			component_effects.delete(effect);

			var existing = component_effects.get(replacement);
			component_effects.set(replacement, existing === undefined ? list : existing.concat(list));
		}
	}

	if (hooks.effectDestroyed !== null) {
		emit_effect_destroyed(effect);
	}
}

/**
 * @param {Effect} effect
 */
export function emit_effect_destroyed(effect) {
	if (destroyed.has(effect)) return;
	destroyed.add(effect);
	emit('effectDestroyed', effect);
}
