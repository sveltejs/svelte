import { DEV } from 'esm-env';
import {
	append_child,
	child,
	clone_node,
	create_element,
	init_operations,
	map_get,
	map_set,
	set_class_name
} from './operations.js';
import {
	create_root_block,
	create_each_item_block,
	create_each_block,
	create_if_block,
	create_key_block,
	create_await_block,
	create_dynamic_element_block,
	create_head_block,
	create_dynamic_component_block,
	create_snippet_block
} from './block.js';
import {
	EACH_KEYED,
	EACH_IS_CONTROLLED,
	EACH_INDEX_REACTIVE,
	EACH_ITEM_REACTIVE,
	PassiveDelegatedEvents,
	DelegatedEvents
} from '../../constants.js';
import {
	create_fragment_from_html,
	insert,
	reconcile_tracked_array,
	reconcile_html,
	remove,
	reconcile_indexed_array
} from './reconciler.js';
import {
	render_effect,
	destroy_signal,
	get,
	is_signal,
	push_destroy_fn,
	set,
	execute_effect,
	UNINITIALIZED,
	derived,
	untrack,
	effect,
	flushSync,
	expose,
	safe_not_equal,
	current_block,
	set_signal_value,
	source,
	managed_effect,
	safe_equal,
	push,
	current_component_context,
	pop,
	schedule_task
} from './runtime.js';
import {
	current_hydration_fragment,
	get_hydration_fragment,
	hydrate_block_anchor,
	set_current_hydration_fragment
} from './hydration.js';
import { array_from, define_property, get_descriptor, get_descriptors, is_array } from './utils.js';
import { is_promise } from '../common.js';
import { bind_transition, trigger_transitions } from './transitions.js';

/** @type {Set<string>} */
const all_registerd_events = new Set();

/** @type {Set<(events: Array<string>) => void>} */
const root_event_handles = new Set();

/** @returns {Text} */
export function empty() {
	return document.createTextNode('');
}

/**
 * @param {string} html
 * @param {boolean} is_fragment
 * @returns {() => Node}
 */
/*#__NO_SIDE_EFFECTS__*/
export function template(html, is_fragment) {
	/** @type {undefined | Node} */
	let cached_content;
	return () => {
		if (cached_content === undefined) {
			const content = create_fragment_from_html(html);
			cached_content = is_fragment ? content : /** @type {Node} */ (child(content));
		}
		return cached_content;
	};
}

/**
 * @param {string} svg
 * @param {boolean} is_fragment
 * @returns {() => Node}
 */
/*#__NO_SIDE_EFFECTS__*/
export function svg_template(svg, is_fragment) {
	/** @type {undefined | Node} */
	let cached_content;
	return () => {
		if (cached_content === undefined) {
			const content = /** @type {Node} */ (child(create_fragment_from_html(`<svg>${svg}</svg>`)));
			cached_content = is_fragment ? content : /** @type {Node} */ (child(content));
		}
		return cached_content;
	};
}

/**
 * @param {Element} node
 * @returns {Element}
 */
export function svg_replace(node) {
	const first_child = /** @type {Element} */ (node.firstChild);
	node.replaceWith(first_child);
	return first_child;
}

/**
 * @param {boolean} is_fragment
 * @param {boolean} use_clone_node
 * @param {null | Text | Comment | Element} anchor
 * @param {() => Element} [template_element_fn]
 * @returns {Element | DocumentFragment | Node[]}
 */
function open_template(is_fragment, use_clone_node, anchor, template_element_fn) {
	if (current_hydration_fragment !== null) {
		if (anchor !== null) {
			hydrate_block_anchor(anchor, false);
		}
		// In ssr+hydration optimization mode, we might remove the template_element,
		// so we need to is_fragment flag to properly handle hydrated content accordingly.
		const fragment = current_hydration_fragment;
		if (fragment !== null) {
			return is_fragment ? fragment : /** @type {Element} */ (fragment[0]);
		}
	}
	return use_clone_node
		? clone_node(/** @type {() => Element} */ (template_element_fn)(), true)
		: document.importNode(/** @type {() => Element} */ (template_element_fn)(), true);
}

/**
 * @param {null | Text | Comment | Element} anchor
 * @param {boolean} use_clone_node
 * @param {() => Element} [template_element_fn]
 * @returns {Element | DocumentFragment | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function open(anchor, use_clone_node, template_element_fn) {
	return open_template(false, use_clone_node, anchor, template_element_fn);
}

/**
 * @param {null | Text | Comment | Element} anchor
 * @param {boolean} use_clone_node
 * @param {() => Element} [template_element_fn]
 * @returns {Element | DocumentFragment | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function open_frag(anchor, use_clone_node, template_element_fn) {
	return open_template(true, use_clone_node, anchor, template_element_fn);
}

/**
 * @param {Element | Text} dom
 * @param {boolean} is_fragment
 * @param {null | Text | Comment | Element} anchor
 * @returns {void}
 */
function close_template(dom, is_fragment, anchor) {
	const block = /** @type {import('./types.js').Block} */ (current_block);

	/** @type {import('./types.js').TemplateNode | Array<import('./types.js').TemplateNode>} */
	const current = is_fragment
		? is_array(dom)
			? dom
			: /** @type {import('./types.js').TemplateNode[]} */ (Array.from(dom.childNodes))
		: dom;
	if (anchor !== null && current_hydration_fragment === null) {
		insert(current, null, anchor);
	}
	block.d = current;
}

/**
 * @param {null | Text | Comment | Element} anchor
 * @param {Element | Text} dom
 * @returns {void}
 */
export function close(anchor, dom) {
	close_template(dom, false, anchor);
}

/**
 * @param {null | Text | Comment | Element} anchor
 * @param {Element | Text} dom
 * @returns {void}
 */
export function close_frag(anchor, dom) {
	close_template(dom, true, anchor);
}

/**
 * @param {import('./types.js').MaybeSignal<(event: Event, ...args: Array<unknown>) => void>} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function trusted(fn) {
	return function (...args) {
		const event = /** @type {Event} */ (args[0]);
		if (event.isTrusted) {
			// @ts-ignore
			unwrap(fn).apply(this, args);
		}
	};
}

/**
 * @param {import('./types.js').MaybeSignal<(event: Event, ...args: Array<unknown>) => void>} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function self(fn) {
	return function (...args) {
		const event = /** @type {Event} */ (args[0]);
		// @ts-ignore
		if (event.target === this) {
			// @ts-ignore
			unwrap(fn).apply(this, args);
		}
	};
}

/**
 * @param {import('./types.js').MaybeSignal<(event: Event, ...args: Array<unknown>) => void>} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function stopPropagation(fn) {
	return function (...args) {
		const event = /** @type {Event} */ (args[0]);
		event.stopPropagation();
		// @ts-ignore
		return unwrap(fn).apply(this, args);
	};
}

/**
 * @param {import('./types.js').MaybeSignal<(event: Event, ...args: Array<unknown>) => void>} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function once(fn) {
	let ran = false;
	return function (...args) {
		if (ran) {
			return;
		}
		ran = true;
		// @ts-ignore
		return unwrap(fn).apply(this, args);
	};
}

/**
 * @param {import('./types.js').MaybeSignal<(event: Event, ...args: Array<unknown>) => void>} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function stopImmediatePropagation(fn) {
	return function (...args) {
		const event = /** @type {Event} */ (args[0]);
		event.stopImmediatePropagation();
		// @ts-ignore
		return unwrap(fn).apply(this, args);
	};
}

/**
 * @param {import('./types.js').MaybeSignal<(event: Event, ...args: Array<unknown>) => void>} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function preventDefault(fn) {
	return function (...args) {
		const event = /** @type {Event} */ (args[0]);
		event.preventDefault();
		// @ts-ignore
		return unwrap(fn).apply(this, args);
	};
}

/**
 * @param {string} event_name
 * @param {Element} dom
 * @param {EventListener} handler
 * @param {boolean} capture
 * @param {boolean} [passive]
 * @returns {void}
 */
export function event(event_name, dom, handler, capture, passive) {
	const options = {
		capture,
		passive
	};
	const target_handler = handler;
	dom.addEventListener(event_name, target_handler, options);
	// @ts-ignore
	if (dom === document.body || dom === window || dom === document) {
		render_effect(() => {
			return () => {
				dom.removeEventListener(event_name, target_handler, options);
			};
		});
	}
}

/**
 * @param {Element} dom
 * @param {() => string} value
 * @returns {void}
 */
export function class_name_effect(dom, value) {
	render_effect(() => {
		const string = value();
		class_name(dom, string);
	});
}

/**
 * @param {Element} dom
 * @param {string} value
 * @returns {void}
 */
export function class_name(dom, value) {
	// @ts-expect-error need to add __className to patched prototype
	const prev_class_name = dom.__className;
	const next_class_name = to_class(value);
	const is_hydrating = current_hydration_fragment !== null;
	if (is_hydrating && dom.className === next_class_name) {
		// In case of hydration don't reset the class as it's already correct.
		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	} else if (
		prev_class_name !== next_class_name ||
		(is_hydrating && dom.className !== next_class_name)
	) {
		if (next_class_name === '') {
			dom.removeAttribute('class');
		} else {
			set_class_name(dom, next_class_name);
		}
		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	}
}

/**
 * @param {Element} dom
 * @param {() => string} value
 * @returns {void}
 */
export function text_effect(dom, value) {
	render_effect(() => {
		const string = value();
		text(dom, string);
	});
}

/**
 * @param {Element} dom
 * @param {string} value
 * @returns {void}
 */
export function text(dom, value) {
	// @ts-expect-error need to add __value to patched prototype
	const prev_node_value = dom.__nodeValue;
	const next_node_value = stringify(value);
	if (current_hydration_fragment !== null && dom.nodeValue === next_node_value) {
		// In case of hydration don't reset the nodeValue as it's already correct.
		// @ts-expect-error need to add __nodeValue to patched prototype
		dom.__nodeValue = next_node_value;
	} else if (prev_node_value !== next_node_value) {
		dom.nodeValue = next_node_value;
		// @ts-expect-error need to add __className to patched prototype
		dom.__nodeValue = next_node_value;
	}
}

/**
 * @param {HTMLElement} dom
 * @param {boolean} value
 * @returns {void}
 */
export function auto_focus(dom, value) {
	if (value) {
		const body = document.body;
		dom.autofocus = true;
		render_effect(
			() => {
				if (document.activeElement === body) {
					dom.focus();
				}
			},
			current_block,
			true,
			false
		);
	}
}

/**
 * @template V
 * @param {V} value
 * @returns {string | V}
 */
export function to_class(value) {
	return value == null ? '' : value;
}

/**
 * @param {Element} dom
 * @param {string} class_name
 * @param {boolean} value
 * @returns {void}
 */
export function class_toggle(dom, class_name, value) {
	if (value) {
		dom.classList.add(class_name);
	} else {
		dom.classList.remove(class_name);
	}
}
/**
 * Selects the correct option(s) (depending on whether this is a multiple select)
 * @template V
 * @param {HTMLSelectElement} select
 * @param {V} value
 */
export function select_option(select, value) {
	if (select.multiple) {
		return select_options(select, value);
	}
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
		const option_value = get_option_value(option);
		if (option_value === value) {
			option.selected = true;
			return;
		}
	}
	select.value = '';
}

/**
 * @template V
 * @param {HTMLSelectElement} select
 * @param {V} value
 */
function select_options(select, value) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
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
	const status_changed = () => {
		update(navigator.onLine);
	};
	listen_to_events(window, ['online', 'offline'], status_changed);
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
	const callback = () => {
		update(time_ranges_to_array(media.buffered));
	};
	listen_to_events(media, ['loadedmetadata', 'progress'], callback);
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(array: Array<{ start: number; end: number }>) => void} update
 */
export function bind_seekable(media, update) {
	const callback = () => {
		update(time_ranges_to_array(media.seekable));
	};
	listen_to_events(media, ['loadedmetadata'], callback);
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(array: Array<{ start: number; end: number }>) => void} update
 */
export function bind_played(media, update) {
	const callback = () => {
		update(time_ranges_to_array(media.played));
	};
	listen_to_events(media, ['timeupdate'], callback);
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(seeking: boolean) => void} update
 */
export function bind_seeking(media, update) {
	const callback = () => {
		update(media.seeking);
	};
	listen_to_events(media, ['seeking', 'seeked'], callback);
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(seeking: boolean) => void} update
 */
export function bind_ended(media, update) {
	const callback = () => {
		update(media.ended);
	};
	listen_to_events(media, ['timeupdate', 'ended'], callback);
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {(ready_state: number) => void} update
 */
export function bind_ready_state(media, update) {
	const callback = () => {
		update(media.readyState);
	};
	listen_to_events(
		media,
		['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing', 'waiting', 'emptied'],
		callback
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

	/** @type {import('./types.js').ComputationSignal | undefined} */
	let render;
	let destroyed = false;
	const effect = managed_effect(() => {
		destroy_signal(effect);
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
			destroy_signal(render);
		}
	});
}

/**
 * @param {HTMLVideoElement | HTMLAudioElement} media
 * @param {() => boolean | undefined} get_value
 * @param {(paused: boolean) => void} update
 */
export function bind_paused(media, get_value, update) {
	let mounted = current_hydration_fragment !== null;
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
		if (!updating) {
			media.muted = !!value;
		}
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
 * @param {HTMLElement} dom
 * @param {'clientWidth' | 'clientHeight' | 'offsetWidth' | 'offsetHeight'} type
 * @param {(size: number) => void} update
 */
export function bind_element_size(dom, type, update) {
	// We need to wait a few ticks to be sure that the element has been inserted and rendered
	// The alternative would be a mutation observer on the document but that's way to expensive
	requestAnimationFrame(() => requestAnimationFrame(() => update(dom[type])));
	const unsub = resize_observer_border_box.observe(dom, () => update(dom[type]));
	render_effect(() => unsub);
}

/**
 * @param {'innerWidth' | 'innerHeight' | 'outerWidth' | 'outerHeight'} type
 * @param {(size: number) => void} update
 */
export function bind_window_size(type, update) {
	const callback = () => update(window[type]);
	listen_to_events(window, ['resize'], callback);
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
		if (select != null) {
			// @ts-ignore
			const select_value = select.__value;
			// @ts-ignore
			const option_value = dom.__value;
			const selected = select_value === option_value;
			dom.selected = selected;
			dom.value = option_value;
			// Handle the edge case of new options being added to a select when its state is "nothing selected"
			// and keeping the selection state in sync (the DOM auto-selects the first option on insert)
			// @ts-ignore
			if (select.__value === null) {
				/** @type {HTMLSelectElement} */ (select).value = '';
			}
		}
	});
}

/**
 * @param {Element} dom
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_value(dom, get_value, update) {
	dom.addEventListener('input', () => {
		// @ts-ignore
		let value = dom.value;
		// @ts-ignore
		const type = dom.type;
		if (type === 'number' || type === 'range') {
			value = value === '' ? null : +value;
		}
		update(value);
	});
	render_effect(() => {
		const value = get_value();
		const coerced_value = value == null ? null : value + '';
		// @ts-ignore
		dom.value = coerced_value;
		// @ts-ignore
		dom.__value = value;
	});
}

/**
 * @param {HTMLSelectElement} dom
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_select_value(dom, get_value, update) {
	let mounted = false;
	dom.addEventListener('change', () => {
		/** @type {unknown} */
		let value;
		if (dom.multiple) {
			value = [].map.call(dom.querySelectorAll(':checked'), get_option_value);
		} else {
			/** @type {HTMLOptionElement | null} */
			const selected_option = dom.querySelector(':checked');
			value = selected_option && get_option_value(selected_option);
		}
		update(value);
	});
	// Needs to be an effect, not a render_effect, so that in case of each loops the logic runs after the each block has updated
	effect(() => {
		const value = get_value();
		if (value == null && !mounted) {
			/** @type {HTMLOptionElement | null} */
			let selected_option = value === undefined ? dom.querySelector(':checked') : null;
			if (selected_option === null) {
				dom.value = '';
				// @ts-ignore
				dom.__value = null;
			}
			const options = dom.querySelectorAll('option');
			for (const option of options) {
				if (get_option_value(option) === value || option.hasAttribute('selected')) {
					if (option.disabled) {
						option.value = '';
					}
					option.selected = true;
					selected_option = option;
					break;
				}
			}
			if (selected_option != null) {
				const non_null_value = get_option_value(selected_option);
				update(non_null_value);
				if (selected_option.hasAttribute('selected')) {
					selected_option.removeAttribute('selected');
					selected_option.selected = true;
				}
			}
		} else {
			select_option(dom, value);
			// @ts-ignore
			dom.__value = value;
		}
		mounted = true;
	});
}

/**
 * @param {'innerHTML' | 'textContent' | 'innerText'} property
 * @param {HTMLElement} dom
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_content_editable(property, dom, get_value, update) {
	dom.addEventListener('input', () => {
		// @ts-ignore
		const value = dom[property];
		update(value);
	});
	render_effect(() => {
		const value = get_value();
		if (dom[property] !== value) {
			if (value === null) {
				// @ts-ignore
				const non_null_value = dom[property];
				update(non_null_value);
			} else {
				// @ts-ignore
				dom[property] = value + '';
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
 * @param {HTMLInputElement} dom
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_group(group, group_index, dom, get_value, update) {
	const is_checkbox = dom.getAttribute('type') === 'checkbox';
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
	binding_group.push(dom);
	dom.addEventListener('change', () => {
		// @ts-ignore
		let value = dom.__value;
		if (is_checkbox) {
			value = get_binding_group_value(binding_group, value, dom.checked);
		}
		update(value);
	});
	render_effect(() => {
		let value = get_value();
		if (is_checkbox) {
			value = value || [];
			// @ts-ignore
			dom.checked = value.includes(dom.__value);
		} else {
			// @ts-ignore
			dom.checked = dom.__value === value;
		}
	});
	render_effect(() => {
		return () => {
			const index = binding_group.indexOf(dom);
			if (index !== -1) {
				binding_group.splice(index, 1);
			}
		};
	});
}

/**
 * @param {HTMLInputElement} dom
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_checked(dom, get_value, update) {
	dom.addEventListener('change', () => {
		const value = dom.checked;
		update(value);
	});
	// eslint-disable-next-line eqeqeq
	if (get_value() == undefined) {
		update(false);
	}
	render_effect(() => {
		const value = get_value();
		dom.checked = Boolean(value);
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
 * @param {Element} dom
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_property(property, event_name, type, dom, get_value, update) {
	const target_handler = () => {
		// @ts-ignore
		const value = dom[property];
		update(value);
	};
	dom.addEventListener(event_name, target_handler);
	if (type === 'set') {
		render_effect(() => {
			const value = get_value();
			// @ts-ignore
			dom[property] = value;
		});
	}
	if (type === 'get') {
		// @ts-ignore
		const value = dom[property];
		update(value);
	}
	render_effect(() => {
		// @ts-ignore
		if (dom === document.body || dom === window || dom === document) {
			return () => {
				dom.removeEventListener(event_name, target_handler);
			};
		}
	});
}
/**
 * Makes an `export`ed (non-prop) variable available on the `$$props` object
 * so that consumers can do `bind:x` on the component.
 * @template V
 * @param {import('./types.js').MaybeSignal<Record<string, unknown>>} props
 * @param {string} prop
 * @param {V} value
 * @returns {void}
 */
export function bind_prop(props, prop, value) {
	/** @param {V | null} value */
	const update = (value) => {
		const current_props = unwrap(props);
		const signal = expose(() => current_props[prop]);
		if (is_signal(signal)) {
			set(signal, value);
		} else if (Object.getOwnPropertyDescriptor(current_props, prop)?.set !== undefined) {
			current_props[prop] = value;
		}
	};
	update(value);
	render_effect(() => () => {
		update(null);
	});
}

/**
 * @param {Element} element_or_component
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_this(element_or_component, update) {
	untrack(() => {
		update(element_or_component);
		render_effect(() => () => {
			untrack(() => {
				update(null);
			});
		});
	});
}

/**
 * @param {Array<string>} events
 * @returns {void}
 */
export function delegate(events) {
	for (let i = 0; i < events.length; i++) {
		all_registerd_events.add(events[i]);
	}
	for (const fn of root_event_handles) {
		fn(events);
	}
}

/**
 * @param {Node} root_element
 * @param {Event} event
 * @returns {void}
 */
function handle_event_propagation(root_element, event) {
	const event_name = event.type;
	const path = event.composedPath?.() || [];
	let current_target = /** @type {null | Element} */ (path[0] || event.target);
	if (event.target !== current_target) {
		define_property(event, 'target', {
			configurable: true,
			value: current_target
		});
	}

	// composedPath contains list of nodes the event has propagated through.
	// We check __root to skip all nodes below it in case this is a
	// parent of the __root node, which indicates that there's nested
	// mounted apps. In this case we don't want to trigger events multiple times.
	// We're deliberately not skipping if the index is the same or higher, because
	// someone could create an event programmatically and emit it multiple times,
	// in which case we want to handle the whole propagation chain properly each time.
	let path_idx = 0;
	// @ts-expect-error is added below
	const handled_at = event.__root;
	if (handled_at) {
		const at_idx = path.indexOf(handled_at);
		if (at_idx < path.indexOf(root_element)) {
			path_idx = at_idx;
		}
	}
	current_target = /** @type {Element} */ (path[path_idx] || event.target);
	// Proxy currentTarget to correct target
	define_property(event, 'currentTarget', {
		configurable: true,
		get() {
			// TODO: ensure correct document?
			return current_target || document;
		}
	});

	while (current_target !== null) {
		/** @type {null | Element} */
		const parent_element =
			current_target.parentNode || /** @type {any} */ (current_target).host || null;
		const internal_prop_name = '__' + event_name;
		// @ts-ignore
		const delegated = current_target[internal_prop_name];
		if (delegated !== undefined && !(/** @type {any} */ (current_target).disabled)) {
			if (is_array(delegated)) {
				const [fn, ...data] = delegated;
				fn.apply(current_target, [event, ...data]);
			} else {
				delegated.call(current_target, event);
			}
		}
		if (event.cancelBubble || parent_element === root_element) {
			break;
		}
		current_target = parent_element;
	}

	// @ts-expect-error is used above
	event.__root = root_element;
}

/**
 * @param {Comment} anchor_node
 * @param {void | ((anchor: Comment, slot_props: Record<string, unknown>) => void)} slot_fn
 * @param {Record<string, unknown>} slot_props
 * @param {null | ((anchor: Comment) => void)} fallback_fn
 */
export function slot(anchor_node, slot_fn, slot_props, fallback_fn) {
	hydrate_block_anchor(anchor_node);
	if (slot_fn === undefined) {
		if (fallback_fn !== null) {
			fallback_fn(anchor_node);
		}
	} else {
		slot_fn(anchor_node, slot_props);
	}
}

/**
 * @param {Comment} anchor_node
 * @param {() => boolean} condition_fn
 * @param {(anchor: Node) => void} consequent_fn
 * @param {null | ((anchor: Node) => void)} alternate_fn
 * @returns {void}
 */
function if_block(anchor_node, condition_fn, consequent_fn, alternate_fn) {
	const block = create_if_block();
	hydrate_block_anchor(anchor_node);
	const previous_hydration_fragment = current_hydration_fragment;

	/** @type {null | import('./types.js').TemplateNode | Array<import('./types.js').TemplateNode>} */
	let consequent_dom = null;
	/** @type {null | import('./types.js').TemplateNode | Array<import('./types.js').TemplateNode>} */
	let alternate_dom = null;
	let has_mounted = false;
	let has_mounted_branch = false;

	const if_effect = render_effect(
		() => {
			const result = !!condition_fn();
			if (block.v !== result || !has_mounted) {
				block.v = result;
				if (has_mounted) {
					const consequent_transitions = block.c;
					const alternate_transitions = block.a;
					if (result) {
						if (alternate_transitions === null || alternate_transitions.size === 0) {
							execute_effect(alternate_effect);
						} else {
							trigger_transitions(alternate_transitions, 'out');
						}
						if (consequent_transitions === null || consequent_transitions.size === 0) {
							execute_effect(consequent_effect);
						} else {
							trigger_transitions(consequent_transitions, 'in');
						}
					} else {
						if (consequent_transitions === null || consequent_transitions.size === 0) {
							execute_effect(consequent_effect);
						} else {
							trigger_transitions(consequent_transitions, 'out');
						}
						if (alternate_transitions === null || alternate_transitions.size === 0) {
							execute_effect(alternate_effect);
						} else {
							trigger_transitions(alternate_transitions, 'in');
						}
					}
				} else if (current_hydration_fragment !== null) {
					const comment_text = /** @type {Comment} */ (current_hydration_fragment?.[0])?.data;
					if (
						(!comment_text &&
							// Can happen when a svelte:element that is turned into a void element has an if block inside
							current_hydration_fragment[0] !== null) ||
						(comment_text === 'ssr:if:true' && !result) ||
						(comment_text === 'ssr:if:false' && result)
					) {
						// Hydration mismatch: remove everything inside the anchor and start fresh.
						// This could happen using when `{#if browser} .. {/if}` in SvelteKit.
						remove(current_hydration_fragment);
						set_current_hydration_fragment(null);
					} else {
						// Remove the ssr:if comment node or else it will confuse the subsequent hydration algorithm
						current_hydration_fragment.shift();
					}
				}
				has_mounted = true;
			}
		},
		block,
		false
	);
	// Managed effect
	const consequent_effect = render_effect(
		() => {
			if (consequent_dom !== null) {
				remove(consequent_dom);
				consequent_dom = null;
			}
			if (block.v) {
				consequent_fn(anchor_node);
				if (!has_mounted_branch) {
					// Restore previous fragment so that Svelte continues to operate in hydration mode
					set_current_hydration_fragment(previous_hydration_fragment);
					has_mounted_branch = true;
				}
			}
			consequent_dom = block.d;
			block.d = null;
		},
		block,
		true
	);
	block.ce = consequent_effect;
	// Managed effect
	const alternate_effect = render_effect(
		() => {
			if (alternate_dom !== null) {
				remove(alternate_dom);
				alternate_dom = null;
			}
			if (!block.v) {
				if (alternate_fn !== null) {
					alternate_fn(anchor_node);
				}
				if (!has_mounted_branch) {
					// Restore previous fragment so that Svelte continues to operate in hydration mode
					set_current_hydration_fragment(previous_hydration_fragment);
					has_mounted_branch = true;
				}
			}
			alternate_dom = block.d;
			block.d = null;
		},
		block,
		true
	);
	block.ae = alternate_effect;
	push_destroy_fn(if_effect, () => {
		if (consequent_dom !== null) {
			remove(consequent_dom);
		}
		if (alternate_dom !== null) {
			remove(alternate_dom);
		}
		destroy_signal(consequent_effect);
		destroy_signal(alternate_effect);
	});
	block.e = if_effect;
}
export { if_block as if };

/**
 * @param {(anchor: Node | null) => void} render_fn
 * @returns {void}
 */
export function head(render_fn) {
	const block = create_head_block();
	// The head function may be called after the first hydration pass and ssr comment nodes may still be present,
	// therefore we need to skip that when we detect that we're not in hydration mode.
	const hydration_fragment =
		current_hydration_fragment !== null ? get_hydration_fragment(document.head.firstChild) : null;
	const previous_hydration_fragment = current_hydration_fragment;
	set_current_hydration_fragment(hydration_fragment);
	try {
		const head_effect = render_effect(
			() => {
				const current = block.d;
				if (current !== null) {
					remove(current);
					block.d = null;
				}
				let anchor = null;
				if (current_hydration_fragment === null) {
					anchor = empty();
					document.head.appendChild(anchor);
				}
				render_fn(anchor);
			},
			block,
			false
		);
		push_destroy_fn(head_effect, () => {
			const current = block.d;
			if (current !== null) {
				remove(current);
			}
		});
		block.e = head_effect;
	} finally {
		set_current_hydration_fragment(previous_hydration_fragment);
	}
}

/**
 * @param {import('./types.js').Block} block
 * @param {Element} from
 * @param {Element} to
 * @returns {void}
 */
function swap_block_dom(block, from, to) {
	const dom = block.d;
	if (is_array(dom)) {
		for (let i = 0; i < dom.length; i++) {
			if (dom[i] === from) {
				dom[i] = to;
				break;
			}
		}
	} else if (dom === from) {
		block.d = to;
	}
}

/**
 * @param {Comment} anchor_node
 * @param {() => string} tag_fn
 * @param {null | ((element: Element, anchor: Node) => void)} render_fn
 * @param {any} is_svg
 * @returns {void}
 */
export function element(anchor_node, tag_fn, render_fn, is_svg = false) {
	const block = create_dynamic_element_block();
	hydrate_block_anchor(anchor_node);
	let has_mounted = false;

	/** @type {string} */
	let tag;

	/** @type {null | HTMLElement | SVGElement} */
	let element = null;
	const element_effect = render_effect(
		() => {
			tag = tag_fn();
			if (has_mounted) {
				execute_effect(render_effect_signal);
			}
			has_mounted = true;
		},
		block,
		false
	);
	// Managed effect
	const render_effect_signal = render_effect(
		() => {
			const next_element = tag
				? current_hydration_fragment !== null
					? /** @type {HTMLElement | SVGElement} */ (current_hydration_fragment[0])
					: is_svg
					? document.createElementNS('http://www.w3.org/2000/svg', tag)
					: document.createElement(tag)
				: null;
			const prev_element = element;
			if (prev_element !== null) {
				block.d = null;
			}
			element = next_element;
			if (element !== null && render_fn !== null) {
				let anchor;
				if (current_hydration_fragment !== null) {
					// Use the existing ssr comment as the anchor so that the inner open and close
					// methods can pick up the existing nodes correctly
					anchor = /** @type {Comment} */ (element.firstChild);
				} else {
					anchor = empty();
					element.appendChild(anchor);
				}
				render_fn(element, anchor);
			}
			const has_prev_element = prev_element !== null;
			if (has_prev_element) {
				remove(prev_element);
			}
			if (element !== null) {
				insert(element, null, anchor_node);
				if (has_prev_element) {
					const parent_block = block.p;
					swap_block_dom(parent_block, prev_element, element);
				}
			}
		},
		block,
		true
	);
	push_destroy_fn(element_effect, () => {
		if (element !== null) {
			remove(element);
			block.d = null;
			element = null;
		}
		destroy_signal(render_effect_signal);
	});
	block.e = element_effect;
}

/**
 * @template P
 * @param {Comment} anchor_node
 * @param {() => (props: P) => void} component_fn
 * @param {(component: (props: P) => void) => void} render_fn
 * @returns {void}
 */
export function component(anchor_node, component_fn, render_fn) {
	const block = create_dynamic_component_block();

	/** @type {null | import('./types.js').Render} */
	let current_render = null;
	hydrate_block_anchor(anchor_node);

	/** @type {null | ((props: P) => void)} */
	let component = null;
	block.r =
		/**
		 * @param {import('./types.js').Transition} transition
		 * @returns {void}
		 */
		(transition) => {
			const render = /** @type {import('./types.js').Render} */ (current_render);
			const transitions = render.s;
			transitions.add(transition);
			transition.f(() => {
				transitions.delete(transition);
				if (transitions.size === 0) {
					if (render.e !== null) {
						if (render.d !== null) {
							remove(render.d);
							render.d = null;
						}
						destroy_signal(render.e);
						render.e = null;
					}
				}
			});
		};
	const create_render_effect = () => {
		/** @type {import('./types.js').Render} */
		const render = {
			d: null,
			e: null,
			s: new Set(),
			p: current_render
		};
		// Managed effect
		const effect = render_effect(
			() => {
				const current = block.d;
				if (current !== null) {
					remove(current);
					block.d = null;
				}
				if (component) {
					render_fn(component);
				}
				render.d = block.d;
				block.d = null;
			},
			block,
			true
		);
		render.e = effect;
		current_render = render;
	};
	const render = () => {
		const render = current_render;
		if (render === null) {
			create_render_effect();
			return;
		}
		const transitions = render.s;
		if (transitions.size === 0) {
			if (render.d !== null) {
				remove(render.d);
				render.d = null;
			}
			if (render.e) {
				execute_effect(render.e);
			} else {
				create_render_effect();
			}
		} else {
			create_render_effect();
			trigger_transitions(transitions, 'out');
		}
	};
	const component_effect = render_effect(
		() => {
			const next_component = component_fn();
			if (component !== next_component) {
				component = next_component;
				render();
			}
		},
		block,
		false
	);
	push_destroy_fn(component_effect, () => {
		let render = current_render;
		while (render !== null) {
			const dom = render.d;
			if (dom !== null) {
				remove(dom);
			}
			const effect = render.e;
			if (effect !== null) {
				destroy_signal(effect);
			}
			render = render.p;
		}
	});
	block.e = component_effect;
}

/**
 * @template V
 * @param {Comment} anchor_node
 * @param {import('./types.js').Signal<Promise<V>> | Promise<V> | (() => Promise<V>)} input
 * @param {null | ((anchor: Node) => void)} pending_fn
 * @param {null | ((anchor: Node, value: V) => void)} then_fn
 * @param {null | ((anchor: Node, error: unknown) => void)} catch_fn
 * @returns {void}
 */
function await_block(anchor_node, input, pending_fn, then_fn, catch_fn) {
	const block = create_await_block();

	/** @type {null | import('./types.js').Render} */
	let current_render = null;
	hydrate_block_anchor(anchor_node);

	/** @type {{}} */
	let latest_token;

	/** @type {typeof UNINITIALIZED | V} */
	let resolved_value = UNINITIALIZED;

	/** @type {unknown} */
	let error = UNINITIALIZED;
	let pending = false;
	block.r =
		/**
		 * @param {import('./types.js').Transition} transition
		 * @returns {void}
		 */
		(transition) => {
			const render = /** @type {import('./types.js').Render} */ (current_render);
			const transitions = render.s;
			transitions.add(transition);
			transition.f(() => {
				transitions.delete(transition);
				if (transitions.size === 0) {
					if (render.e !== null) {
						if (render.d !== null) {
							remove(render.d);
							render.d = null;
						}
						destroy_signal(render.e);
						render.e = null;
					}
				}
			});
		};
	const create_render_effect = () => {
		/** @type {import('./types.js').Render} */
		const render = {
			d: null,
			e: null,
			s: new Set(),
			p: current_render
		};
		const effect = render_effect(
			() => {
				if (error === UNINITIALIZED) {
					if (resolved_value === UNINITIALIZED) {
						// pending = true
						block.n = true;
						if (pending_fn !== null) {
							pending_fn(anchor_node);
						}
					} else if (then_fn !== null) {
						// pending = false
						block.n = false;
						then_fn(anchor_node, resolved_value);
					}
				} else if (catch_fn !== null) {
					// pending = false
					block.n = false;
					catch_fn(anchor_node, error);
				}
				render.d = block.d;
				block.d = null;
			},
			block,
			true,
			true
		);
		render.e = effect;
		current_render = render;
	};
	const render = () => {
		const render = current_render;
		if (render === null) {
			create_render_effect();
			return;
		}
		const transitions = render.s;
		if (transitions.size === 0) {
			if (render.d !== null) {
				remove(render.d);
				render.d = null;
			}
			if (render.e) {
				execute_effect(render.e);
			} else {
				create_render_effect();
			}
		} else {
			create_render_effect();
			trigger_transitions(transitions, 'out');
		}
	};
	const await_effect = render_effect(
		() => {
			const token = {};
			latest_token = token;
			const promise = is_signal(input) ? get(input) : typeof input === 'function' ? input() : input;
			if (is_promise(promise)) {
				promise.then(
					/** @param {V} v */
					(v) => {
						if (latest_token === token) {
							// Ensure UI is in sync before resolving value.
							flushSync();
							resolved_value = v;
							pending = false;
							render();
						}
					},
					/** @param {unknown} _error */
					(_error) => {
						error = _error;
						pending = false;
						render();
					}
				);
				if (resolved_value !== UNINITIALIZED || error !== UNINITIALIZED) {
					error = UNINITIALIZED;
					resolved_value = UNINITIALIZED;
				}
				if (!pending) {
					pending = true;
					render();
				}
			} else {
				error = UNINITIALIZED;
				resolved_value = promise;
				pending = false;
				render();
			}
		},
		block,
		false
	);
	push_destroy_fn(await_effect, () => {
		let render = current_render;
		latest_token = {};
		while (render !== null) {
			const dom = render.d;
			if (dom !== null) {
				remove(dom);
			}
			const effect = render.e;
			if (effect !== null) {
				destroy_signal(effect);
			}
			render = render.p;
		}
	});
	block.e = await_effect;
}
export { await_block as await };

/**
 * @template V
 * @param {Comment} anchor_node
 * @param {() => V} key
 * @param {(anchor: Node) => void} render_fn
 * @returns {void}
 */
export function key(anchor_node, key, render_fn) {
	const block = create_key_block();

	/** @type {null | import('./types.js').Render} */
	let current_render = null;
	hydrate_block_anchor(anchor_node);

	/** @type {V | typeof UNINITIALIZED} */
	let key_value = UNINITIALIZED;
	let mounted = false;
	block.r =
		/**
		 * @param {import('./types.js').Transition} transition
		 * @returns {void}
		 */
		(transition) => {
			const render = /** @type {import('./types.js').Render} */ (current_render);
			const transitions = render.s;
			transitions.add(transition);
			transition.f(() => {
				transitions.delete(transition);
				if (transitions.size === 0) {
					if (render.e !== null) {
						if (render.d !== null) {
							remove(render.d);
							render.d = null;
						}
						destroy_signal(render.e);
						render.e = null;
					}
				}
			});
		};
	const create_render_effect = () => {
		/** @type {import('./types.js').Render} */
		const render = {
			d: null,
			e: null,
			s: new Set(),
			p: current_render
		};
		const effect = render_effect(
			() => {
				render_fn(anchor_node);
				render.d = block.d;
				block.d = null;
			},
			block,
			true,
			true
		);
		render.e = effect;
		current_render = render;
	};
	const render = () => {
		const render = current_render;
		if (render === null) {
			create_render_effect();
			return;
		}
		const transitions = render.s;
		if (transitions.size === 0) {
			if (render.d !== null) {
				remove(render.d);
				render.d = null;
			}
			if (render.e) {
				execute_effect(render.e);
			} else {
				create_render_effect();
			}
		} else {
			trigger_transitions(transitions, 'out');
			create_render_effect();
		}
	};
	const key_effect = render_effect(
		() => {
			const prev_key_value = key_value;
			key_value = key();
			if (mounted && safe_not_equal(prev_key_value, key_value)) {
				render();
			}
		},
		block,
		false
	);
	// To ensure topological ordering of the key effect to the render effect,
	// we trigger the effect after.
	render();
	mounted = true;
	push_destroy_fn(key_effect, () => {
		let render = current_render;
		while (render !== null) {
			const dom = render.d;
			if (dom !== null) {
				remove(dom);
			}
			const effect = render.e;
			if (effect !== null) {
				destroy_signal(effect);
			}
			render = render.p;
		}
	});
	block.e = key_effect;
}

/**
 * @param {import('./types.js').Block} block
 * @returns {Text | Element | Comment}
 */
function get_first_element(block) {
	const current = block.d;
	if (is_array(current)) {
		for (let i = 0; i < current.length; i++) {
			const node = current[i];
			if (node.nodeType !== 8) {
				return node;
			}
		}
	}
	return /** @type {Text | Element | Comment} */ (current);
}

/**
 * @param {import('./types.js').EachItemBlock} block
 * @param {any} item
 * @param {number} index
 * @param {number} type
 * @returns {void}
 */
export function update_each_item_block(block, item, index, type) {
	if ((type & EACH_ITEM_REACTIVE) !== 0) {
		set_signal_value(block.v, item);
	}
	const transitions = block.s;
	const index_is_reactive = (type & EACH_INDEX_REACTIVE) !== 0;
	// Handle each item animations
	if (transitions !== null && (type & EACH_KEYED) !== 0) {
		let prev_index = block.i;
		if (index_is_reactive) {
			prev_index = /** @type {import('./types.js').Signal<number>} */ (prev_index).v;
		}
		const items = block.p.v;
		if (prev_index !== index && /** @type {number} */ (index) < items.length) {
			const from_dom = /** @type {Element} */ (get_first_element(block));
			const from = from_dom.getBoundingClientRect();
			schedule_task(() => {
				trigger_transitions(transitions, 'key', from);
			});
		}
	}
	if (index_is_reactive) {
		set_signal_value(/** @type {import('./types.js').Signal<number>} */ (block.i), index);
	} else {
		block.i = index;
	}
}

/**
 * @param {import('./types.js').EachItemBlock} block
 * @param {null | Array<import('./types.js').Block>} transition_block
 * @param {boolean} apply_transitions
 * @param {any} controlled
 * @returns {void}
 */
export function destroy_each_item_block(
	block,
	transition_block,
	apply_transitions,
	controlled = false
) {
	const transitions = block.s;
	if (apply_transitions && transitions !== null) {
		trigger_transitions(transitions, 'out');
		if (transition_block !== null) {
			transition_block.push(block);
		}
	} else {
		const dom = block.d;
		if (!controlled && dom !== null) {
			remove(dom);
		}
		destroy_signal(/** @type {import('./types.js').EffectSignal} */ (block.e));
	}
}

/**
 * @template V
 * @param {V} item
 * @param {unknown} key
 * @param {number} index
 * @param {(anchor: null, item: V, index: number | import('./types.js').Signal<number>) => void} render_fn
 * @param {number} flags
 * @returns {import('./types.js').EachItemBlock}
 */
export function each_item_block(item, key, index, render_fn, flags) {
	const item_value = (flags & EACH_ITEM_REACTIVE) === 0 ? item : source(item);
	const index_value = (flags & EACH_INDEX_REACTIVE) === 0 ? index : source(index);
	const block = create_each_item_block(item_value, index_value, key);
	const effect = render_effect(
		/** @param {import('./types.js').EachItemBlock} block */
		(block) => {
			render_fn(null, block.v, block.i);
		},
		block,
		true
	);
	block.e = effect;
	return block;
}

/**
 * @template V
 * @param {Element | Comment} anchor_node
 * @param {() => V[]} collection
 * @param {number} flags
 * @param {null | ((item: V) => string)} key_fn
 * @param {(anchor: null, item: V, index: import('./types.js').MaybeSignal<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @param {typeof reconcile_indexed_array | reconcile_tracked_array} reconcile_fn
 * @returns {void}
 */
function each(anchor_node, collection, flags, key_fn, render_fn, fallback_fn, reconcile_fn) {
	const is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
	const block = create_each_block(flags, anchor_node);

	/** @type {null | import('./types.js').Render} */
	let current_fallback = null;
	hydrate_block_anchor(anchor_node, is_controlled);

	/** @type {V[]} */
	let array;

	/** @type {Array<string> | null} */
	let keys = null;

	/** @type {null | import('./types.js').EffectSignal} */
	let render = null;
	block.r =
		/** @param {import('./types.js').Transition} transition */
		(transition) => {
			const fallback = /** @type {import('./types.js').Render} */ (current_fallback);
			const transitions = fallback.s;
			transitions.add(transition);
			transition.f(() => {
				transitions.delete(transition);
				if (transitions.size === 0) {
					if (fallback.e !== null) {
						if (fallback.d !== null) {
							remove(fallback.d);
							fallback.d = null;
						}
						destroy_signal(fallback.e);
						fallback.e = null;
					}
				}
			});
		};
	const create_fallback_effect = () => {
		/** @type {import('./types.js').Render} */
		const fallback = {
			d: null,
			e: null,
			s: new Set(),
			p: current_fallback
		};
		// Managed effect
		const effect = render_effect(
			() => {
				const dom = block.d;
				if (dom !== null) {
					remove(dom);
					block.d = null;
				}
				let anchor = block.a;
				const is_controlled = (block.f & EACH_IS_CONTROLLED) !== 0;
				if (is_controlled) {
					anchor = empty();
					block.a.appendChild(anchor);
				}
				/** @type {(anchor: Node) => void} */ (fallback_fn)(anchor);
				fallback.d = block.d;
				block.d = null;
			},
			block,
			true
		);
		fallback.e = effect;
		current_fallback = fallback;
	};
	const each = render_effect(
		() => {
			/** @type {V[]} */
			const maybe_array = collection();
			array = is_array(maybe_array)
				? maybe_array
				: maybe_array == null
				? []
				: Array.from(maybe_array);
			if (key_fn !== null) {
				keys = array.map(key_fn);
			}
			if (fallback_fn !== null) {
				if (array.length === 0) {
					if (block.v.length !== 0 || render === null) {
						create_fallback_effect();
					}
				} else if (block.v.length === 0 && current_fallback !== null) {
					const fallback = current_fallback;
					const transitions = fallback.s;
					if (transitions.size === 0) {
						if (fallback.d !== null) {
							remove(fallback.d);
							fallback.d = null;
						}
					} else {
						trigger_transitions(transitions, 'out');
					}
				}
			}
			if (render !== null) {
				execute_effect(render);
			}
		},
		block,
		false
	);
	render = render_effect(
		/** @param {import('./types.js').EachBlock} block */
		(block) => {
			const flags = block.f;
			const is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
			const anchor_node = block.a;
			reconcile_fn(array, block, anchor_node, is_controlled, render_fn, flags, true, keys);
		},
		block,
		true
	);
	push_destroy_fn(each, () => {
		const flags = block.f;
		const is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
		const anchor_node = block.a;
		let fallback = current_fallback;
		while (fallback !== null) {
			const dom = fallback.d;
			if (dom !== null) {
				remove(dom);
			}
			const effect = fallback.e;
			if (effect !== null) {
				destroy_signal(effect);
			}
			fallback = fallback.p;
		}
		// Clear the array
		reconcile_fn([], block, anchor_node, is_controlled, render_fn, flags, false, keys);
		destroy_signal(/** @type {import('./types.js').EffectSignal} */ (render));
	});
	block.e = each;
}

/**
 * @template V
 * @param {Element | Comment} anchor_node
 * @param {() => V[]} collection
 * @param {number} flags
 * @param {null | ((item: V) => string)} key_fn
 * @param {(anchor: null, item: V, index: import('./types.js').MaybeSignal<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each_keyed(anchor_node, collection, flags, key_fn, render_fn, fallback_fn) {
	each(anchor_node, collection, flags, key_fn, render_fn, fallback_fn, reconcile_tracked_array);
}

/**
 * @template V
 * @param {Element | Comment} anchor_node
 * @param {() => V[]} collection
 * @param {number} flags
 * @param {(anchor: null, item: V, index: import('./types.js').MaybeSignal<number>) => void} render_fn
 * @param {null | ((anchor: Node) => void)} fallback_fn
 * @returns {void}
 */
export function each_indexed(anchor_node, collection, flags, render_fn, fallback_fn) {
	each(anchor_node, collection, flags, null, render_fn, fallback_fn, reconcile_indexed_array);
}

/**
 * @param {Element | Text | Comment} anchor
 * @param {boolean} is_html
 * @param {() => Record<string, string>} props
 * @param {(anchor: Element | Text | Comment) => any} component
 * @returns {void}
 */
export function cssProps(anchor, is_html, props, component) {
	hydrate_block_anchor(anchor);

	/** @type {HTMLElement | SVGElement} */
	let tag;

	/** @type {Text | Comment} */
	let component_anchor;
	if (current_hydration_fragment !== null) {
		// Hydration: css props element is surrounded by a ssr comment ...
		tag = /** @type {HTMLElement | SVGElement} */ (current_hydration_fragment[0]);
		// ... and the child(ren) of the css props element is also surround by a ssr comment
		component_anchor = /** @type {Comment} */ (tag.firstChild);
	} else {
		if (is_html) {
			tag = document.createElement('div');
			tag.style.display = 'contents';
		} else {
			tag = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		}
		insert(tag, null, anchor);
		component_anchor = empty();
		tag.appendChild(component_anchor);
	}
	component(component_anchor);

	/** @type {Record<string, string>} */
	let current_props = {};
	const effect = render_effect(() => {
		const next_props = props();
		for (const key in current_props) {
			if (!(key in next_props)) {
				tag.style.removeProperty(key);
			}
		}
		for (const key in next_props) {
			tag.style.setProperty(key, next_props[key]);
		}
		current_props = next_props;
	});
	push_destroy_fn(effect, () => {
		remove(tag);
	});
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function stringify(value) {
	return typeof value === 'string' ? value : value == null ? '' : value + '';
}

/**
 * @param {Element | Text | Comment} dom
 * @param {() => string} get_value
 * @param {boolean} svg
 * @returns {void}
 */
export function html(dom, get_value, svg) {
	/** @type {import('./types.js').TemplateNode | import('./types.js').TemplateNode[]} */
	let html_dom;
	/** @type {string} */
	let value;
	const effect = render_effect(() => {
		if (value !== (value = get_value())) {
			if (html_dom) {
				remove(html_dom);
			}
			html_dom = reconcile_html(dom, value, svg);
		}
	});
	push_destroy_fn(effect, () => {
		if (html_dom) {
			remove(html_dom);
		}
	});
}

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {import('./types.js').TransitionFn<P | undefined>} transition_fn
 * @param {(() => P) | null} props
 * @param {any} global
 * @returns {void}
 */
export function transition(dom, transition_fn, props, global = false) {
	bind_transition(dom, transition_fn, props, 'both', global);
}

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {import('./types.js').TransitionFn<P | undefined>} transition_fn
 * @param {(() => P) | null} props
 * @returns {void}
 */
export function animate(dom, transition_fn, props) {
	bind_transition(dom, transition_fn, props, 'key', false);
}

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {import('./types.js').TransitionFn<P | undefined>} transition_fn
 * @param {(() => P) | null} props
 * @param {any} global
 * @returns {void}
 */
function in_fn(dom, transition_fn, props, global = false) {
	bind_transition(dom, transition_fn, props, 'in', global);
}
export { in_fn as in };

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {import('./types.js').TransitionFn<P | undefined>} transition_fn
 * @param {(() => P) | null} props
 * @param {any} global
 * @returns {void}
 */
export function out(dom, transition_fn, props, global = false) {
	bind_transition(dom, transition_fn, props, 'out', global);
}

/**
 * @template P
 * @param {Element} dom
 * @param {(dom: Element, value?: P) => import('./types.js').ActionPayload<P>} action
 * @param {() => P} [value_fn]
 * @returns {void}
 */
export function action(dom, action, value_fn) {
	/** @type {undefined | import('./types.js').ActionPayload<P>} */
	let payload = undefined;
	// Action could come from a prop, therefore could be a signal, therefore untrack
	// TODO we could take advantage of this and enable https://github.com/sveltejs/svelte/issues/6942
	effect(() => {
		if (value_fn) {
			const value = value_fn();
			untrack(() => {
				if (payload === undefined) {
					payload = action(dom, value);
				} else {
					const update = payload.update;
					if (typeof update === 'function') {
						update(value);
					}
				}
			});
		} else {
			untrack(() => (payload = action(dom)));
		}
	});
	effect(() => {
		if (payload !== undefined) {
			const destroy = payload.destroy;
			if (typeof destroy === 'function') {
				return () => {
					destroy();
				};
			}
		}
	});
}
/**
 * The value/checked attribute in the template actually corresponds to the defaultValue property, so we need
 * to remove it upon hydration to avoid a bug when someone resets the form value.
 * @param {HTMLInputElement | HTMLSelectElement} dom
 * @returns {void}
 */
export function remove_input_attr_defaults(dom) {
	if (current_hydration_fragment !== null) {
		attr(dom, 'value', null);
		attr(dom, 'checked', null);
	}
}
/**
 * The child of a textarea actually corresponds to the defaultValue property, so we need
 * to remove it upon hydration to avoid a bug when someone resets the form value.
 * @param {HTMLTextAreaElement} dom
 * @returns {void}
 */
export function remove_textarea_child(dom) {
	if (current_hydration_fragment !== null && dom.firstChild !== null) {
		dom.textContent = '';
	}
}

/**
 * @param {Element} dom
 * @param {string} attribute
 * @param {() => string} value
 */
export function attr_effect(dom, attribute, value) {
	render_effect(() => {
		const string = value();
		attr(dom, attribute, string);
	});
}

/**
 * @param {Element} dom
 * @param {string} attribute
 * @param {string | null} value
 */
export function attr(dom, attribute, value) {
	value = value == null ? null : value + '';

	if (DEV) {
		check_src_in_dev_hydration(dom, attribute, value);
	}

	if (
		current_hydration_fragment === null ||
		(dom.getAttribute(attribute) !== value &&
			// If we reset those, they would result in another network request, which we want to avoid.
			// We assume they are the same between client and server as checking if they are equal is expensive
			// (we can't just compare the strings as they can be different between client and server but result in the
			// same url, so we would need to create hidden anchor elements to compare them)
			attribute !== 'src' &&
			attribute !== 'srcset')
	) {
		if (value === null) {
			dom.removeAttribute(attribute);
		} else {
			dom.setAttribute(attribute, value);
		}
	}
}

/** @type {HTMLAnchorElement | undefined} */
let src_url_equal_anchor;

/**
 * @param {string} element_src
 * @param {string} url
 * @returns {boolean}
 */
export function src_url_equal(element_src, url) {
	if (element_src === url) return true;
	if (!src_url_equal_anchor) {
		src_url_equal_anchor = document.createElement('a');
	}
	// This is actually faster than doing URL(..).href
	src_url_equal_anchor.href = url;
	return element_src === src_url_equal_anchor.href;
}

/** @param {string} srcset */
function split_srcset(srcset) {
	return srcset.split(',').map((src) => src.trim().split(' ').filter(Boolean));
}

/**
 * @param {HTMLSourceElement | HTMLImageElement} element_srcset
 * @param {string | undefined | null} srcset
 * @returns {boolean}
 */
export function srcset_url_equal(element_srcset, srcset) {
	const element_urls = split_srcset(element_srcset.srcset);
	const urls = split_srcset(srcset || '');

	return (
		urls.length === element_urls.length &&
		urls.every(
			([url, width], i) =>
				width === element_urls[i][1] &&
				// We need to test both ways because Vite will create an a full URL with
				// `new URL(asset, import.meta.url).href` for the client when `base: './'`, and the
				// relative URLs inside srcset are not automatically resolved to absolute URLs by
				// browsers (in contrast to img.src). This means both SSR and DOM code could
				// contain relative or absolute URLs.
				(src_url_equal(element_urls[i][0], url) || src_url_equal(url, element_urls[i][0]))
		)
	);
}

/**
 * @param {any} dom
 * @param {string} attribute
 * @param {string | null} value
 */
function check_src_in_dev_hydration(dom, attribute, value) {
	if (current_hydration_fragment !== null && (attribute === 'src' || attribute === 'srcset')) {
		if (
			(attribute === 'src' && !src_url_equal(dom.getAttribute('src') || '', value || '')) ||
			(attribute === 'srcset' &&
				!srcset_url_equal(/** @type {HTMLImageElement | HTMLSourceElement} */ (dom), value || ''))
		) {
			// eslint-disable-next-line no-console
			console.error(
				'Detected a src/srcset attribute value change during hydration. This will not be repaired during hydration, ' +
					'the src/srcset value that came from the server will be used. Related element:',
				dom,
				' Differing value:',
				value
			);
		}
	}
}

/**
 * @param {Element} dom
 * @param {string} attribute
 * @param {() => string} value
 */
export function xlink_attr_effect(dom, attribute, value) {
	render_effect(() => {
		const string = value();
		xlink_attr(dom, attribute, string);
	});
}

/**
 * @param {Element} dom
 * @param {string} attribute
 * @param {string} value
 */
export function xlink_attr(dom, attribute, value) {
	dom.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}

/**
 * @param {any} node
 * @param {string} prop
 * @param {() => any} value
 */
export function set_custom_element_data_effect(node, prop, value) {
	render_effect(() => {
		set_custom_element_data(node, prop, value());
	});
}

/**
 * @param {any} node
 * @param {string} prop
 * @param {any} value
 */
export function set_custom_element_data(node, prop, value) {
	if (prop in node) {
		node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
	} else {
		attr(node, prop, value);
	}
}

/**
 * @param {HTMLElement} dom
 * @param {string} key
 * @param {string} value
 * @param {boolean} [important]
 */
export function style(dom, key, value, important) {
	if (value == null) {
		dom.style.removeProperty(key);
	} else {
		dom.style.setProperty(key, value, important ? 'important' : '');
	}
}

/**
 * List of attributes that should always be set through the attr method,
 * because updating them through the property setter doesn't work reliably.
 * In the example of `width`/`height`, the problem is that the setter only
 * accepts numeric values, but the attribute can also be set to a string like `50%`.
 * If this list becomes too big, rethink this approach.
 */
const always_set_through_set_attribute = ['width', 'height'];

/** @type {Map<string, string[]>} */
const setters_cache = new Map();

/** @param {Element} element */
function get_setters(element) {
	/** @type {string[]} */
	const setters = [];
	// @ts-expect-error
	const descriptors = get_descriptors(element.__proto__);
	for (const key in descriptors) {
		if (descriptors[key].set && !always_set_through_set_attribute.includes(key)) {
			setters.push(key);
		}
	}
	return setters;
}

/**
 * Spreads attributes onto a DOM element, taking into account the currently set attributes
 * @param {Element & ElementCSSInlineStyle} dom
 * @param {Record<string, unknown> | null} prev
 * @param {Record<string, unknown>[]} attrs
 * @param {string} css_hash
 * @returns {Record<string, unknown>}
 */
export function spread_attributes(dom, prev, attrs, css_hash) {
	const next = Object.assign({}, ...attrs);
	const has_hash = css_hash.length !== 0;
	for (const key in prev) {
		if (!(key in next)) {
			next[key] = null;
		}
	}
	if (has_hash && !next.class) {
		next.class = '';
	}

	let setters = map_get(setters_cache, dom.nodeName);
	if (!setters) map_set(setters_cache, dom.nodeName, (setters = get_setters(dom)));

	for (const key in next) {
		let value = next[key];
		if (value === prev?.[key]) continue;

		const prefix = key.slice(0, 2);
		if (prefix === '$$') continue;

		if (prefix === 'on') {
			/** @type {{ capture?: true }} */
			const opts = {};
			let event_name = key.slice(2).toLowerCase();
			const delegated = DelegatedEvents.includes(event_name);

			if (
				event_name.endsWith('capture') &&
				event_name !== 'ongotpointercapture' &&
				event_name !== 'onlostpointercapture'
			) {
				event_name = event_name.slice(0, -7);
				opts.capture = true;
			}
			if (!delegated && prev?.[key]) {
				dom.removeEventListener(event_name, /** @type {any} */ (prev[key]), opts);
			}
			if (value != null) {
				if (!delegated) {
					dom.addEventListener(event_name, value, opts);
				} else {
					// @ts-ignore
					dom[`__${event_name}`] = value;
					delegate([event_name]);
				}
			}
		} else if (value == null) {
			dom.removeAttribute(key);
		} else if (key === 'style') {
			dom.style.cssText = value + '';
		} else if (key === 'autofocus') {
			auto_focus(/** @type {HTMLElement} */ (dom), Boolean(value));
		} else if (key === '__value' || key === 'value') {
			// @ts-ignore
			dom.value = dom[key] = dom.__value = value;
		} else if (setters.includes(key)) {
			if (DEV) {
				check_src_in_dev_hydration(dom, key, value);
			}
			if (
				current_hydration_fragment === null ||
				//  @ts-ignore see attr method for an explanation of src/srcset
				(dom[key] !== value && key !== 'src' && key !== 'srcset')
			) {
				// @ts-ignore
				dom[key] = value;
			}
		} else if (typeof value !== 'function') {
			if (has_hash && key === 'class') {
				if (value) value += ' ';
				value += css_hash;
			}

			attr(dom, key, value);
		}
	}
	return next;
}

/**
 * @param {Element} node
 * @param {Record<string, unknown> | null} prev
 * @param {Record<string, unknown>[]} attrs
 * @param {string} css_hash
 */
export function spread_dynamic_element_attributes(node, prev, attrs, css_hash) {
	if (node.tagName.includes('-')) {
		const next = Object.assign({}, ...attrs);
		if (prev !== null) {
			for (const key in prev) {
				if (!(key in next)) {
					next[key] = null;
				}
			}
		}
		for (const key in next) {
			set_custom_element_data(node, key, next[key]);
		}
		return next;
	} else {
		return spread_attributes(
			/** @type {Element & ElementCSSInlineStyle} */ (node),
			prev,
			attrs,
			css_hash
		);
	}
}

/**
 * @param {import('./types.js').Signal<Record<string, unknown>> | Record<string, unknown>} props_signal
 * @param {string[]} rest
 * @returns {Record<string, unknown>}
 */
export function rest_props(props_signal, rest) {
	return derived(() => {
		var props = unwrap(props_signal);

		/** @type {Record<string, unknown>} */
		var rest_props = {};

		for (var key in props) {
			if (rest.includes(key)) continue;

			const { get, value, enumerable } = /** @type {PropertyDescriptor} */ (
				get_descriptor(props, key)
			);

			define_property(rest_props, key, get ? { get, enumerable } : { value, enumerable });
		}

		return rest_props;
	});
}

/**
 * @param {Record<string, unknown>[] | (() => Record<string, unknown>[])} props
 * @returns {any}
 */
export function spread_props(props) {
	if (typeof props === 'function') {
		return derived(() => {
			return spread_props(props());
		});
	}

	/** @type {Record<string, unknown>} */
	const merged_props = {};
	let key;
	for (let i = 0; i < props.length; i++) {
		const obj = props[i];
		for (key in obj) {
			const desc = /** @type {PropertyDescriptor} */ (get_descriptor(obj, key));
			const getter = desc.get;
			if (getter !== undefined) {
				define_property(merged_props, key, {
					enumerable: true,
					configurable: true,
					get: getter
				});
			} else if (desc.get !== undefined) {
				merged_props[key] = obj[key];
			} else {
				define_property(merged_props, key, {
					enumerable: true,
					configurable: true,
					value: obj[key]
				});
			}
		}
	}
	return merged_props;
}

/**
 * @template V
 * @param {V} value
 * @returns {import('./types.js').UnwrappedSignal<V>}
 */
export function unwrap(value) {
	if (is_signal(value)) {
		// @ts-ignore
		return get(value);
	}
	// @ts-ignore
	return value;
}

/**
 * Mounts the given component to the given target and returns a handle to the component's public accessors
 * as well as a `$set` and `$destroy` method to update the props of the component or destroy it.
 *
 * If you don't need to interact with the component after mounting, use `mount` instead to save some bytes.
 *
 * @template {Record<string, any>} Props
 * @template {Record<string, any> | undefined} Exports
 * @template {Record<string, any>} Events
 * @param {import('../../main/public.js').SvelteComponent<Props, Events>} component
 * @param {{
 * 		target: Node;
 * 		props?: Props;
 *  	context?: Map<any, any>;
 * 		intro?: boolean;
 * 		immutable?: boolean;
 * 		recover?: false;
 * 	}} options
 * @returns {Exports & { $destroy: () => void; $set: (props: Partial<Props>) => void; }}
 */
export function createRoot(component, options) {
	// The following definitions aren't duplicative. We need _sources to update single props and
	// _props in case the component uses $$props / $$restProps / const { x, ...rest } = $props().
	/** @type {any} */
	const _props = {};
	/** @type {any} */
	const _sources = {};

	/**
	 * @param {string} name
	 * @param {any} value
	 */
	function add_prop(name, value) {
		const prop = source(
			value,
			options.immutable
				? /**
				   * @param {any} a
				   * @param {any} b
				   */ (a, b) => a === b
				: safe_equal
		);
		_sources[name] = prop;
		define_property(_props, name, {
			get() {
				return get(prop);
			},
			enumerable: true
		});
	}

	for (const prop in options.props || {}) {
		add_prop(
			prop,
			// @ts-expect-error TS doesn't understand this properly
			options.props[prop]
		);
	}

	// The proxy ensures that we can add new signals on the fly when a prop signal is accessed from within the component
	// but no corresponding prop value was set from the outside. The whole things becomes a _propsSignal
	// so that adding new props is reflected in the component if it uses $$props or $$restProps.
	const props_proxy = new Proxy(_props, {
		/**
		 * @param {any} target
		 * @param {any} property
		 */
		get: (target, property) => {
			if (typeof property !== 'string') return target[property];
			if (!(property in _sources)) {
				add_prop(property, undefined);
			}
			return _props[property];
		}
	});
	const props_source = source(
		props_proxy,
		// We're resetting the same proxy instance for updates, therefore bypass equality checks
		() => false
	);

	let [accessors, $destroy] = mount(component, {
		...options,
		// @ts-expect-error We hide the "the props object could be a signal" fact from the public typings
		props: props_source
	});

	const result =
		/** @type {Exports & { $destroy: () => void; $set: (props: Partial<Props>) => void; }} */ ({
			$set: (props) => {
				for (const [prop, value] of Object.entries(props)) {
					if (prop in _sources) {
						set(_sources[prop], value);
					} else {
						add_prop(prop, value);
						set(props_source, props_proxy);
					}
				}
			},
			$destroy
		});

	for (const key of Object.keys(accessors || {})) {
		define_property(result, key, {
			get() {
				// @ts-expect-error TS doesn't know key exists on accessor
				return accessors[key];
			},
			/** @param {any} value */
			set(value) {
				// @ts-expect-error TS doesn't know key exists on accessor
				accessors[key] = value;
			},
			enumerable: true
		});
	}

	return result;
}

/**
 * Mounts the given component to the given target and returns the accessors of the component and a function to destroy it.
 *
 * If you need to interact with the component after mounting, use `create` instead.
 *
 * @template {Record<string, any>} Props
 * @template {Record<string, any> | undefined} Exports
 * @template {Record<string, any>} Events
 * @param {import('../../main/public.js').SvelteComponent<Props, Events>} component
 * @param {{
 * 		target: Node;
 * 		props?: Props;
 * 		events?: Events;
 *  	context?: Map<any, any>;
 * 		intro?: boolean;
 * 		immutable?: boolean;
 * 		recover?: false;
 * 	}} options
 * @returns {[Exports, () => void]}
 */
export function mount(component, options) {
	init_operations();
	const registered_events = new Set();
	const container = options.target;
	const block = create_root_block(options.intro || false);
	const first_child = /** @type {ChildNode} */ (container.firstChild);
	const hydration_fragment = get_hydration_fragment(first_child);
	const previous_hydration_fragment = current_hydration_fragment;

	/** @type {Exports} */
	// @ts-expect-error will be defined because the render effect runs synchronously
	let accessors = undefined;

	try {
		/** @type {null | Text} */
		let anchor = null;
		if (hydration_fragment === null) {
			anchor = empty();
			container.appendChild(anchor);
		}
		set_current_hydration_fragment(hydration_fragment);
		const effect = render_effect(
			() => {
				if (options.context) {
					push({});
					/** @type {import('../client/types.js').ComponentContext} */ (
						current_component_context
					).c = options.context;
				}
				// @ts-expect-error the public typings are not what the actual function looks like
				accessors = component(anchor, options.props || {}, options.events || {});
				if (options.context) {
					pop();
				}
			},
			block,
			true
		);
		block.e = effect;
	} catch (error) {
		if (options.recover !== false && hydration_fragment !== null) {
			// eslint-disable-next-line no-console
			console.error(
				'Hydration failed because the initial UI does not match what was rendered on the server.',
				error
			);
			remove(hydration_fragment);
			first_child.remove();
			hydration_fragment.at(-1)?.nextSibling?.remove();
			return mount(component, options);
		} else {
			throw error;
		}
	} finally {
		set_current_hydration_fragment(previous_hydration_fragment);
	}
	const bound_event_listener = handle_event_propagation.bind(null, container);

	/** @param {Array<string>} events */
	const event_handle = (events) => {
		for (let i = 0; i < events.length; i++) {
			const event_name = events[i];
			if (!registered_events.has(event_name)) {
				registered_events.add(event_name);
				container.addEventListener(
					event_name,
					bound_event_listener,
					PassiveDelegatedEvents.includes(event_name)
						? {
								passive: true
						  }
						: undefined
				);
			}
		}
	};
	event_handle(array_from(all_registerd_events));
	root_event_handles.add(event_handle);

	return [
		accessors,
		() => {
			for (const event_name of registered_events) {
				container.removeEventListener(event_name, bound_event_listener);
			}
			root_event_handles.delete(event_handle);
			const dom = block.d;
			if (dom !== null) {
				remove(dom);
			}
			if (hydration_fragment !== null) {
				remove(hydration_fragment);
			}
			destroy_signal(/** @type {import('./types.js').EffectSignal} */ (block.e));
		}
	];
}

/**
 * @param {Record<string, unknown>} props
 * @returns {void}
 */
export function access_props(props) {
	for (const prop in props) {
		// eslint-disable-next-line no-unused-expressions
		props[prop];
	}
}

/**
 * @param {import('./types.js').MaybeSignal<Record<string, any>>} props
 * @returns {Record<string, any>}
 */
export function sanitize_slots(props) {
	props = unwrap(props);
	const sanitized = { ...props.$$slots };
	if (props.children) sanitized.default = props.children;
	return sanitized;
}

/**
 * @param {() => void} create_snippet
 * @returns {void}
 */
export function snippet_effect(create_snippet) {
	const block = create_snippet_block();
	render_effect(() => {
		create_snippet();
		return () => {
			if (block.d !== null) {
				remove(block.d);
			}
		};
	}, block);
}

/**
 * @param {Node} target
 * @param {string} style_sheet_id
 * @param {string} styles
 */
export async function append_styles(target, style_sheet_id, styles) {
	// Wait a tick so that the template is added to the dom, else getRootNode() will yield wrong results
	// If it turns out that this results in noticeable flickering, we need to do something like doing the
	// append outside and adding code in mount that appends all stylesheets (similar to how we do it with event delegation)
	await Promise.resolve();
	const append_styles_to = get_root_for_style(target);
	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = create_element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_child(/** @type {Document} */ (append_styles_to).head || append_styles_to, style);
	}
}

/**
 * @param {Node} node
 */
function get_root_for_style(node) {
	if (!node) return document;
	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && /** @type {ShadowRoot} */ (root).host) {
		return /** @type {ShadowRoot} */ (root);
	}
	return /** @type {Document} */ (node.ownerDocument);
}
