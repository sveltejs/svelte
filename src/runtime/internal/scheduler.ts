import { set_current_component } from './lifecycle';
import { resolved_promise } from './environment';

const dirty_components = [];

let update_scheduled = false;
export function schedule_update(component) {
	dirty_components.push(component);
	if (!update_scheduled) (update_scheduled = true), resolved_promise.then(flush);
}
export function tick() {
	if (!update_scheduled) (update_scheduled = true), resolved_promise.then(flush);
	return resolved_promise;
}
export const binding_callbacks = [];
const render_callbacks = [];
const seen_callbacks = new Set();
export const add_render_callback = (fn) =>
	void (!seen_callbacks.has(fn) && (seen_callbacks.add(fn), render_callbacks.push(fn)));

const flush_callbacks = [];
export const add_flush_callback = (fn) => void flush_callbacks.push(fn);

let flushing = false;
export function flush() {
	if (flushing) return;
	else flushing = true;

	for (; dirty_components.length; ) {
		// update components + beforeUpdate
		for (let i = 0, $$; i < dirty_components.length; i++) {
			({ $$ } = set_current_component(dirty_components[i]));
			if ($$.fragment === null) continue;
			const { update, before_update, dirty, after_update } = $$;
			update();
			for (let j = 0; j < before_update.length; j++) before_update[j]();
			$$.dirty = [-1];
			if ($$.fragment) $$.fragment.p($$.ctx, dirty);
			render_callbacks.push(...after_update);
		}
		dirty_components.length = 0;

		// update bindings in reverse order
		for (let i = binding_callbacks.length - 1; i >= 0; i--) binding_callbacks[i]();
		binding_callbacks.length = 0;

		// afterUpdate
		for (let i = 0; i < render_callbacks.length; i++) render_callbacks[i]();
		render_callbacks.length = 0;
		seen_callbacks.clear();
	}

	for (let i = 0; i < flush_callbacks.length; i++) flush_callbacks[i]();
	flush_callbacks.length = 0;

	update_scheduled = flushing = false;
}