/**
 * @param {HTMLElement} dom
 * @param {string} key
 * @param {string} value
 * @param {boolean} [important]
 * @param {boolean} [force_check] Should be `true` if we can't rely on our cached value, because for example there's also a `style` attribute
 */
export function set_style(dom, key, value, important, force_check) {
	// @ts-expect-error
	var attributes = (dom.__attributes ??= {});
	var style = dom.style;
	var style_key = 'style-' + key;

	if (attributes[style_key] === value && (!force_check || style.getPropertyValue(key) === value)) {
		return;
	}

	attributes[style_key] = value;

	if (value == null) {
		style.removeProperty(key);
	} else {
		style.setProperty(key, value, important ? 'important' : '');
	}
}
