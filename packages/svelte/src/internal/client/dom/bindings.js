import { DEV } from 'esm-env';
import { hydrating } from '../hydration.js';
import { destroy_effect, effect, managed_effect, render_effect } from '../reactivity/effects.js';
import { untrack } from '../runtime.js';
import { stringify } from '../render.js';
import { get_descriptor } from '../utils.js';
import { STATE_SYMBOL } from '../constants.js';

/**
 * Selects the correct option(s) (depending on whether this is a multiple select)
 * @template V
 * @param {HTMLSelectElement} select
 * @param {V} value
 * @param {boolean} [mounting]
 */
export function select_option(select, value, mounting) {
	if (select.multiple) {
		return select_options(select, value);
	}

	for (const option of select.options) {
		const option_value = get_option_value(option);
		if (option_value === value) {
			option.selected = true;
			return;
		}
	}

	if (!mounting || value !== undefined) {
		select.selectedIndex = -1; // no option should be selected
	}
}

/**
 * @template V
 * @param {HTMLSelectElement} select
 * @param {V} value
 */
function select_options(select, value) {
	for (const option of select.options) {
		// @ts-ignore
		option.selected = ~value.indexOf(get_option_value(option));
	}
}

/** @param {HTMLOptionElement} option */
function get_option_value(option) {
	// __value only exists if the <option> has a value attribute
	if ('__value' in option) {
		return option.__value;
	} else {
		return option.value;
	}
}

/**
 * @param {(online: boolean) => void} update
 * @returns {void}
 */
export function bind_online(update) {
	listen_to_events(window, ['online', 'offline'], () => {
		update(navigator.onLine);
	});
}

/** @param {TimeRanges} ranges */
function time_ranges_to_array(ranges) {
	const array = [];

	for (let i = 0; i < ranges.length; i += 1) {
		array.push({ start: ranges.start(i), end: ranges.end(i) });
	}

	return array;
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => number | undefined} get_value
 * @param {(value: number) => void} update
 * @returns {void}
 */
export function bind_current_time(media, get_value, update) {
	/** @type {number} */
	let raf_id;
	let updating = false;

	// Ideally, listening to timeupdate would be enough, but it fires too infrequently for the currentTime
	// binding, which is why we use a raf loop, too. We additionally still listen to timeupdate because
	// the user could be scrubbing through the video using the native controls when the media is paused.
	const callback = () => {
		cancelAnimationFrame(raf_id);

		if (!media.paused) {
			raf_id = requestAnimationFrame(callback);
		}

		updating = true;
		update(media.currentTime);
	};

	raf_id = requestAnimationFrame(callback);
	media.addEventListener('timeupdate', callback);

	render_effect(() => {
		const value = get_value();
		// through isNaN we also allow number strings, which is more robust
		if (!updating && !isNaN(/** @type {any} */ (value))) {
			media.currentTime = /** @type {number} */ (value);
		}
		updating = false;
	});

	render_effect(() => () => cancelAnimationFrame(raf_id));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(array: Array<{ start: number; end: number }>) => void} update
 */
export function bind_buffered(media, update) {
	listen_to_events(media, ['loadedmetadata', 'progress'], () =>
		update(time_ranges_to_array(media.buffered))
	);
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(array: Array<{ start: number; end: number }>) => void} update
 */
export function bind_seekable(media, update) {
	listen_to_events(media, ['loadedmetadata'], () => update(time_ranges_to_array(media.seekable)));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(array: Array<{ start: number; end: number }>) => void} update
 */
export function bind_played(media, update) {
	listen_to_events(media, ['timeupdate'], () => update(time_ranges_to_array(media.played)));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(seeking: boolean) => void} update
 */
export function bind_seeking(media, update) {
	listen_to_events(media, ['seeking', 'seeked'], () => update(media.seeking));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(seeking: boolean) => void} update
 */
export function bind_ended(media, update) {
	listen_to_events(media, ['timeupdate', 'ended'], () => update(media.ended));
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(ready_state: number) => void} update
 */
export function bind_ready_state(media, update) {
	listen_to_events(
		media,
		['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing', 'waiting', 'emptied'],
		() => update(media.readyState)
	);
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => number | undefined} get_value
 * @param {(playback_rate: number) => void} update
 */
export function bind_playback_rate(media, get_value, update) {
	let updating = false;
	const callback = () => {
		if (!updating) {
			update(media.playbackRate);
		}
		updating = false;
	};

	// Needs to happen after the element is inserted into the dom, else playback will be set back to 1 by the browser.
	// For hydration we could do it immediately but the additional code is not worth the lost microtask.

	/** @type {import('#client').Effect | undefined} */
	let render;
	let destroyed = false;

	const effect = managed_effect(() => {
		destroy_effect(effect);
		if (destroyed) return;

		if (get_value() == null) {
			callback();
		}

		listen_to_events(media, ['ratechange'], callback, false);

		render = render_effect(() => {
			const value = get_value();
			// through isNaN we also allow number strings, which is more robust
			if (!isNaN(/** @type {any} */ (value)) && value !== media.playbackRate) {
				updating = true;
				media.playbackRate = /** @type {number} */ (value);
			}
		});
	});

	render_effect(() => () => {
		destroyed = true;
		if (render) {
			destroy_effect(render);
		}
	});
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => boolean | undefined} get_value
 * @param {(paused: boolean) => void} update
 */
export function bind_paused(media, get_value, update) {
	let mounted = hydrating;
	let paused = get_value();

	const callback = () => {
		if (paused !== media.paused) {
			paused = media.paused;
			update((paused = media.paused));
		}
	};

	if (paused == null) {
		callback();
	}

	// Defer listening if not mounted yet so that the first canplay event doesn't cause a potentially wrong update
	if (mounted) {
		// If someone switches the src while media is playing, the player will pause.
		// Listen to the canplay event to get notified of this situation.
		listen_to_events(media, ['play', 'pause', 'canplay'], callback, false);
	}

	render_effect(() => {
		paused = !!get_value();

		if (paused !== media.paused) {
			const toggle = () => {
				mounted = true;
				if (paused) {
					media.pause();
				} else {
					media.play().catch(() => {
						update((paused = true));
					});
				}
			};

			if (mounted) {
				toggle();
			} else {
				// If this is the first invocation in dom mode, the media element isn't mounted yet,
				// and therefore its resource isn't loaded yet. We need to wait for the canplay event
				// in this case or else we'll get a "The play() request was interrupted by a new load request" error.
				media.addEventListener(
					'canplay',
					() => {
						listen_to_events(media, ['play', 'pause', 'canplay'], callback, false);
						toggle();
					},
					{ once: true }
				);
			}
		}
	});
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => number | undefined} get_value
 * @param {(volume: number) => void} update
 */
export function bind_volume(media, get_value, update) {
	let updating = false;
	const callback = () => {
		updating = true;
		update(media.volume);
	};

	if (get_value() == null) {
		callback();
	}

	listen_to_events(media, ['volumechange'], callback, false);

	render_effect(() => {
		const value = get_value();

		// through isNaN we also allow number strings, which is more robust
		if (!updating && !isNaN(/** @type {any} */ (value))) {
			media.volume = /** @type {number} */ (value);
		}

		updating = false;
	});
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => boolean | undefined} get_value
 * @param {(muted: boolean) => void} update
 */
export function bind_muted(media, get_value, update) {
	let updating = false;

	const callback = () => {
		updating = true;
		update(media.muted);
	};

	if (get_value() == null) {
		callback();
	}

	listen_to_events(media, ['volumechange'], callback, false);

	render_effect(() => {
		const value = get_value();

		if (!updating) media.muted = !!value;
		updating = false;
	});
}

/**
 * Fires the handler once immediately (unless corresponding arg is set to `false`),
 * then listens to the given events until the render effect context is destroyed
 * @param {Element | Window} dom
 * @param {Array<string>} events
 * @param {() => void} handler
 * @param {any} call_handler_immediately
 */
function listen_to_events(dom, events, handler, call_handler_immediately = true) {
	if (call_handler_immediately) {
		handler();
	}

	for (const name of events) {
		dom.addEventListener(name, handler);
	}

	render_effect(() => {
		return () => {
			for (const name of events) {
				dom.removeEventListener(name, handler);
			}
		};
	});
}

/**
 * Resize observer singleton.
 * One listener per element only!
 * https://groups.google.com/a/chromium.org/g/blink-dev/c/z6ienONUb5A/m/F5-VcUZtBAAJ
 */
class ResizeObserverSingleton {
	/** */
	#listeners = new WeakMap();

	/** @type {ResizeObserver | undefined} */
	#observer;

	/** @type {ResizeObserverOptions} */
	#options;

	/** @static */
	static entries = new WeakMap();

	/** @param {ResizeObserverOptions} options */
	constructor(options) {
		this.#options = options;
	}

	/**
	 * @param {Element} element
	 * @param {(entry: ResizeObserverEntry) => any} listener
	 */
	observe(element, listener) {
		const listeners = this.#listeners.get(element) || new Set();
		listeners.add(listener);
		this.#listeners.set(element, listeners);
		this.#getObserver().observe(element, this.#options);
		return () => {
			const listeners = this.#listeners.get(element);
			listeners.delete(listener);
			if (listeners.size === 0) {
				this.#listeners.delete(element);
				/** @type {ResizeObserver} */ (this.#observer).unobserve(element);
			}
		};
	}

	#getObserver() {
		return (
			this.#observer ??
			(this.#observer = new ResizeObserver(
				/** @param {any} entries */ (entries) => {
					for (const entry of entries) {
						ResizeObserverSingleton.entries.set(entry.target, entry);
						for (const listener of this.#listeners.get(entry.target) || []) {
							listener(entry);
						}
					}
				}
			))
		);
	}
}

const resize_observer_content_box = /* @__PURE__ */ new ResizeObserverSingleton({
	box: 'content-box'
});

const resize_observer_border_box = /* @__PURE__ */ new ResizeObserverSingleton({
	box: 'border-box'
});

const resize_observer_device_pixel_content_box = /* @__PURE__ */ new ResizeObserverSingleton({
	box: 'device-pixel-content-box'
});

/**
 * @param {Element} dom
 * @param {'contentRect' | 'contentBoxSize' | 'borderBoxSize' | 'devicePixelContentBoxSize'} type
 * @param {(entry: keyof ResizeObserverEntry) => void} update
 */
export function bind_resize_observer(dom, type, update) {
	const observer =
		type === 'contentRect' || type === 'contentBoxSize'
			? resize_observer_content_box
			: type === 'borderBoxSize'
				? resize_observer_border_box
				: resize_observer_device_pixel_content_box;

	const unsub = observer.observe(dom, /** @param {any} entry */ (entry) => update(entry[type]));
	render_effect(() => unsub);
}

/**
 * @param {HTMLElement} element
 * @param {'clientWidth' | 'clientHeight' | 'offsetWidth' | 'offsetHeight'} type
 * @param {(size: number) => void} update
 */
export function bind_element_size(element, type, update) {
	const unsub = resize_observer_border_box.observe(element, () => update(element[type]));

	effect(() => {
		untrack(() => update(element[type]));
		return unsub;
	});
}

/**
 * @param {'innerWidth' | 'innerHeight' | 'outerWidth' | 'outerHeight'} type
 * @param {(size: number) => void} update
 */
export function bind_window_size(type, update) {
	listen_to_events(window, ['resize'], () => update(window[type]));
}

/**
 * Finds the containing `<select>` element and potentially updates its `selected` state.
 * @param {HTMLOptionElement} dom
 * @returns {void}
 */
export function selected(dom) {
	// Inside an effect because the element might not be connected
	// to the parent <select> yet when this is called
	effect(() => {
		let select = dom.parentNode;

		while (select != null) {
			if (select.nodeName === 'SELECT') {
				break;
			}
			select = select.parentNode;
		}

		// @ts-ignore
		if (select != null && dom.__value === select.__value) {
			// never set to false, since this causes browser to select default option
			dom.selected = true;
		}
	});
}

/**
 * @param {HTMLInputElement} input
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_value(input, get_value, update) {
	input.addEventListener('input', () => {
		if (DEV && input.type === 'checkbox') {
			throw new Error(
				'Using bind:value together with a checkbox input is not allowed. Use bind:checked instead'
			);
		}

		let value = is_numberlike_input(input) ? to_number(input.value) : input.value;

		update(value);
	});

	render_effect(() => {
		if (DEV && input.type === 'checkbox') {
			throw new Error(
				'Using bind:value together with a checkbox input is not allowed. Use bind:checked instead'
			);
		}

		const value = get_value();
		// @ts-ignore
		input.__value = value;

		if (is_numberlike_input(input) && value === to_number(input.value)) {
			// handles 0 vs 00 case (see https://github.com/sveltejs/svelte/issues/9959)
			return;
		}

		if (input.type === 'date' && !value && !input.value) {
			// Handles the case where a temporarily invalid date is set (while typing, for example with a leading 0 for the day)
			// and prevents this state from clearing the other parts of the date input (see https://github.com/sveltejs/svelte/issues/7897)
			return;
		}

		input.value = stringify(value);
	});
}

/**
 * @param {HTMLInputElement} input
 */
function is_numberlike_input(input) {
	const type = input.type;
	return type === 'number' || type === 'range';
}

/**
 * @param {string} value
 */
function to_number(value) {
	return value === '' ? null : +value;
}

/**
 * @param {HTMLSelectElement} select
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_select_value(select, get_value, update) {
	let mounting = true;

	select.addEventListener('change', () => {
		/** @type {unknown} */
		let value;
		if (select.multiple) {
			value = [].map.call(select.querySelectorAll(':checked'), get_option_value);
		} else {
			/** @type {HTMLOptionElement | null} */
			const selected_option = select.querySelector(':checked');
			value = selected_option && get_option_value(selected_option);
		}
		update(value);
	});

	// Needs to be an effect, not a render_effect, so that in case of each loops the logic runs after the each block has updated
	effect(() => {
		let value = get_value();
		select_option(select, value, mounting);
		if (mounting && value === undefined) {
			/** @type {HTMLOptionElement | null} */
			let selected_option = select.querySelector(':checked');
			if (selected_option !== null) {
				value = get_option_value(selected_option);
				update(value);
			}
		}

		// @ts-ignore
		select.__value = value;
		mounting = false;
	});
}

/**
 * @param {'innerHTML' | 'textContent' | 'innerText'} property
 * @param {HTMLElement} element
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_content_editable(property, element, get_value, update) {
	element.addEventListener('input', () => {
		// @ts-ignore
		const value = element[property];
		update(value);
	});

	render_effect(() => {
		const value = get_value();

		if (element[property] !== value) {
			if (value === null) {
				// @ts-ignore
				const non_null_value = element[property];
				update(non_null_value);
			} else {
				// @ts-ignore
				element[property] = value + '';
			}
		}
	});
}

/**
 * @template V
 * @param {Array<HTMLInputElement>} group
 * @param {V} __value
 * @param {boolean} checked
 * @returns {V[]}
 */
function get_binding_group_value(group, __value, checked) {
	const value = new Set();

	for (let i = 0; i < group.length; i += 1) {
		if (group[i].checked) {
			// @ts-ignore
			value.add(group[i].__value);
		}
	}

	if (!checked) {
		value.delete(__value);
	}

	return Array.from(value);
}

/**
 * @param {Array<HTMLInputElement>} group
 * @param {null | [number]} group_index
 * @param {HTMLInputElement} input
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_group(group, group_index, input, get_value, update) {
	const is_checkbox = input.getAttribute('type') === 'checkbox';
	let binding_group = group;

	if (group_index !== null) {
		for (const index of group_index) {
			const group = binding_group;
			// @ts-ignore
			binding_group = group[index];
			if (binding_group === undefined) {
				// @ts-ignore
				binding_group = group[index] = [];
			}
		}
	}

	binding_group.push(input);

	input.addEventListener('change', () => {
		// @ts-ignore
		let value = input.__value;
		if (is_checkbox) {
			value = get_binding_group_value(binding_group, value, input.checked);
		}
		update(value);
	});

	render_effect(() => {
		let value = get_value();

		if (is_checkbox) {
			value = value || [];
			// @ts-ignore
			input.checked = value.includes(input.__value);
		} else {
			// @ts-ignore
			input.checked = input.__value === value;
		}
	});

	render_effect(() => {
		return () => {
			const index = binding_group.indexOf(input);
			if (index !== -1) {
				binding_group.splice(index, 1);
			}
		};
	});
}

/**
 * @param {HTMLInputElement} input
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_checked(input, get_value, update) {
	input.addEventListener('change', () => {
		const value = input.checked;
		update(value);
	});

	// eslint-disable-next-line eqeqeq
	if (get_value() == undefined) {
		update(false);
	}

	render_effect(() => {
		const value = get_value();
		input.checked = Boolean(value);
	});
}

/**
 * @param {'x' | 'y'} type
 * @param {() => number} get_value
 * @param {(value: number) => void} update
 * @returns {void}
 */
export function bind_window_scroll(type, get_value, update) {
	const is_scrolling_x = type === 'x';

	const target_handler = () => {
		scrolling = true;
		clearTimeout(timeout);
		timeout = setTimeout(clear, 100);
		const value = window[is_scrolling_x ? 'scrollX' : 'scrollY'];
		update(value);
	};

	addEventListener('scroll', target_handler, {
		passive: true
	});

	let latest_value = 0;
	let scrolling = false;

	/** @type {ReturnType<typeof setTimeout>} */
	let timeout;
	const clear = () => {
		scrolling = false;
	};

	render_effect(() => {
		latest_value = get_value() || 0;
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
 * @param {string} property
 * @param {string} event_name
 * @param {'get' | 'set'} type
 * @param {Element} element
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_property(property, event_name, type, element, get_value, update) {
	const target_handler = () => {
		// @ts-ignore
		const value = element[property];
		update(value);
	};

	element.addEventListener(event_name, target_handler);

	if (type === 'set') {
		render_effect(() => {
			const value = get_value();
			// @ts-ignore
			element[property] = value;
		});
	}

	if (type === 'get') {
		// @ts-ignore
		const value = element[property];
		update(value);
	}

	render_effect(() => {
		// @ts-ignore
		if (element === document.body || element === window || element === document) {
			return () => {
				element.removeEventListener(event_name, target_handler);
			};
		}
	});
}

/**
 * Makes an `export`ed (non-prop) variable available on the `$$props` object
 * so that consumers can do `bind:x` on the component.
 * @template V
 * @param {Record<string, unknown>} props
 * @param {string} prop
 * @param {V} value
 * @returns {void}
 */
export function bind_prop(props, prop, value) {
	const desc = get_descriptor(props, prop);

	if (desc && desc.set) {
		props[prop] = value;
		render_effect(() => () => {
			props[prop] = null;
		});
	}
}

/**
 * @param {any} bound_value
 * @param {Element} element_or_component
 * @returns {boolean}
 */
function is_bound_this(bound_value, element_or_component) {
	// Find the original target if the value is proxied.
	const proxy_target = bound_value && bound_value[STATE_SYMBOL]?.t;
	return bound_value === element_or_component || proxy_target === element_or_component;
}

/**
 * @param {Element} element_or_component
 * @param {(value: unknown, ...parts: unknown[]) => void} update
 * @param {(...parts: unknown[]) => unknown} get_value
 * @param {() => unknown[]} [get_parts] Set if the this binding is used inside an each block,
 * 										returns all the parts of the each block context that are used in the expression
 * @returns {void}
 */
export function bind_this(element_or_component, update, get_value, get_parts) {
	/** @type {unknown[]} */
	let old_parts;
	/** @type {unknown[]} */
	let parts;

	const e = effect(() => {
		old_parts = parts;
		// We only track changes to the parts, not the value itself to avoid unnecessary reruns.
		parts = get_parts?.() || [];

		untrack(() => {
			if (element_or_component !== get_value(...parts)) {
				update(element_or_component, ...parts);
				// If this is an effect rerun (cause: each block context changes), then nullfiy the binding at
				// the previous position if it isn't already taken over by a different effect.
				if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
					update(null, ...old_parts);
				}
			}
		});
	});

	// Add effect teardown (likely causes: if block became false, each item removed, component unmounted).
	// In these cases we need to nullify the binding only if we detect that the value is still the same.
	// If not, that means that another effect has now taken over the binding.
	e.ondestroy = () => {
		// Defer to the next tick so that all updates can be reconciled first.
		// This solves the case where one variable is shared across multiple this-bindings.
		effect(() => {
			if (parts && is_bound_this(get_value(...parts), element_or_component)) {
				update(null, ...parts);
			}
		});
	};
}
