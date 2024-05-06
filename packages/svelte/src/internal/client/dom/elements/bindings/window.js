import { render_effect } from '../../../reactivity/effects.js';
import { listen } from './shared.js';

/**
 * @param {'x' | 'y'} type
 * @param {() => number} get_value
 * @param {(value: number) => void} update
 * @returns {void}
 */
export function bind_window_scroll(type, get_value, update) {
	var is_scrolling_x = type === 'x';

	var target_handler = () => {
		scrolling = true;
		clearTimeout(timeout);
		timeout = setTimeout(clear, 100); // TODO use scrollend event if supported (or when supported everywhere?)

		update(window[is_scrolling_x ? 'scrollX' : 'scrollY']);
	};

	addEventListener('scroll', target_handler, {
		passive: true
	});

	var latest_value = 0;
	var scrolling = false;

	/** @type {ReturnType<typeof setTimeout>} */
	var timeout;
	var clear = () => {
		scrolling = false;
	};

	render_effect(() => {
		latest_value = get_value();
		if (latest_value === undefined) return;

		if (!scrolling) {
			scrolling = true;
			clearTimeout(timeout);
			if (is_scrolling_x) {
				scrollTo(latest_value, window.scrollY);
			} else {
				scrollTo(window.scrollX, latest_value);
			}
			timeout = setTimeout(clear, 100);
		}
	});

	render_effect(() => {
		return () => {
			removeEventListener('scroll', target_handler);
		};
	});
}

/**
 * @param {'innerWidth' | 'innerHeight' | 'outerWidth' | 'outerHeight'} type
 * @param {(size: number) => void} update
 */
export function bind_window_size(type, update) {
	listen(window, ['resize'], () => update(window[type]));
}
