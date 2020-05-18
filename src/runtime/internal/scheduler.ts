import { set_current_component } from './lifecycle';
import { resolved_promise, now } from 'svelte/environment';
import { T$$ } from './Component';

let update_scheduled = false;
let is_flushing = false;

// todo : remove binding_callbacks export
const dirty_components = [];
export const binding_callbacks = [];
const render_callbacks = [];
const measure_callbacks = [];
const flush_callbacks = [];

// todo : remove add_flush_callback
export const add_flush_callback = /*#__PURE__*/ Array.prototype.push.bind(flush_callbacks);
export const add_measure_callback = /*#__PURE__*/ Array.prototype.push.bind(measure_callbacks);

const seen_render_callbacks = new Set();
export const add_render_callback = (fn) => {
	if (!seen_render_callbacks.has(fn)) {
		seen_render_callbacks.add(fn);
		render_callbacks.push(fn);
	}
};
export const schedule_update = (component) => {
	dirty_components.push(component);
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
};
export const tick = () => {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
	return resolved_promise;
};
export const flush = () => {
	if (is_flushing) return;
	else is_flushing = true;

	let i = 0,
		j = 0,
		t = 0,
		$$: T$$,
		dirty,
		before_update,
		after_update;

	do {
		for (; i < dirty_components.length; i++) {
			({ $$ } = set_current_component(dirty_components[i]));

			// todo : is this check still necessary ?
			if (null === $$.fragment) continue;

			/* run reactive statements */
			$$.update();

			/* run beforeUpdate */
			for (j = 0, { before_update } = $$; j < before_update.length; j++) {
				before_update[j]();
			}

			/* update blocks */
			({ dirty } = $$).dirty = [-1];
			if (false !== $$.fragment) $$.fragment.p($$.ctx, dirty);

			/* schedule afterUpdate */
			for (j = 0, { after_update } = $$; j < after_update.length; j++) {
				add_render_callback(after_update[j]);
			}
		}
		dirty_components.length = 0;

		// update bindings [ ...in reverse order (#3145) ]
		i = binding_callbacks.length;
		while (i--) binding_callbacks[i]();
		binding_callbacks.length = i = 0;

		// run afterUpdates
		// todo : remove every non afterUpdate callback from render_callbacks
		for (; i < render_callbacks.length; i++) render_callbacks[i]();
		render_callbacks.length = i = 0;
	} while (dirty_components.length);
	seen_render_callbacks.clear();
	update_scheduled = false;

	// measurement callbacks for animations
	for (i = 0, j = flush_callbacks.length; i < measure_callbacks.length; i++) {
		flush_callbacks[j++] = measure_callbacks[i]();
	}
	measure_callbacks.length = i = 0;

	// apply styles
	// todo : remove every non style callback from flush_callbacks
	for (t = now(); i < j; i++) flush_callbacks[i](t);
	flush_callbacks.length = i = j = 0;

	is_flushing = false;
};
