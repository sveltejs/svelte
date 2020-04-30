import { set_current_component } from './lifecycle';

const dirty_components = [];

const resolved_promise = Promise.resolve();

let update_scheduled = false;
export function schedule_update(component) {
	dirty_components.push(component);
	if (update_scheduled) return;
	(update_scheduled = true), resolved_promise.then(flush);
}
export function tick() {
	if (!update_scheduled) (update_scheduled = true), resolved_promise.then(flush);
	return resolved_promise;
}
export const binding_callbacks = [];
const render_callbacks = [];
export const add_render_callback = (fn) => render_callbacks.push(fn);

const flush_callbacks = [];
export const add_flush_callback = (fn) => flush_callbacks.push(fn);

let flushing = false;
const seen_callbacks = new Set();
export function flush() {
	if (flushing) return;
	flushing = true;

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
		for (let i = binding_callbacks.length - 1; i; i--) binding_callbacks[i]();
		binding_callbacks.length = 0;

		// afterUpdate
		for (let i = 0, callback; i < render_callbacks.length; i++) {
			if (seen_callbacks.has((callback = render_callbacks[i]))) continue;
			seen_callbacks.add(callback), callback();
		}
		render_callbacks.length = 0;
	}

	for (let i = 0; i < flush_callbacks.length; i++) flush_callbacks[i]();
	flush_callbacks.length = 0;

	seen_callbacks.clear();
	update_scheduled = false;
	flushing = false;
}
