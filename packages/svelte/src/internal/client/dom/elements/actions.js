import { DelegatedEvents } from '../../../../constants.js';
import { effect, render_effect } from '../../reactivity/effects.js';
import { deep_read_state, untrack } from '../../runtime.js';

/**
 * @template P
 * @param {Element} dom
 * @param {(dom: Element, value?: P) => import('#client').ActionPayload<P>} action
 * @param {() => P} [get_value]
 * @returns {void}
 */
export function action(dom, action, get_value) {
	effect(() => {
		var addEventListener = dom.addEventListener;
		var removeEventListener = dom.removeEventListener;

		/**
		 * @param {string} event_name
		 * @param {EventListenerOrEventListenerObject} listener
		 * @param {AddEventListenerOptions} options
		 */
		dom.addEventListener = function (event_name, listener, options) {
			var delegated =
				DelegatedEvents.includes(event_name) && !options?.capture && typeof listener === 'function';

			if (delegated) {
				var event_key = `__${event_name}`;
				// @ts-ignore
				var existing = dom[event_key];
				if (existing != null) {
					if (!Array.isArray(existing)) {
						// @ts-ignore
						dom[event_key] = [existing];
					}
					existing.push(listener);
				} else {
					// @ts-ignore
					dom[event_key] = listener;
				}
			} else {
				addEventListener.call(dom, event_name, listener, options);
			}
		};

		/**
		 * @param {string} event_name
		 * @param {EventListenerOrEventListenerObject} listener
		 * @param {AddEventListenerOptions} options
		 */
		dom.removeEventListener = function (event_name, listener, options) {
			var delegated =
				DelegatedEvents.includes(event_name) && !options?.capture && typeof listener === 'function';

			if (delegated) {
				var event_key = `__${event_name}`;
				// @ts-ignore
				var existing = dom[event_key];
				if (existing != null) {
					if (Array.isArray(existing)) {
						var index = existing.indexOf(listener);
						if (index !== -1) {
							existing.splice(index, 1);
						}
					} else {
						// @ts-ignore
						dom[event_key] = null;
					}
				}
			} else {
				removeEventListener.call(dom, event_name, listener, options);
			}
		};

		var payload = untrack(() => action(dom, get_value?.()) || {});

		if (get_value && payload?.update) {
			var inited = false;

			render_effect(() => {
				var value = get_value();

				// Action's update method is coarse-grained, i.e. when anything in the passed value changes, update.
				// This works in legacy mode because of mutable_source being updated as a whole, but when using $state
				// together with actions and mutation, it wouldn't notice the change without a deep read.
				deep_read_state(value);

				if (inited) {
					/** @type {Function} */ (payload.update)(value);
				}
			});

			inited = true;
		}

		if (payload?.destroy) {
			return () => /** @type {Function} */ (payload.destroy)();
		}
	});
}
