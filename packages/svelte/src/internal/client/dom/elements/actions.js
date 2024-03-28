import { effect } from '../../reactivity/effects.js';
import { source } from '../../reactivity/sources.js';
import { deep_read_state, get, untrack, update } from '../../runtime.js';

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
	var version = source(0);
	/**
	 * @type {P}
	 */
	var value;
	var init = false;

	// The value needs to be calculated independent of the action body, as we only want to evaluate
	// the payload of the action once – not when the value changes.
	effect(() => {
		get(version);
		if (value_fn) {
			value = value_fn();
		}
		if (payload !== undefined) {
			var update = payload.update;
			if (typeof update === 'function') {
				update(value);
			}
		}
	});

	// Action could come from a prop, therefore could be a signal, therefore untrack
	// TODO we could take advantage of this and enable https://github.com/sveltejs/svelte/issues/6942
	effect(() => {
		untrack(() => {
			if (value_fn) {
				if (payload === undefined) {
					payload = action(dom, value) || {};
					if (payload?.update) {
						// Action's update method is coarse-grained, i.e. when anything in the passed value changes, update.
						// This works in legacy mode because of mutable_source being updated as a whole, but when using $state
						// together with actions and mutation, it wouldn't notice the change without a deep read.
						effect(() => {
							deep_read_state(value);
							if (init) {
								untrack(() => {
									update(version, 1);
								});
							}
							init = true;
						});
					}
				}
			} else {
				payload = action(dom);
			}
		});
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
