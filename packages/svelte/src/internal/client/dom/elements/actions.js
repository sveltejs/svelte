import { effect } from '../../reactivity/effects.js';
import { deep_read_state, untrack } from '../../runtime.js';

/**
 * @template P
 * @param {Element} dom
 * @param {(dom: Element, value?: P) => import('#client').ActionPayload<P>} action
 * @param {() => P} [value_fn]
 * @returns {void}
 */
export function action(dom, action, value_fn) {
	/** @type {undefined | import('#client').ActionPayload<P>} */
	var payload = undefined;
	var needs_deep_read = false;

	// Action could come from a prop, therefore could be a signal, therefore untrack
	// TODO we could take advantage of this and enable https://github.com/sveltejs/svelte/issues/6942
	effect(() => {
		if (value_fn) {
			var value = value_fn();
			untrack(() => {
				if (payload === undefined) {
					payload = action(dom, value) || {};
					needs_deep_read = !!payload?.update;
				} else {
					var update = payload.update;
					if (typeof update === 'function') {
						update(value);
					}
				}
			});
			// Action's update method is coarse-grained, i.e. when anything in the passed value changes, update.
			// This works in legacy mode because of mutable_source being updated as a whole, but when using $state
			// together with actions and mutation, it wouldn't notice the change without a deep read.
			if (needs_deep_read) {
				deep_read_state(value);
			}
		} else {
			untrack(() => (payload = action(dom)));
		}
	});

	effect(() => {
		if (payload !== undefined) {
			var destroy = payload.destroy;
			if (typeof destroy === 'function') {
				return () => {
					/** @type {Function} */ (destroy)();
				};
			}
		}
	});
}
