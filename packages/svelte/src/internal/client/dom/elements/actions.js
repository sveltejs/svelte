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
		var payload = untrack(() => action(dom, get_value?.()) || {});
		var update = payload?.update;

		if (get_value && update) {
			var inited = false;

			render_effect(() => {
				var value = get_value();
				deep_read_state(value);

				if (inited) {
					/** @type {Function} */ (update)(value);
				}
			});

			inited = true;
		}

		return payload?.destroy;
	});
}
