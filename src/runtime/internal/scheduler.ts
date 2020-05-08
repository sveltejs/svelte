import { set_current_component } from './lifecycle';
import { resolved_promise } from './environment';

const dirty_components = [];

let update_scheduled = false;
export const schedule_update = (component) => {
	dirty_components.push(component);
	if (!update_scheduled) (update_scheduled = true), resolved_promise.then(flush);
};
export const tick = () =>
	update_scheduled ? resolved_promise : ((update_scheduled = true), resolved_promise.then(flush));

export const binding_callbacks = [];
const render_callbacks = [];
const seen_callbacks = new Set();
export const add_render_callback = (fn) =>
	void (!seen_callbacks.has(fn) && (seen_callbacks.add(fn), render_callbacks.push(fn)));

const flush_callbacks = [];
export const add_flush_callback = (fn) => void flush_callbacks.push(fn);
const measure_callbacks = [];
export const add_measure_callback = (fn) => void measure_callbacks.push(fn);

let flushing = false;
export function flush() {
	if (flushing) return;
	else flushing = true;

	let i = 0,
		j = 0,
		$$,
		before_update,
		dirty;

	// RUN LOGIC, CANCEL STYLES
	do {
		// update components + beforeUpdate
		for (i = 0; i < dirty_components.length; i++) {
			({ $$ } = set_current_component(dirty_components[i]));
			if ($$.fragment === null) continue;
			$$.update();
			for (j = 0, { before_update } = $$; j < before_update.length; j++) before_update[j]();
			({ dirty } = $$);
			$$.dirty = [-1];
			if ($$.fragment) $$.fragment.p($$.ctx, dirty);
			render_callbacks.push(...$$.after_update);
		}
		dirty_components.length = 0;

		// update bindings in reverse order
		i = binding_callbacks.length;
		while (i--) binding_callbacks[i]();
		binding_callbacks.length = 0;

		// afterUpdate
		for (i = 0; i < render_callbacks.length; i++) render_callbacks[i]();
		render_callbacks.length = 0;
		seen_callbacks.clear();
	} while (dirty_components.length);

	update_scheduled = false;

	// STYLE MEASURE CHANGES
	for (i = 0; i < measure_callbacks.length; i++) flush_callbacks.push(measure_callbacks[i]());
	measure_callbacks.length = 0;

	// APPLY STYLE CHANGES
	for (i = 0; i < flush_callbacks.length; i++) flush_callbacks[i]();
	flush_callbacks.length = 0;

	flushing = false;
}
