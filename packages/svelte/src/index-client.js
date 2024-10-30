/** @import { ComponentContext, ComponentContextLegacy } from '#client' */
/** @import { EventDispatcher } from './index.js' */
/** @import { NotFunction } from './internal/types.js' */
import { component_context, flush_sync, untrack } from './internal/client/runtime.js';
import { is_array } from './internal/shared/utils.js';
import { user_effect } from './internal/client/index.js';
import * as e from './internal/client/errors.js';
import { lifecycle_outside_component } from './internal/shared/errors.js';

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside [server-side components](https://svelte.dev/docs/svelte/svelte-server#render).
 *
 * @template T
 * @param {() => NotFunction<T> | Promise<NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
export function onMount(fn) {
	if (component_context === null) {
		lifecycle_outside_component('onMount');
	}

	if (component_context.l !== null) {
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
		lifecycle_outside_component('onDestroy');
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
 *  loaded: never; // does not take a detail argument
 *  change: string; // takes a detail argument of type string, which is required
 *  optional: number | null; // takes an optional detail argument of type number
 * }>();
 * ```
 *
 * @deprecated Use callback props and/or the `$host()` rune instead — see https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes-Component-events
 * @template {Record<string, any>} [EventMap = any]
 * @returns {EventDispatcher<EventMap>}
 */
export function createEventDispatcher() {
	const active_component_context = component_context;
	if (active_component_context === null) {
		lifecycle_outside_component('createEventDispatcher');
	}

	return (type, detail, options) => {
		const events = /** @type {Record<string, Function | Function[]>} */ (
			active_component_context.s.$$events
		)?.[/** @type {any} */ (type)];

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
 * @deprecated Use `$effect.pre` instead — see https://svelte.dev/docs/svelte/$effect#$effect.pre
 * @param {() => void} fn
 * @returns {void}
 */
export function beforeUpdate(fn) {
	if (component_context === null) {
		lifecycle_outside_component('beforeUpdate');
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
 * @deprecated Use `$effect` instead — see https://svelte.dev/docs/svelte/$effect
 * @param {() => void} fn
 * @returns {void}
 */
export function afterUpdate(fn) {
	if (component_context === null) {
		lifecycle_outside_component('afterUpdate');
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

/**
 * Synchronously flushes any pending state changes and those that result from it.
 * @param {() => void} [fn]
 * @returns {void}
 */
export function flushSync(fn) {
	flush_sync(fn);
}

export { hydrate, mount, unmount } from './internal/client/render.js';

export {
	getContext,
	getAllContexts,
	hasContext,
	setContext,
	tick,
	untrack
} from './internal/client/runtime.js';

export { createRawSnippet } from './internal/client/dom/blocks/snippet.js';
