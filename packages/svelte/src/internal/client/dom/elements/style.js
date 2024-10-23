/**
 * @param {HTMLElement} dom
 * @param {string} key
 * @param {string} value
 * @param {boolean} [important]
 */
export function set_style(dom, key, value, important) {
	// @ts-expect-error
	var styles = (dom.__styles ??= {});

	if (styles[key] === value) {
		return;
	}

	styles[key] = value;

	if (value == null) {
		dom.style.removeProperty(key);
	} else {
		dom.style.setProperty(key, value, important ? 'important' : '');
	}
}
