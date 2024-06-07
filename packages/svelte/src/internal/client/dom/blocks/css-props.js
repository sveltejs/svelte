import { hydrating, set_hydrate_nodes } from '../hydration.js';
import { render_effect } from '../../reactivity/effects.js';

/**
 * @param {HTMLDivElement | SVGGElement} element
 * @param {() => Record<string, string>} props
 * @param {(anchor: Element | Text | Comment) => any} component
 * @returns {void}
 */
export function css_props(element, props, component) {
	if (hydrating) {
		set_hydrate_nodes(
			/** @type {import('#client').TemplateNode[]} */ ([...element.childNodes]).slice(0, -1)
		);
	}

	component(/** @type {Comment} */ (element.lastChild));

	/** @type {Record<string, string>} */
	let current_props = {};

	render_effect(() => {
		render_effect(() => {
			const next_props = props();

			for (const key in current_props) {
				if (!(key in next_props)) {
					element.style.removeProperty(key);
				}
			}

			for (const key in next_props) {
				element.style.setProperty(key, next_props[key]);
			}

			current_props = next_props;
		});

		return () => {
			// TODO use `teardown` instead of creating a nested effect, post-https://github.com/sveltejs/svelte/pull/11936
			element.remove();
		};
	});
}
