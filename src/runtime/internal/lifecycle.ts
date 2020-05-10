import { custom_event } from './dom';
import { SvelteComponentDev } from './dev.utils';
import { SvelteComponent } from './Component';
import { dev$assert } from './dev.tools';

export let current_component: SvelteComponentDev | SvelteComponent | null;

export const set_current_component = (component) => (current_component = component);

const dev$on_init_only = (name: string) =>
	dev$assert(!!current_component, `${name} cannot be called outside of component initialization`);

export function get_current_component() {
	return current_component;
}

export function beforeUpdate(fn) {
	dev$on_init_only(`beforeUpdate`);
	return current_component.$$.before_update.push(fn);
}

export function onMount(fn) {
	dev$on_init_only(`onMount`);
	return current_component.$$.on_mount.push(fn);
}

export function afterUpdate(fn) {
	dev$on_init_only(`afterUpdate`);
	return current_component.$$.after_update.push(fn);
}

export function onDestroy(fn) {
	dev$on_init_only(`onDestroy`);
	return current_component.$$.on_destroy.push(fn);
}
// todo : deprecate
export function createEventDispatcher() {
	dev$on_init_only(`createEventDispatcher`);
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
	dev$on_init_only(`setContext`);
	current_component.$$.context.set(key, context);
}

export function getContext(key) {
	dev$on_init_only(`getContext`);
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
