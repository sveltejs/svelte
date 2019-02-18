export let current_component;

export function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error(`Function called outside component initialization`);
	return current_component;
}

export function beforeUpdate(fn) {
	get_current_component().$$.before_render.push(fn);
}

export function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

export function afterUpdate(fn) {
	get_current_component().$$.after_render.push(fn);
}

export function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

export function createEventDispatcher() {
	const component = current_component;

	return (type, detail) => {
		const callbacks = component.$$.callbacks[type];

		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = new window.CustomEvent(type, { detail });
			callbacks.slice().forEach(fn => {
				fn.call(component, event);
			});
		}
	};
}

export function setContext(key, context) {
	get_current_component().$$.context.set(key, context);
}

export function getContext(key) {
	return get_current_component().$$.context.get(key);
}

// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
export function bubble(component, event) {
	const callbacks = component.$$.callbacks[event.type];

	if (callbacks) {
		callbacks.slice().forEach(fn => fn(event));
	}
}