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
 * The first time the callback runs will be before the initial `onMount`
 * 
 * https://svelte.dev/docs#run-time-svelte-beforeupdate
 */
export function beforeUpdate(fn: () => any) {
	get_current_component().$$.before_update.push(fn);
}

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM. 
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component; 
 * it can be called from an external module).
 * 
 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
 * 
 * https://svelte.dev/docs#run-time-svelte-onmount
 */
export function onMount(fn: () => any) {
	get_current_component().$$.on_mount.push(fn);
}

/**
 * Schedules a callback to run immediately after the component has been updated.
 * 
 * The first time the callback runs will be after the initial `onMount` 
 */
export function afterUpdate(fn: () => any) {
	get_current_component().$$.after_update.push(fn);
}

/** 
 * Schedules a callback to run immediately before the component is unmounted.
 * 
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the 
 * only one that runs inside a server-side component.
 * 
 * https://svelte.dev/docs#run-time-svelte-ondestroy
 */
export function onDestroy(fn: () => any) {
	get_current_component().$$.on_destroy.push(fn);
}

export interface DispatchOptions {
	cancelable?: boolean;
}

/**
 * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname). 
 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
 * 
 * Component events created with `createEventDispatcher` create a 
 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent). 
 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail) 
 * property and can contain any type of data. 
 * 
 * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
 */
export function createEventDispatcher<EventMap extends {} = any>(): <
	EventKey extends Extract<keyof EventMap, string>
>(
	type: EventKey,
	detail?: EventMap[EventKey],
	options?: DispatchOptions
) => boolean {
	const component = get_current_component();

	return (type: string, detail?: any, { cancelable = false } = {}): boolean => {
		const callbacks = component.$$.callbacks[type];

		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = custom_event(type, detail, { cancelable });
			callbacks.slice().forEach(fn => {
				fn.call(component, event);
			});
			return !event.defaultPrevented;
		}

		return true;
	};
}

/**
 * Associates an arbitrary `context` object with the current component and the specified `key` 
 * and returns that object. The context is then available to children of the component 
 * (including slotted content) with `getContext`.
 * 
 * Like lifecycle functions, this must be called during component initialisation. 
 * 
 * https://svelte.dev/docs#run-time-svelte-setcontext
 */
export function setContext<T>(key, context: T): T {
	get_current_component().$$.context.set(key, context);
	return context;
}

/**
 * Retrieves the context that belongs to the closest parent component with the specified `key`. 
 * Must be called during component initialisation. 
 * 
 * https://svelte.dev/docs#run-time-svelte-getcontext
 */
export function getContext<T>(key): T {
	return get_current_component().$$.context.get(key);
}

/**
 * Retrieves the whole context map that belongs to the closest parent component. 
 * Must be called during component initialisation. Useful, for example, if you 
 * programmatically create a component and want to pass the existing context to it.
 * 
 * https://svelte.dev/docs#run-time-svelte-getallcontexts
 */
export function getAllContexts<T extends Map<any, any> = Map<any, any>>(): T {
	return get_current_component().$$.context;
}

/**
 * Checks whether a given `key` has been set in the context of a parent component. 
 * Must be called during component initialisation. 
 * 
 * https://svelte.dev/docs#run-time-svelte-hascontext
 */
export function hasContext(key): boolean {
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
