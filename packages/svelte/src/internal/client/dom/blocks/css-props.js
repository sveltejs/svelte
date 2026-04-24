import { render_effect } from '../../reactivity/effects.js';
import { hydrating, set_hydrate_node } from '../hydration.js';
import { get_first_child, style_set_property, style_remove_property } from '../operations.js';

/**
 * @param {HTMLDivElement | SVGGElement} element
 * @param {() => Record<string, string>} get_styles
 * @returns {void}
 */
export function css_props(element, get_styles) {
	if (hydrating) {
		set_hydrate_node(get_first_child(element));
	}

	render_effect(() => {
		var styles = get_styles();

		for (var key in styles) {
			var value = styles[key];

			if (value) {
				style_set_property(/** @type {HTMLElement} */ (element), key, value);
			} else {
				style_remove_property(/** @type {HTMLElement} */ (element), key);
			}
		}
	});
}
