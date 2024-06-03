import { render_effect } from '../../../reactivity/effects.js';

/**
 * @param {(activeElement: Element | null) => void} update
 * @returns {void}
 */
export function bind_active_element(update) {
	var handler = () => {
		update(document.activeElement);
	};

	handler();

	document.addEventListener('focus', handler, true);
	document.addEventListener('blur', handler, true);

	render_effect(() => {
		return () => {
			document.removeEventListener('focus', handler);
			document.removeEventListener('blur', handler);
		};
	});
}
