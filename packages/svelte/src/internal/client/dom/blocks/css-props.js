import { render_effect } from '../../reactivity/effects.js';
import { hydrating, set_hydrate_node } from '../hydration.js';
import {
	get_attribute,
	get_first_child,
	remove_attribute,
	set_css_text,
	style_set_property,
	style_remove_property
} from '../operations.js';
import { to_style } from '../../../shared/attributes.js';
import { custom_renderers_flag } from '../../../flags/index.js';
import { current_renderer } from '../../custom-renderer/state.js';

/**
 * @param {HTMLDivElement | SVGGElement} element
 * @param {() => Record<string, string>} get_styles
 * @returns {void}
 */
export function css_props(element, get_styles) {
	if (hydrating) {
		set_hydrate_node(get_first_child(element));
	}

	if (custom_renderers_flag && current_renderer !== null) {
		// custom renderers only deal in attributes, so set the whole `style` attribute: the
		// wrapper's own styles, followed by the custom properties
		var base = get_attribute(element, 'style');

		render_effect(() => {
			var style = to_style(base, get_styles());

			if (style === null) {
				remove_attribute(element, 'style');
			} else {
				set_css_text(/** @type {HTMLElement} */ (element), style);
			}
		});

		return;
	}

	render_effect(() => {
		var styles = get_styles();

		for (var key in styles) {
			var value = styles[key];

			if (value == null || value === '') {
				style_remove_property(/** @type {HTMLElement} */ (element), key);
			} else {
				style_set_property(/** @type {HTMLElement} */ (element), key, value);
			}
		}
	});
}
