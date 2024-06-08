import { hydrating, set_hydrate_nodes } from '../hydration.js';
import { render_effect } from '../../reactivity/effects.js';

/**
 * @param {HTMLDivElement | SVGGElement} element
 * @param {() => Record<string, string>} get_styles
 * @returns {void}
 */
export function css_props(element, get_styles) {
	if (hydrating) {
		set_hydrate_nodes(
			/** @type {import('#client').TemplateNode[]} */ ([...element.childNodes]).slice(0, -1)
		);
	}

	render_effect(() => {
		render_effect(() => {
			var styles = get_styles();

			for (var key in styles) {
				var value = styles[key];

				if (value) {
					element.style.setProperty(key, value);
				} else {
					element.style.removeProperty(key);
				}
			}
		});

		return () => {
			// TODO use `teardown` instead of creating a nested effect, post-https://github.com/sveltejs/svelte/pull/11936
			element.remove();
		};
	});
}
