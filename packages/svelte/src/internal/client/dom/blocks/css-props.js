import { namespace_svg } from '../../../../constants.js';
import { current_hydration_fragment, hydrate_block_anchor, hydrating } from '../../hydration.js';
import { empty } from '../../operations.js';
import { render_effect } from '../../reactivity/effects.js';
import { insert } from '../../reconciler.js';

/**
 * @param {Element | Text | Comment} anchor
 * @param {boolean} is_html
 * @param {() => Record<string, string>} get_props
 * @param {(anchor: Element | Text | Comment) => any} component
 * @returns {void}
 */
export function css_props(anchor, is_html, get_props, component) {
	hydrate_block_anchor(anchor);

	/** @type {HTMLElement | SVGElement} */
	let element;

	/** @type {Text | Comment} */
	let component_anchor;

	if (hydrating) {
		// Hydration: css props element is surrounded by a ssr comment ...
		element = /** @type {HTMLElement | SVGElement} */ (current_hydration_fragment[0]);
		// ... and the child(ren) of the css props element is also surround by a ssr comment
		component_anchor = /** @type {Comment} */ (element.firstChild);
	} else {
		// TODO surely we need to determine this at runtime?
		if (is_html) {
			element = document.createElement('div');
			element.style.display = 'contents';
		} else {
			element = document.createElementNS(namespace_svg, 'g');
		}

		insert(element, null, anchor);
		component_anchor = empty();
		element.appendChild(component_anchor);
	}

	component(component_anchor);

	render_effect(() => {
		const props = get_props();

		for (const key in props) {
			if (props[key] === undefined) {
				element.style.removeProperty(key);
			} else {
				element.style.setProperty(key, props[key]);
			}
		}
	});
}
