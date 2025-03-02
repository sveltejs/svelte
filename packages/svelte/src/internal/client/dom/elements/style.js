import { to_style } from '../../../shared/attributes.js';
import { hydrating } from '../hydration.js';

/**
 * @param {Element & ElementCSSInlineStyle} dom
 * @param {Record<string,any>} prev
 * @param {Record<string,any>} next
 * @param {string} important
 */
function update_styles(dom, prev = {}, next, important) {
	for (const key in next) {
		const value = next[key];
		if (prev[key] !== value) {
			if (next[key] == null) {
				dom.style.removeProperty(key);
			} else {
				dom.style.setProperty(key, value, important);
			}
		}
	}
}

/**
 * @param {Element & ElementCSSInlineStyle} dom
 * @param {string|null} value
 * @param {Record<string,any>|[Record<string,any>,Record<string,any>]} [prev_styles]
 * @param {Record<string,any>|[Record<string,any>,Record<string,any>]} [next_styles]
 */
export function set_style(dom, value, prev_styles, next_styles) {
	// @ts-expect-error
	var prev = dom.__style;
	if (hydrating || prev !== value) {
		var next_style_attr = to_style(value, next_styles);
		if (!hydrating || next_style_attr !== dom.getAttribute('style')) {
			if (next_style_attr == null) {
				dom.removeAttribute('style');
			} else {
				dom.setAttribute('style', next_style_attr);
			}
		}
		// @ts-expect-error
		dom.__style = value;
	} else if (next_styles) {
		if (Array.isArray(next_styles)) {
			update_styles(dom, prev_styles?.[0], next_styles[0], '');
			update_styles(dom, prev_styles?.[1], next_styles[1], '');
		} else {
			update_styles(dom, prev_styles, next_styles, '');
		}
	}
	return next_styles;
}
