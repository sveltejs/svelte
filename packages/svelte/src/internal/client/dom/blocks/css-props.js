import { hydrating, set_hydrate_nodes } from '../hydration.js';
import { render_effect } from '../../reactivity/effects.js';

/**
 * @param {HTMLDivElement | SVGGElement} element
 * @param {() => Record<string, string>} get_styles
 * @param {(anchor: Element | Text | Comment) => any} component
 * @returns {void}
 */
export function css_props(element, get_styles, component) {
	if (hydrating) {
		set_hydrate_nodes(
			/** @type {import('#client').TemplateNode[]} */ ([...element.childNodes]).slice(0, -1)
		);
	}

	component(/** @type {Comment} */ (element.lastChild));

	/** @type {Record<string, string>} */
	let styles = {};

	render_effect(() => {
		render_effect(() => {
			const next = get_styles();

			for (const key in styles) {
				if (!(key in next)) {
					element.style.removeProperty(key);
				}
			}

			for (const key in next) {
				element.style.setProperty(key, next[key]);
			}

			styles = next;
		});

		return () => {
			// TODO use `teardown` instead of creating a nested effect, post-https://github.com/sveltejs/svelte/pull/11936
			element.remove();
		};
	});
}
