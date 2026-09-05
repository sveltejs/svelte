import { DEV } from 'esm-env';
import { to_style } from '../../../shared/attributes.js';
import { STYLE_CACHE } from '../../constants.js';
import { hydrating } from '../hydration.js';

/**
 * @param {Element & ElementCSSInlineStyle} dom
 * @param {Record<string, any>} prev
 * @param {Record<string, any>} next
 * @param {string} [priority]
 */
function update_styles(dom, prev = {}, next, priority) {
	for (var key in next) {
		var value = next[key];

		if (prev[key] !== value) {
			if (value == null) {
				dom.style.removeProperty(key);
			} else {
				var str_value = String(value);

				if (DEV && /;+\s*$/.test(str_value)) {
					// eslint-disable-next-line no-console
					console.warn(
						`[svelte] Style directive value for "${key}" has a trailing semicolon which is invalid and will be removed. Remove the trailing ";" from the value.`
					);
				}

				// setProperty rejects values with trailing semicolons; strip them so that
				// reactive updates behave consistently with the initial cssText assignment
				dom.style.setProperty(key, str_value.replace(/;+\s*$/, ''), priority);
			}
		}
	}
}

/**
 * @param {Element & ElementCSSInlineStyle} dom
 * @param {string | null} value
 * @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [prev_styles]
 * @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [next_styles]
 */
export function set_style(dom, value, prev_styles, next_styles) {
	var prev = /** @type {any} */ (dom)[STYLE_CACHE];

	if (hydrating || prev !== value) {
		var next_style_attr = to_style(value, next_styles);

		if (!hydrating || next_style_attr !== dom.getAttribute('style')) {
			if (next_style_attr == null) {
				dom.removeAttribute('style');
			} else {
				dom.style.cssText = next_style_attr;
			}
		}

		/** @type {any} */ (dom)[STYLE_CACHE] = value;
	} else if (next_styles) {
		if (Array.isArray(next_styles)) {
			update_styles(dom, prev_styles?.[0], next_styles[0]);
			update_styles(dom, prev_styles?.[1], next_styles[1], 'important');
		} else {
			update_styles(dom, prev_styles, next_styles);
		}
	}

	return next_styles;
}
