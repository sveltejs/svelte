import { custom_event } from './dom';
import { dev$assert, SvelteComponentDev } from './dev';
import { SvelteComponent } from './Component';

export let current_component: SvelteComponentDev | SvelteComponent | null;

export const set_current_component = (component) => (current_component = component);

const dev$guard = (name: string) =>
	dev$assert(!!current_component, `${name} cannot be called outside of component initialization`);

export function get_current_component() {
	return current_component;
}

export function beforeUpdate(fn) {
	dev$guard(`beforeUpdate`);
	return current_component.$$.before_update.push(fn);
}

export function onMount(fn) {
	dev$guard(`onMount`);
	return current_component.$$.on_mount.push(fn);
}

export function afterUpdate(fn) {
	dev$guard(`afterUpdate`);
	return current_component.$$.after_update.push(fn);
}

export function onDestroy(fn) {
	dev$guard(`onDestroy`);
	return current_component.$$.on_destroy.push(fn);
}

export function createEventDispatcher() {
	dev$guard(`createEventDispatcher`);
	const component = current_component;
	return (type: string, detail?: any) => {
		const callbacks = component.$$.callbacks[type];
		if (!callbacks) return;
		// TODO are there situations where events could be dispatched
		// in a server (non-DOM) environment?
		const event = custom_event(type, detail);
		callbacks.forEach((fn) => {
			fn.call(component, event);
		});
	};
}

export function setContext(key, context) {
	dev$guard(`setContext`);
	current_component.$$.context.set(key, context);
}

export function getContext(key) {
	dev$guard(`getContext`);
	return current_component.$$.context.get(key);
}

// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
export function bubble(component, event) {
	const callbacks = component.$$.callbacks[event.type];

	if (callbacks) {
		callbacks.slice().forEach((fn) => fn(event));
	}
}
