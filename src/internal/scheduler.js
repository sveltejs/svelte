let update_scheduled = false;

const dirty_components = [];

export function schedule_update(component) {
	dirty_components.push(component);
	if (!update_scheduled) {
		update_scheduled = true;
		queueMicrotask(flush);
	}
}

export function flush() {
	while (dirty_components.length) {
		dirty_components.pop().__update();
	}

	update_scheduled = false;
}

function queueMicrotask(callback) {
	Promise.resolve().then(callback);
}