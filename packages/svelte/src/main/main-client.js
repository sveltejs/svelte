import {
	current_component_context,
	destroy_signal,
	get_or_init_context_map,
	is_ssr,
	managed_effect,
	untrack,
	user_effect,
	flush_local_render_effects
} from '../internal/client/runtime.js';
import { is_array } from '../internal/client/utils.js';

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs/svelte#onmount
 * @template T
 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
export function onMount(fn) {
	if (!is_ssr) {
		user_effect(() => {
			const result = untrack(fn);
			if (typeof result === 'function') {
				return /** @type {() => any} */ (result);
			}
		});
	}
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
	return /** @type {T} */ (context_map.get(key));
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
	return /** @type {T} */ (context_map);
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
 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname).
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
 * https://svelte.dev/docs/svelte#createeventdispatcher
 * @template {Record<string, any>} [EventMap = any]
 * @returns {import('./public.js').EventDispatcher<EventMap>}
 */
export function createEventDispatcher() {
	const component_context = current_component_context;
	if (component_context === null) {
		throw new Error('createEventDispatcher can only be used during component initialisation.');
	}

	return (type, detail, options) => {
		const events = /** @type {Record<string, Function | Function[]>} */ (
			component_context.s.$$events
		)?.[/** @type {any} */ (type)];

		if (events) {
			const callbacks = is_array(events) ? events.slice() : [events];
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = create_custom_event(/** @type {string} */ (type), detail, options);
			for (const fn of callbacks) {
				fn.call(component_context.a, event);
			}
			return !event.defaultPrevented;
		}

		return true;
	};
}

function init_update_callbacks() {
	let called_before = false;
	let called_after = false;

	/** @type {NonNullable<import('../internal/client/types.js').ComponentContext['u']>} */
	const update_callbacks = {
		b: [],
		a: [],
		e() {
			if (!called_before) {
				called_before = true;
				// TODO somehow beforeUpdate ran twice on mount in Svelte 4 if it causes a render
				// possibly strategy to get this back if needed: analyse beforeUpdate function for assignements to state,
				// if yes, add a call to the component to force-run beforeUpdate once.
				untrack(() => update_callbacks.b.forEach(/** @param {any} c */ (c) => c()));
				flush_local_render_effects();
				// beforeUpdate can run again once if afterUpdate causes another update,
				// but afterUpdate shouldn't be called again in that case to prevent infinite loops
				if (!called_after) {
					user_effect(() => {
						called_before = false;
						called_after = true;
						untrack(() => update_callbacks.a.forEach(/** @param {any} c */ (c) => c()));
						// managed_effect so that it's not cleaned up when the parent effect is cleaned up
						const managed = managed_effect(() => {
							destroy_signal(managed);
							called_after = false;
						});
					});
				} else {
					user_effect(() => {
						called_before = false;
					});
				}
			}
		}
	};
	return update_callbacks;
}

// TODO mark beforeUpdate and afterUpdate as deprecated in Svelte 6

/**
 * Schedules a callback to run immediately before the component is updated after any state change.
 *
 * The first time the callback runs will be before the initial `onMount`.
 *
 * In runes mode use `$effect.pre` instead.
 *
 * https://svelte.dev/docs/svelte#beforeupdate
 * @deprecated Use `$effect.pre` instead — see https://svelte-5-preview.vercel.app/docs/deprecations#beforeupdate-and-afterupdate
 * @param {() => void} fn
 * @returns {void}
 */
export function beforeUpdate(fn) {
	const component_context = current_component_context;
	if (component_context === null) {
		throw new Error('beforeUpdate can only be used during component initialisation.');
	}

	(component_context.u ??= init_update_callbacks()).b.push(fn);
}

/**
 * Schedules a callback to run immediately after the component has been updated.
 *
 * The first time the callback runs will be after the initial `onMount`.
 *
 * In runes mode use `$effect` instead.
 *
 * https://svelte.dev/docs/svelte#afterupdate
 * @deprecated Use `$effect` instead — see https://svelte-5-preview.vercel.app/docs/deprecations#beforeupdate-and-afterupdate
 * @param {() => void} fn
 * @returns {void}
 */
export function afterUpdate(fn) {
	const component_context = current_component_context;
	if (component_context === null) {
		throw new Error('afterUpdate can only be used during component initialisation.');
	}

	(component_context.u ??= init_update_callbacks()).a.push(fn);
}

// TODO bring implementations in here
// (except probably untrack — do we want to expose that, if there's also a rune?)
export {
	flushSync,
	createRoot,
	mount,
	tick,
	untrack,
	unstate,
	onDestroy
} from '../internal/index.js';
