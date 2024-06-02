import { namespace_svg } from '../../../../constants.js';
import { hydrate_anchor, hydrate_start, hydrating } from '../hydration.js';
import { empty } from '../operations.js';
import { render_effect } from '../../reactivity/effects.js';

/**
 * @param {Element | Text | Comment} anchor
 * @param {boolean} is_html
 * @param {() => Record<string, string>} props
 * @param {(anchor: Element | Text | Comment) => any} component
 * @returns {void}
 */
export function css_props(anchor, is_html, props, component) {
	/** @type {HTMLElement | SVGElement} */
	let element;

	/** @type {Text | Comment} */
	let component_anchor;

	if (hydrating) {
		// Hydration: css props element is surrounded by a ssr comment ...
		element = /** @type {HTMLElement | SVGElement} */ (hydrate_start);
		// ... and the child(ren) of the css props element is also surround by a ssr comment
		component_anchor = /** @type {Comment} */ (
			hydrate_anchor(/** @type {Comment} */ (element.firstChild))
		);
	} else {
		if (is_html) {
			element = document.createElement('div');
			element.style.display = 'contents';
		} else {
			element = document.createElementNS(namespace_svg, 'g');
		}

		anchor.before(element);
		component_anchor = element.appendChild(empty());
	}

	component(component_anchor);

	render_effect(() => {
		/** @type {Record<string, string>} */
		let current_props = {};

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
			element.remove();
		};
	});
}
