let current_component;

export function set_current_component(component) {
	current_component = component;
}

export function beforeRender(fn) {
	current_component.$$beforeRender.push(fn);
}

export function onMount(fn) {
	current_component.$$onMount.push(fn);
}

export function afterRender(fn) {
	current_component.$$afterRender.push(fn);
}

export function onDestroy(fn) {
	current_component.$$onDestroy.push(fn);
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