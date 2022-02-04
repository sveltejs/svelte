import { custom_event } from './dom';

export let current_component;

export function set_current_component(component) {
	current_component = component;
}

export function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

export function beforeUpdate(fn: () => any) {
	get_current_component().$$.before_update.push(fn);
}

export function onMount(fn: () => any) {
	get_current_component().$$.on_mount.push(fn);
}

export function afterUpdate(fn: () => any) {
	get_current_component().$$.after_update.push(fn);
}

export function onDestroy(fn: () => any) {
	get_current_component().$$.on_destroy.push(fn);
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
	? I
	: never

type ExtractObjectValues<Object extends Record<any, any>> = Object[keyof Object]

type ConstructDispatchFunction<EventMap extends Record<string, any>, EventKey extends keyof EventMap> =
	EventMap[EventKey] extends never
	? (type: EventKey) => void
	: undefined extends EventMap[EventKey]
	? (type: EventKey, detail?: EventMap[EventKey]) => void
	: (type: EventKey, detail: EventMap[EventKey]) => void

type CreateDispatchFunctionMap<EventMap> = {
	[Key in keyof EventMap]: ConstructDispatchFunction<EventMap, Key>
}

type EventDispatcher<EventMap extends Record<string, any>> = UnionToIntersection<ExtractObjectValues<CreateDispatchFunctionMap<EventMap>>>

export function createEventDispatcher<
	EventMap extends Record<string, any> = any
>(): EventDispatcher<EventMap> {
	const component = get_current_component();

	return ((type: string, detail?: any) => {
		const callbacks = component.$$.callbacks[type];

		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = custom_event(type, detail);
			callbacks.slice().forEach(fn => {
				fn.call(component, event);
			});
		}
	}) as EventDispatcher<EventMap>;
}

export function setContext<T>(key, context: T) {
	get_current_component().$$.context.set(key, context);
}

export function getContext<T>(key): T {
	return get_current_component().$$.context.get(key);
}

export function getAllContexts<T extends Map<any, any> = Map<any, any>>(): T {
	return get_current_component().$$.context;
}

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
