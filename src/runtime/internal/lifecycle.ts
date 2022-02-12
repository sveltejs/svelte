import { custom_event } from './dom';

export let current_component;

export function set_current_component(component) {
	current_component = component;
}

export function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}
/**
 * Schedules a callback to run immediately before the component is updated after any state change.
 * 
 * > The first time the callback runs will be before the initial `onMount`
 * 
 * ```html
 * <script>
 * 	import { beforeUpdate } from 'svelte';
 * 
 * 	beforeUpdate(() => {
 * 		console.log('the component is about to update');
 * 	});
 * </script>
 * ```
 * 
 * @param fn callback
 */
export function beforeUpdate(fn: () => any) {
	get_current_component().$$.before_update.push(fn);
}
/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM. It must be called during the component's initialisation (but doesn't need to live *inside* the component; it can be called from an external module).
 * 
 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
 * 
 * ```html
 * <script>
 * 	import { onMount } from 'svelte';
 * 
 * 	onMount(() => {
 * 		console.log('the component has mounted');
 * 	});
 * </script>
 * ```
 * 
 * ---
 * 
 * If a function is returned from `onMount`, it will be called when the component is unmounted.
 * 
 * ```html
 * <script>
 * 	import { onMount } from 'svelte';
 * 
 * 	onMount(() => {
 * 		const interval = setInterval(() => {
 * 			console.log('beep');
 * 		}, 1000);
 * 
 * 		return () => clearInterval(interval);
 * 	});
 * </script>
 * ```
 * 
 * > This behaviour will only work when the function passed to `onMount` *synchronously* returns a value. `async` functions always return a `Promise`, and as such cannot *synchronously* return a function.
 * 
 * @param fn callback function
 */
export function onMount(fn: () => any | (() => any)) {
	get_current_component().$$.on_mount.push(fn);
}
/**
 * Schedules a callback to run immediately after the component has been updated.
 * 
 * > The first time the callback runs will be after the initial `onMount`
 * 
 * ```html
 * <script>
 * 	import { afterUpdate } from 'svelte';
 * 
 * 	afterUpdate(() => {
 * 		console.log('the component just updated');
 * 	});
 * </script>
 * ```
 * 
 * @param fn callback function
 */
export function afterUpdate(fn: () => any) {
	get_current_component().$$.after_update.push(fn);
}
/**
 * Schedules a callback to run immediately before the component is unmounted.
 * 
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the only one that runs inside a server-side component.
 * 
 * ```html
 * <script>
 * 	import { onDestroy } from 'svelte';
 * 
 * 	onDestroy(() => {
 * 		console.log('the component is being destroyed');
 * 	});
 * </script>
 * ```
 * 
 * @param fn callback function
 */
export function onDestroy(fn: () => any) {
	get_current_component().$$.on_destroy.push(fn);
}
/**
 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname). Event dispatchers are functions that can take two arguments: `name` and `detail`.
 * 
 * Component events created with `createEventDispatcher` create a [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent). These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture) and are not cancellable with `event.preventDefault()`. The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail) property and can contain any type of data.
 * 
 * ```html
 * <script>
 * 	import { createEventDispatcher } from 'svelte';
 * 
 * 	const dispatch = createEventDispatcher();
 * </script>
 * 
 * <button on:click="{() => dispatch('notify', 'detail value')}">Fire Event</button>
 * ```
 * 
 * ---
 * 
 * Events dispatched from child components can be listened to in their parent. Any data provided when the event was dispatched is available on the `detail` property of the event object.
 * 
 * ```html
 * <script>
 * 	function callbackFunction(event) {
 * 		console.log(`Notify fired! Detail: ${event.detail}`)
 * 	}
 * </script>
 * 
 * <Child on:notify="{callbackFunction}"/>
 * ```
 * 
 * @returns event dispatcher
 */
export function createEventDispatcher<
	EventMap extends {} = any
>(): <EventKey extends Extract<keyof EventMap, string>>(type: EventKey, detail?: EventMap[EventKey]) => void {
	const component = get_current_component();

	return (type: string, detail?: any) => {
		const callbacks = component.$$.callbacks[type];

		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = custom_event(type, detail);
			callbacks.slice().forEach(fn => {
				fn.call(component, event);
			});
		}
	};
}
/**
 * Associates an arbitrary `context` object with the current component and the specified `key`. The context is then available to children of the component (including slotted content) with `getContext`.
 * 
 * Like lifecycle functions, this must be called during component initialisation.
 * 
 * ```html
 * <script>
 * 	import { setContext } from 'svelte';
 * 
 * 	setContext('answer', 42);
 * </script>
 * ```
 * 
 * > Context is not inherently reactive. If you need reactive values in context then you can pass a store into context, which *will* be reactive.
 * 
 * @param key context key (Symbols are recommended)
 * @param context context value
 */
export function setContext<T>(key: any, context: T) {
	get_current_component().$$.context.set(key, context);
}
/**
 * Retrieves the context that belongs to the closest parent component with the specified `key`. Must be called during component initialisation.
 * 
 * ```html
 * <script>
 * 	import { getContext } from 'svelte';
 * 
 * 	const answer = getContext('answer');
 * </script>
 * ```
 * 
 * @param key context key (Symbols are recommended)
 * @returns context value
 */
export function getContext<T>(key: any): T {
	return get_current_component().$$.context.get(key);
}
/**
 * Retrieves the whole context map that belongs to the closest parent component. Must be called during component initialisation. Useful, for example, if you programmatically create a component and want to pass the existing context to it.
 * 
 * ```html
 * <script>
 * 	import { getAllContexts } from 'svelte';
 * 
 * 	const contexts = getAllContexts();
 * </script>
 * ```
 * 
 * @returns whole context map that belongs to the closest parent component
 */
export function getAllContexts<T extends Map<any, any> = Map<any, any>>(): T {
	return get_current_component().$$.context;
}
/**
 * Checks whether a given `key` has been set in the context of a parent component. Must be called during component initialisation.
 * 
 * ```html
 * <script>
 * 	import { hasContext } from 'svelte';
 * 
 * 	if (hasContext('answer')) {
 * 		// do something
 * 	}
 * </script>
 * ```
 * 
 * @param key context key (Symbols are recommended)
 * @returns boolean indicates whether the context has been set
 */
export function hasContext(key:any): boolean {
	return get_current_component().$$.context.has(key);
}

// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
export function bubble(component, event) {
	const callbacks = component.$$.callbacks[event.type];

	if (callbacks) {
		// @ts-ignore
		callbacks.slice().forEach(fn => fn.call(this, event));
	}
}
