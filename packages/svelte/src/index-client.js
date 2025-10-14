/** @import { ComponentContext, ComponentContextLegacy } from '#client' */
/** @import { EventDispatcher } from './index.js' */
/** @import { NotFunction } from './internal/types.js' */
import { active_reaction, untrack } from './internal/client/runtime.js';
import { is_array } from './internal/shared/utils.js';
import { user_effect } from './internal/client/index.js';
import * as e from './internal/client/errors.js';
import { legacy_mode_flag } from './internal/flags/index.js';
import { component_context } from './internal/client/context.js';
import { DEV } from 'esm-env';

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
 * Returns an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that aborts when the current [derived](https://svelte.dev/docs/svelte/$derived) or [effect](https://svelte.dev/docs/svelte/$effect) re-runs or is destroyed.
 *
 * Must be called while a derived or effect is running.
 *
 * ```svelte
 * <script>
 * 	import { getAbortSignal } from 'svelte';
 *
 * 	let { id } = $props();
 *
 * 	async function getData(id) {
 * 		const response = await fetch(`/items/${id}`, {
 * 			signal: getAbortSignal()
 * 		});
 *
 * 		return await response.json();
 * 	}
 *
 * 	const data = $derived(await getData(id));
 * </script>
 * ```
 */
export function getAbortSignal() {
	if (active_reaction === null) {
		e.get_abort_signal_outside_reaction();
	}

	return (active_reaction.ac ??= new AbortController()).signal;
}

/**
 * `onMount`, like [`$effect`](https://svelte.dev/docs/svelte/$effect), schedules a function to run as soon as the component has been mounted to the DOM.
 * Unlike `$effect`, the provided function only runs once.
 *
 * It must be called during the component's initialisation (but doesn't need to live _inside_ the component;
 * it can be called from an external module). If a function is returned _synchronously_ from `onMount`,
 * it will be called when the component is unmounted.
 *
 * `onMount` functions do not run during [server-side rendering](https://svelte.dev/docs/svelte/svelte-server#render).
 *
 * @template T
 * @param {() => NotFunction<T> | Promise<NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
export function onMount(fn) {
	if (component_context === null) {
		e.lifecycle_outside_component('onMount');
	}

	if (legacy_mode_flag && component_context.l !== null) {
		init_update_callbacks(component_context).m.push(fn);
	} else {
		user_effect(() => {
			const cleanup = untrack(fn);
			if (typeof cleanup === 'function') return /** @type {() => void} */ (cleanup);
		});
	}
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * @param {() => any} fn
 * @returns {void}
 */
export function onDestroy(fn) {
	if (component_context === null) {
		e.lifecycle_outside_component('onDestroy');
	}

	onMount(() => () => untrack(fn));
}

/**
 * @template [T=any]
 * @param {string} type
 * @param {T} [detail]
 * @param {any}params_0
 * @returns {CustomEvent<T>}
 */
function create_custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
	return new CustomEvent(type, { detail, bubbles, cancelable });
}

/**
 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs/svelte/legacy-on#Component-events).
 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
 *
 * Component events created with `createEventDispatcher` create a
 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
 * property and can contain any type of data.
 *
 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
 * ```ts
 * const dispatch = createEventDispatcher<{
 *  loaded: null; // does not take a detail argument
 *  change: string; // takes a detail argument of type string, which is required
 *  optional: number | null; // takes an optional detail argument of type number
 * }>();
 * ```
 *
 * @deprecated Use callback props and/or the `$host()` rune instead — see [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes-Component-events)
 * @template {Record<string, any>} [EventMap = any]
 * @returns {EventDispatcher<EventMap>}
 */
export function createEventDispatcher() {
	const active_component_context = component_context;
	if (active_component_context === null) {
		e.lifecycle_outside_component('createEventDispatcher');
	}

	/**
	 * @param [detail]
	 * @param [options]
	 */
	return (type, detail, options) => {
		const events = /** @type {Record<string, Function | Function[]>} */ (
			active_component_context.s.$$events
		)?.[/** @type {string} */ (type)];

		if (events) {
			const callbacks = is_array(events) ? events.slice() : [events];
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = create_custom_event(/** @type {string} */ (type), detail, options);
			for (const fn of callbacks) {
				fn.call(active_component_context.x, event);
			}
			return !event.defaultPrevented;
		}

		return true;
	};
}

// TODO mark beforeUpdate and afterUpdate as deprecated in Svelte 6

/**
 * Schedules a callback to run immediately before the component is updated after any state change.
 *
 * The first time the callback runs will be before the initial `onMount`.
 *
 * In runes mode use `$effect.pre` instead.
 *
 * @deprecated Use [`$effect.pre`](https://svelte.dev/docs/svelte/$effect#$effect.pre) instead
 * @param {() => void} fn
 * @returns {void}
 */
export function beforeUpdate(fn) {
	if (component_context === null) {
		e.lifecycle_outside_component('beforeUpdate');
	}

	if (component_context.l === null) {
		e.lifecycle_legacy_only('beforeUpdate');
	}

	init_update_callbacks(component_context).b.push(fn);
}

/**
 * Schedules a callback to run immediately after the component has been updated.
 *
 * The first time the callback runs will be after the initial `onMount`.
 *
 * In runes mode use `$effect` instead.
 *
 * @deprecated Use [`$effect`](https://svelte.dev/docs/svelte/$effect) instead
 * @param {() => void} fn
 * @returns {void}
 */
export function afterUpdate(fn) {
	if (component_context === null) {
		e.lifecycle_outside_component('afterUpdate');
	}

	if (component_context.l === null) {
		e.lifecycle_legacy_only('afterUpdate');
	}

	init_update_callbacks(component_context).a.push(fn);
}

/**
 * Legacy-mode: Init callbacks object for onMount/beforeUpdate/afterUpdate
 * @param {ComponentContext} context
 */
function init_update_callbacks(context) {
	var l = /** @type {ComponentContextLegacy} */ (context).l;
	return (l.u ??= { a: [], b: [], m: [] });
}

export { flushSync } from './internal/client/reactivity/batch.js';
export {
	createContext,
	getContext,
	getAllContexts,
	hasContext,
	setContext
} from './internal/client/context.js';
export { hydrate, mount, unmount } from './internal/client/render.js';
export { tick, untrack, settled } from './internal/client/runtime.js';
export { createRawSnippet } from './internal/client/dom/blocks/snippet.js';
