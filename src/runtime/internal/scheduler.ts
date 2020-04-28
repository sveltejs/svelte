import { run_all } from './utils';
import { set_current_component } from './lifecycle';

export const dirty_components = [];
export const intros = { enabled: false };

export const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];

const resolved_promise = Promise.resolve();
let update_scheduled = false;

export function schedule_update() {
	if (update_scheduled) return;
	update_scheduled = true;
	resolved_promise.then(flush);
}

export function tick() {
	schedule_update();
	return resolved_promise;
}

export function add_render_callback(fn) {
	render_callbacks.push(fn);
}

export function add_flush_callback(fn) {
	flush_callbacks.push(fn);
}

let flushing = false;
const seen_callbacks = new Set();
export function flush() {
	if (flushing) return;
	flushing = true;

	do {
		// update components + beforeUpdate
		for (let i = 0, component; i < dirty_components.length; i++) {
			set_current_component((component = dirty_components[i]));
			update(component.$$);
		}
		dirty_components.length = 0;

		// update bindings
		for (let i = 0; i < binding_callbacks.length; i++) {
			binding_callbacks[i]();
		}
		binding_callbacks.length = 0;

		// afterUpdate
		for (let i = 0, callback; i < render_callbacks.length; i++) {
			if (seen_callbacks.has((callback = render_callbacks[i]))) continue;
			seen_callbacks.add(callback);
			callback();
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);

	for (let i = 0; i < flush_callbacks.length; i++) {
		flush_callbacks[i]();
	}
	flush_callbacks.length = 0;

	update_scheduled = false;
	flushing = false;
	seen_callbacks.clear();
}

function update($$) {
	if ($$.fragment === null) return;
	$$.update();
	run_all($$.before_update);
	const dirty = $$.dirty;
	$$.dirty = [-1];
	$$.fragment && $$.fragment.p($$.ctx, dirty);
	$$.after_update.forEach(add_render_callback);
}
