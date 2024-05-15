/**
 * @param {HTMLElement} dom
 * @param {string} key
 * @param {string} value
 * @param {boolean} [important]
 */
export function set_style(dom, key, value, important) {
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
