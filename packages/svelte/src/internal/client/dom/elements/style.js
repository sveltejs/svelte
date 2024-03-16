import { render_effect } from '../../reactivity/effects.js';

/**
 * @param {HTMLElement} dom
 * @param {string} key
 * @param {string} value
 * @param {boolean} [important]
 */
export function style(dom, key, value, important) {
	const style = dom.style;
	const prev_value = style.getPropertyValue(key);
	if (value == null) {
		if (prev_value !== '') {
			style.removeProperty(key);
		}
	} else if (prev_value !== value) {
		style.setProperty(key, value, important ? 'important' : '');
	}
}

/**
 * @param {HTMLElement} dom
 * @param {string} key
 * @param {() => string} value
 * @param {boolean} [important]
 * @returns {void}
 */
export function style_effect(dom, key, value, important) {
	render_effect(() => {
		const string = value();
		style(dom, key, string, important);
	});
}
