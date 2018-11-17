let current_component;

export function set_current_component(component) {
	current_component = component;
}

export function onprops(fn) {
	current_component.$$onprops.push(fn);
}

export function onmount(fn) {
	current_component.$$onmount.push(fn);
}

export function onupdate(fn) {
	current_component.$$onupdate.push(fn);
}

export function ondestroy(fn) {
	current_component.$$ondestroy.push(fn);
}

export function createEventDispatcher() {
	const component = current_component;

	return (type, detail) => {
		const callbacks = component.$$callbacks[type];

		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = new window.CustomEvent(type, { detail });
			callbacks.slice().forEach(fn => fn(event));
		}
	};
}