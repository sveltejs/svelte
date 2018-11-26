export let current_component;

export function set_current_component(component) {
	current_component = component;
}

export function beforeUpdate(fn) {
	current_component.$$.before_render.push(fn);
}

export function onMount(fn) {
	current_component.$$.on_mount.push(fn);
}

export function afterUpdate(fn) {
	current_component.$$.after_render.push(fn);
}

export function onDestroy(fn) {
	current_component.$$.on_destroy.push(fn);
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

// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
export function bubble(component, event) {
	const callbacks = component.$$.callbacks[event.type];

	if (callbacks) {
		callbacks.slice().forEach(fn => fn(event));
	}
}