import { effect, render_effect, teardown } from '../../../reactivity/effects.js';
import { listen, without_reactive_context } from './shared.js';

/**
 * @param {'x' | 'y'} type
 * @param {() => number} get
 * @param {(value: number) => void} set
 * @returns {void}
 */
export function bind_window_scroll(type, get, set = get) {
	var is_scrolling_x = type === 'x';

	// Check if scrollend event is supported
	var supports_scrollend = 'onscrollend' in window;

	var target_handler = () =>
		without_reactive_context(() => {
			scrolling = true;
			if (!supports_scrollend) {
				clearTimeout(timeout);
				timeout = setTimeout(clear, 100);
			}

			set(window[is_scrolling_x ? 'scrollX' : 'scrollY']);
		});

	addEventListener('scroll', target_handler, {
		passive: true
	});

	var scrolling = false;

	/** @type {ReturnType<typeof setTimeout>} */
	var timeout;
	var clear = () => {
		scrolling = false;
	};

	// Use scrollend event if supported, otherwise fall back to timeout
	if (supports_scrollend) {
		var scrollend_handler = () => {
			without_reactive_context(() => {
				scrolling = false;
			});
		};
		addEventListener('scrollend', scrollend_handler, {
			passive: true
		});
		teardown(() => {
			removeEventListener('scrollend', scrollend_handler);
		});
	}

	var first = true;

	render_effect(() => {
		var latest_value = get();
		// Don't scroll to the initial value for accessibility reasons
		if (first) {
			first = false;
		} else if (!scrolling && latest_value != null) {
			scrolling = true;
			if (!supports_scrollend) {
				clearTimeout(timeout);
			}
			if (is_scrolling_x) {
				scrollTo(latest_value, window.scrollY);
			} else {
				scrollTo(window.scrollX, latest_value);
			}
			if (!supports_scrollend) {
				timeout = setTimeout(clear, 100);
			}
		}
	});

	// Browsers don't fire the scroll event for the initial scroll position when scroll style isn't set to smooth
	effect(target_handler);

	teardown(() => {
		removeEventListener('scroll', target_handler);
	});
}

/**
 * @param {'innerWidth' | 'innerHeight' | 'outerWidth' | 'outerHeight'} type
 * @param {(size: number) => void} set
 */
export function bind_window_size(type, set) {
	listen(window, ['resize'], () => without_reactive_context(() => set(window[type])));
}
