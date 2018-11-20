let update_scheduled = false;

const dirty_components = [];
const after_update_callbacks = [];

export const intro = { enabled: false };

export function schedule_update(component) {
	dirty_components.push(component);
	if (!update_scheduled) {
		update_scheduled = true;
		queue_microtask(flush);
	}
}

export function after_update(fn) {
	after_update_callbacks.push(fn);
}

export function flush() {
	while (dirty_components.length) {
		dirty_components.pop().$$update();
	}

	while (after_update_callbacks.length) {
		after_update_callbacks.shift()();
	}

	update_scheduled = false;
}

function queue_microtask(callback) {
	Promise.resolve().then(callback);
}