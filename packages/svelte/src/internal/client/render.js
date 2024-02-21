import { DEV } from 'esm-env';
import {
	append_child,
	child,
	clone_node,
	create_element,
	empty,
	init_operations,
	map_get,
	map_set,
	set_class_name
} from './operations.js';
import {
	create_root_block,
	create_dynamic_element_block,
	create_head_block,
	create_dynamic_component_block,
	create_snippet_block
} from './block.js';
import {
	PassiveDelegatedEvents,
	DelegatedEvents,
	AttributeAliases,
	namespace_svg,
	PROPS_IS_IMMUTABLE,
	PROPS_IS_RUNES,
	PROPS_IS_UPDATED,
	PROPS_IS_LAZY_INITIAL
} from '../../constants.js';
import {
	create_fragment_from_html,
	create_fragment_with_script_from_html,
	insert,
	reconcile_html,
	remove
} from './reconciler.js';
import {
	destroy_signal,
	is_signal,
	push_destroy_fn,
	execute_effect,
	untrack,
	flush_sync,
	current_block,
	push,
	pop,
	current_component_context,
	deep_read,
	get,
	set,
	is_signals_recorded,
	inspect_fn
} from './runtime.js';
import {
	render_effect,
	effect,
	managed_effect,
	derived,
	pre_effect,
	user_effect
} from './reactivity/computations.js';
import {
	current_hydration_fragment,
	get_hydration_fragment,
	hydrate_block_anchor,
	hydrating,
	set_current_hydration_fragment
} from './hydration.js';
import {
	array_from,
	define_property,
	get_descriptor,
	get_descriptors,
	is_array,
	is_function,
	object_assign
} from './utils.js';
import { run } from '../common.js';
import { bind_transition, trigger_transitions } from './transitions.js';
import { mutable_source, source } from './reactivity/sources.js';
import { safe_equal, safe_not_equal } from './reactivity/equality.js';
import { STATE_SYMBOL } from './constants.js';

/** @type {Set<string>} */
const all_registerd_events = new Set();

/** @type {Set<(events: Array<string>) => void>} */
const root_event_handles = new Set();

/**
 * @param {string} html
 * @param {boolean} return_fragment
 * @returns {() => Node}
 */
/*#__NO_SIDE_EFFECTS__*/
export function template(html, return_fragment) {
	/** @type {undefined | Node} */
	let cached_content;
	return () => {
		if (cached_content === undefined) {
			const content = create_fragment_from_html(html);
			cached_content = return_fragment ? content : /** @type {Node} */ (child(content));
		}
		return cached_content;
	};
}

/**
 * @param {string} html
 * @param {boolean} return_fragment
 * @returns {() => Node}
 */
/*#__NO_SIDE_EFFECTS__*/
export function template_with_script(html, return_fragment) {
	/** @type {undefined | Node} */
	let cached_content;
	return () => {
		if (cached_content === undefined) {
			const content = create_fragment_with_script_from_html(html);
			cached_content = return_fragment ? content : /** @type {Node} */ (child(content));
		}
		return cached_content;
	};
}

/**
 * @param {string} svg
 * @param {boolean} return_fragment
 * @returns {() => Node}
 */
/*#__NO_SIDE_EFFECTS__*/
export function svg_template(svg, return_fragment) {
	/** @type {undefined | Node} */
	let cached_content;
	return () => {
		if (cached_content === undefined) {
			const content = /** @type {Node} */ (child(create_fragment_from_html(`<svg>${svg}</svg>`)));
			cached_content = return_fragment ? content : /** @type {Node} */ (child(content));
		}
		return cached_content;
	};
}

/**
 * @param {string} svg
 * @param {boolean} return_fragment
 * @returns {() => Node}
 */
/*#__NO_SIDE_EFFECTS__*/
export function svg_template_with_script(svg, return_fragment) {
	/** @type {undefined | Node} */
	let cached_content;
	return () => {
		if (cached_content === undefined) {
			const content = /** @type {Node} */ (child(create_fragment_from_html(`<svg>${svg}</svg>`)));
			cached_content = return_fragment ? content : /** @type {Node} */ (child(content));
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
 * @param {() => Node} [template_element_fn]
 * @returns {Element | DocumentFragment | Node[]}
 */
function open_template(is_fragment, use_clone_node, anchor, template_element_fn) {
	if (hydrating) {
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
 * @param {() => Node} [template_element_fn]
 * @returns {Element | DocumentFragment | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function open(anchor, use_clone_node, template_element_fn) {
	return open_template(false, use_clone_node, anchor, template_element_fn);
}

/**
 * @param {null | Text | Comment | Element} anchor
 * @param {boolean} use_clone_node
 * @param {() => Node} [template_element_fn]
 * @returns {Element | DocumentFragment | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function open_frag(anchor, use_clone_node, template_element_fn) {
	return open_template(true, use_clone_node, anchor, template_element_fn);
}

const space_template = template(' ', false);
const comment_template = template('<!>', true);

/**
 * @param {Text | Comment | Element | null} anchor
 */
/*#__NO_SIDE_EFFECTS__*/
export function space_frag(anchor) {
	/** @type {Node | null} */
	var node = /** @type {any} */ (open(anchor, true, space_template));
	// if an {expression} is empty during SSR, there might be no
	// text node to hydrate (or an anchor comment is falsely detected instead)
	//  — we must therefore create one
	if (hydrating && node?.nodeType !== 3) {
		node = empty();
		// @ts-ignore in this case the anchor should always be a comment,
		// if not something more fundamental is wrong and throwing here is better to bail out early
		anchor.before(node);
	}
	return node;
}

/**
 * @param {Text | Comment | Element} anchor
 */
/*#__NO_SIDE_EFFECTS__*/
export function space(anchor) {
	// if an {expression} is empty during SSR, there might be no
	// text node to hydrate (or an anchor comment is falsely detected instead)
	//  — we must therefore create one
	if (hydrating && anchor.nodeType !== 3) {
		const node = empty();
		anchor.before(node);
		return node;
	}
	return anchor;
}

/**
 * @param {null | Text | Comment | Element} anchor
 */
/*#__NO_SIDE_EFFECTS__*/
export function comment(anchor) {
	return open_frag(anchor, true, comment_template);
}

/**
 * Assign the created (or in hydration mode, traversed) dom elements to the current block
 * and insert the elements into the dom (in client mode).
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
	if (!hydrating && anchor !== null) {
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
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function trusted(fn) {
	return function (...args) {
		const event = /** @type {Event} */ (args[0]);
		if (event.isTrusted) {
			// @ts-ignore
			fn.apply(this, args);
		}
	};
}

/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function self(fn) {
	return function (...args) {
		const event = /** @type {Event} */ (args[0]);
		// @ts-ignore
		if (event.target === this) {
			// @ts-ignore
			fn.apply(this, args);
		}
	};
}

/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function stopPropagation(fn) {
	return function (...args) {
		const event = /** @type {Event} */ (args[0]);
		event.stopPropagation();
		// @ts-ignore
		return fn.apply(this, args);
	};
}

/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
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
		return fn.apply(this, args);
	};
}

/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function stopImmediatePropagation(fn) {
	return function (...args) {
		const event = /** @type {Event} */ (args[0]);
		event.stopImmediatePropagation();
		// @ts-ignore
		return fn.apply(this, args);
	};
}

/**
 * @param {(event: Event, ...args: Array<unknown>) => void} fn
 * @returns {(event: Event, ...args: unknown[]) => void}
 */
export function preventDefault(fn) {
	return function (...args) {
		const event = /** @type {Event} */ (args[0]);
		event.preventDefault();
		// @ts-ignore
		return fn.apply(this, args);
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
	/**
	 * @this {EventTarget}
	 */
	function target_handler(/** @type {Event} */ event) {
		handle_event_propagation(dom, event);
		if (!event.cancelBubble) {
			return handler.call(this, event);
		}
	}
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
	if (hydrating && dom.className === next_class_name) {
		// In case of hydration don't reset the class as it's already correct.
		// @ts-expect-error need to add __className to patched prototype
		dom.__className = next_class_name;
	} else if (
		prev_class_name !== next_class_name ||
		(hydrating && dom.className !== next_class_name)
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
	render_effect(() => text(dom, value()));
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
	if (hydrating && dom.nodeValue === next_node_value) {
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
 * @param {Element} dom
 * @param {string} class_name
 * @param {() => boolean} value
 * @returns {void}
 */
export function class_toggle_effect(dom, class_name, value) {
	render_effect(() => {
		const string = value();
		class_toggle(dom, class_name, string);
	});
}

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
		// @ts-ignore
		if (select != null && dom.__value === select.__value) {
			// never set to false, since this causes browser to select default option
			dom.selected = true;
		}
	});
}

/**
 * @param {HTMLInputElement} dom
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_value(dom, get_value, update) {
	dom.addEventListener('input', () => {
		/** @type {any} */
		let value = dom.value;
		if (is_numberlike_input(dom)) {
			value = to_number(value);
		}
		update(value);
	});

	render_effect(() => {
		const value = get_value();
		// @ts-ignore
		dom.__value = value;

		if (is_numberlike_input(dom) && value === to_number(dom.value)) {
			// handles 0 vs 00 case (see https://github.com/sveltejs/svelte/issues/9959)
			return;
		}

		dom.value = stringify(value);
	});
}

/**
 * @param {HTMLInputElement} dom
 */
function is_numberlike_input(dom) {
	const type = dom.type;
	return type === 'number' || type === 'range';
}

/**
 * @param {string} value
 */
function to_number(value) {
	return value === '' ? null : +value;
}

/**
 * @param {HTMLSelectElement} dom
 * @param {() => unknown} get_value
 * @param {(value: unknown) => void} update
 * @returns {void}
 */
export function bind_select_value(dom, get_value, update) {
	let mounting = true;
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
		let value = get_value();
		select_option(dom, value, mounting);
		if (mounting && value === undefined) {
			/** @type {HTMLOptionElement | null} */
			let selected_option = dom.querySelector(':checked');
			if (selected_option !== null) {
				value = get_option_value(selected_option);
				update(value);
			}
		}
		// @ts-ignore
		dom.__value = value;
		mounting = false;
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
 * @param {unknown} value
 */
function is_state_object(value) {
	return value != null && typeof value === 'object' && STATE_SYMBOL in value;
}

/**
 * @param {Element} element_or_component
 * @param {(value: unknown) => void} update
 * @param {import('./types.js').MaybeSignal} binding
 * @returns {void}
 */
export function bind_this(element_or_component, update, binding) {
	render_effect(() => {
		// If we are reading from a proxied state binding, then we don't need to untrack
		// the update function as it will be fine-grain.
		if (is_state_object(binding) || (is_signal(binding) && is_state_object(binding.v))) {
			update(element_or_component);
		} else {
			untrack(() => update(element_or_component));
		}
		return () => {
			// Defer to the next tick so that all updates can be reconciled first.
			// This solves the case where one variable is shared across multiple this-bindings.
			render_effect(() => {
				untrack(() => {
					if (!is_signal(binding) || binding.v === element_or_component) {
						update(null);
					}
				});
			});
		};
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
 * @param {Node} handler_element
 * @param {Event} event
 * @returns {void}
 */
function handle_event_propagation(handler_element, event) {
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
	let path_idx = 0;
	// @ts-expect-error is added below
	const handled_at = event.__root;
	if (handled_at) {
		const at_idx = path.indexOf(handled_at);
		if (at_idx !== -1 && handler_element === document) {
			// This is the fallback document listener but the event was already handled
			// -> ignore, but set handle_at to document so that we're resetting the event
			// chain in case someone manually dispatches the same event object again.
			// @ts-expect-error
			event.__root = document;
			return;
		}
		// We're deliberately not skipping if the index is higher, because
		// someone could create an event programmatically and emit it multiple times,
		// in which case we want to handle the whole propagation chain properly each time.
		// (this will only be a false negative if the event is dispatched multiple times and
		// the fallback document listener isn't reached in between, but that's super rare)
		const handler_idx = path.indexOf(handler_element);
		if (handler_idx === -1) {
			// handle_idx can theoretically be -1 (happened in some JSDOM testing scenarios with an event listener on the window object)
			// so guard against that, too, and assume that everything was handled at this point.
			return;
		}
		if (at_idx <= handler_idx) {
			// +1 because at_idx is the element which was already handled, and there can only be one delegated event per element.
			// Avoids on:click and onclick on the same event resulting in onclick being fired twice.
			path_idx = at_idx + 1;
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
		if (
			event.cancelBubble ||
			parent_element === handler_element ||
			current_target === handler_element
		) {
			break;
		}
		current_target = parent_element;
	}

	// @ts-expect-error is used above
	event.__root = handler_element;
	// @ts-expect-error is used above
	current_target = handler_element;
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
 * @param {(anchor: Node | null) => void} render_fn
 * @returns {void}
 */
export function head(render_fn) {
	const block = create_head_block();
	// The head function may be called after the first hydration pass and ssr comment nodes may still be present,
	// therefore we need to skip that when we detect that we're not in hydration mode.
	let hydration_fragment = null;
	let previous_hydration_fragment = null;
	let is_hydrating = hydrating;
	if (is_hydrating) {
		hydration_fragment = get_hydration_fragment(document.head.firstChild);
		previous_hydration_fragment = current_hydration_fragment;
		set_current_hydration_fragment(hydration_fragment);
	}

	try {
		const head_effect = render_effect(
			() => {
				const current = block.d;
				if (current !== null) {
					remove(current);
					block.d = null;
				}
				let anchor = null;
				if (!hydrating) {
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
		if (is_hydrating) {
			set_current_hydration_fragment(previous_hydration_fragment);
		}
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
 * @param {boolean | null} is_svg `null` == not statically known
 * @param {undefined | ((element: Element, anchor: Node) => void)} render_fn
 * @returns {void}
 */
export function element(anchor_node, tag_fn, is_svg, render_fn) {
	const block = create_dynamic_element_block();
	hydrate_block_anchor(anchor_node);
	let has_mounted = false;

	/** @type {string} */
	let tag;

	/** @type {null | Element} */
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
			// We try our best infering the namespace in case it's not possible to determine statically,
			// but on the first render on the client (without hydration) the parent will be undefined,
			// since the anchor is not attached to its parent / the dom yet.
			const ns =
				is_svg || tag === 'svg'
					? namespace_svg
					: is_svg === false || anchor_node.parentElement?.tagName === 'foreignObject'
						? null
						: anchor_node.parentElement?.namespaceURI ?? null;
			const next_element = tag
				? hydrating
					? /** @type {Element} */ (current_hydration_fragment[0])
					: ns
						? document.createElementNS(ns, tag)
						: document.createElement(tag)
				: null;
			const prev_element = element;
			if (prev_element !== null) {
				block.d = null;
			}
			element = next_element;
			if (element !== null && render_fn !== undefined) {
				let anchor;
				if (hydrating) {
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
					// If the current render has changed since, then we can remove the old render
					// effect as it's stale.
					if (current_render !== render && render.e !== null) {
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
	if (hydrating) {
		// Hydration: css props element is surrounded by a ssr comment ...
		tag = /** @type {HTMLElement | SVGElement} */ (current_hydration_fragment[0]);
		// ... and the child(ren) of the css props element is also surround by a ssr comment
		component_anchor = /** @type {Comment} */ (tag.firstChild);
	} else {
		if (is_html) {
			tag = document.createElement('div');
			tag.style.display = 'contents';
		} else {
			tag = document.createElementNS(namespace_svg, 'g');
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
 * @param {() => import('./types.js').TransitionFn<P | undefined>} get_transition_fn
 * @param {(() => P) | null} props
 * @param {any} global
 * @returns {void}
 */
export function transition(dom, get_transition_fn, props, global = false) {
	bind_transition(dom, get_transition_fn, props, 'both', global);
}

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {() => import('./types.js').TransitionFn<P | undefined>} get_transition_fn
 * @param {(() => P) | null} props
 * @returns {void}
 */
export function animate(dom, get_transition_fn, props) {
	bind_transition(dom, get_transition_fn, props, 'key', false);
}

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {() => import('./types.js').TransitionFn<P | undefined>} get_transition_fn
 * @param {(() => P) | null} props
 * @param {any} global
 * @returns {void}
 */
function in_fn(dom, get_transition_fn, props, global = false) {
	bind_transition(dom, get_transition_fn, props, 'in', global);
}
export { in_fn as in };

/**
 * @template P
 * @param {HTMLElement} dom
 * @param {() => import('./types.js').TransitionFn<P | undefined>} get_transition_fn
 * @param {(() => P) | null} props
 * @param {any} global
 * @returns {void}
 */
export function out(dom, get_transition_fn, props, global = false) {
	bind_transition(dom, get_transition_fn, props, 'out', global);
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
			let needs_deep_read = false;
			untrack(() => {
				if (payload === undefined) {
					payload = action(dom, value) || {};
					needs_deep_read = !!payload?.update;
				} else {
					const update = payload.update;
					if (typeof update === 'function') {
						update(value);
					}
				}
			});
			// Action's update method is coarse-grained, i.e. when anything in the passed value changes, update.
			// This works in legacy mode because of mutable_source being updated as a whole, but when using $state
			// together with actions and mutation, it wouldn't notice the change without a deep read.
			if (needs_deep_read) {
				deep_read(value);
			}
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
	if (hydrating) {
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
	if (hydrating && dom.firstChild !== null) {
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
		!hydrating ||
		(dom.getAttribute(attribute) !== value &&
			// If we reset those, they would result in another network request, which we want to avoid.
			// We assume they are the same between client and server as checking if they are equal is expensive
			// (we can't just compare the strings as they can be different between client and server but result in the
			// same url, so we would need to create hidden anchor elements to compare them)
			attribute !== 'src' &&
			attribute !== 'href' &&
			attribute !== 'srcset')
	) {
		if (value === null) {
			dom.removeAttribute(attribute);
		} else {
			dom.setAttribute(attribute, value);
		}
	}
}

/**
 * @param {string} element_src
 * @param {string} url
 * @returns {boolean}
 */
function src_url_equal(element_src, url) {
	if (element_src === url) return true;
	return new URL(element_src, document.baseURI).href === new URL(url, document.baseURI).href;
}

/** @param {string} srcset */
function split_srcset(srcset) {
	return srcset.split(',').map((src) => src.trim().split(' ').filter(Boolean));
}

/**
 * @param {HTMLSourceElement | HTMLImageElement} element
 * @param {string | undefined | null} srcset
 * @returns {boolean}
 */
export function srcset_url_equal(element, srcset) {
	const element_urls = split_srcset(element.srcset);
	const urls = split_srcset(srcset ?? '');

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
	if (!hydrating) return;
	if (attribute !== 'src' && attribute !== 'href' && attribute !== 'srcset') return;

	if (attribute === 'srcset' && srcset_url_equal(dom, value)) return;
	if (src_url_equal(dom.getAttribute(attribute) ?? '', value ?? '')) return;

	// eslint-disable-next-line no-console
	console.error(
		`Detected a ${attribute} attribute value change during hydration. This will not be repaired during hydration, ` +
			`the ${attribute} value that came from the server will be used. Related element:`,
		dom,
		' Differing value:',
		value
	);
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
 * Like `spread_attributes` but self-contained
 * @param {Element & ElementCSSInlineStyle} dom
 * @param {() => Record<string, unknown>[]} attrs
 * @param {boolean} lowercase_attributes
 * @param {string} css_hash
 */
export function spread_attributes_effect(dom, attrs, lowercase_attributes, css_hash) {
	/** @type {Record<string, any> | undefined} */
	let current = undefined;

	render_effect(() => {
		current = spread_attributes(dom, current, attrs(), lowercase_attributes, css_hash);
	});
}

/**
 * Spreads attributes onto a DOM element, taking into account the currently set attributes
 * @param {Element & ElementCSSInlineStyle} dom
 * @param {Record<string, unknown> | undefined} prev
 * @param {Record<string, unknown>[]} attrs
 * @param {boolean} lowercase_attributes
 * @param {string} css_hash
 * @returns {Record<string, unknown>}
 */
export function spread_attributes(dom, prev, attrs, lowercase_attributes, css_hash) {
	const next = object_assign({}, ...attrs);
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

		const prefix = key[0] + key[1]; // this is faster than key.slice(0, 2)
		if (prefix === '$$') continue;

		if (prefix === 'on') {
			/** @type {{ capture?: true }} */
			const opts = {};
			let event_name = key.slice(2);
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
		} else {
			let name = key;
			if (lowercase_attributes) {
				name = name.toLowerCase();
				name = AttributeAliases[name] || name;
			}

			if (setters.includes(name)) {
				if (DEV) {
					check_src_in_dev_hydration(dom, name, value);
				}
				if (
					!hydrating ||
					//  @ts-ignore see attr method for an explanation of src/srcset
					(dom[name] !== value && name !== 'src' && name !== 'href' && name !== 'srcset')
				) {
					// @ts-ignore
					dom[name] = value;
				}
			} else if (typeof value !== 'function') {
				if (has_hash && name === 'class') {
					if (value) value += ' ';
					value += css_hash;
				}

				attr(dom, name, value);
			}
		}
	}
	return next;
}

/**
 * @param {Element} node
 * @param {() => Record<string, unknown>[]} attrs
 * @param {string} css_hash
 */
export function spread_dynamic_element_attributes_effect(node, attrs, css_hash) {
	/** @type {Record<string, any> | undefined} */
	let current = undefined;

	render_effect(() => {
		current = spread_dynamic_element_attributes(node, current, attrs(), css_hash);
	});
}

/**
 * @param {Element} node
 * @param {Record<string, unknown> | undefined} prev
 * @param {Record<string, unknown>[]} attrs
 * @param {string} css_hash
 */
export function spread_dynamic_element_attributes(node, prev, attrs, css_hash) {
	if (node.tagName.includes('-')) {
		const next = object_assign({}, ...attrs);
		for (const key in prev) {
			if (!(key in next)) {
				next[key] = null;
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
			node.namespaceURI !== namespace_svg,
			css_hash
		);
	}
}

/**
 * The proxy handler for rest props (i.e. `const { x, ...rest } = $props()`).
 * Is passed the full `$$props` object and excludes the named props.
 * @type {ProxyHandler<{ props: Record<string | symbol, unknown>, exclude: Array<string | symbol> }>}}
 */
const rest_props_handler = {
	get(target, key) {
		if (target.exclude.includes(key)) return;
		return target.props[key];
	},
	getOwnPropertyDescriptor(target, key) {
		if (target.exclude.includes(key)) return;
		if (key in target.props) {
			return {
				enumerable: true,
				configurable: true,
				value: target.props[key]
			};
		}
	},
	has(target, key) {
		if (target.exclude.includes(key)) return false;
		return key in target.props;
	},
	ownKeys(target) {
		return Reflect.ownKeys(target.props).filter((key) => !target.exclude.includes(key));
	}
};

/**
 * @param {import('./types.js').Signal<Record<string, unknown>> | Record<string, unknown>} props
 * @param {string[]} rest
 * @returns {Record<string, unknown>}
 */
export function rest_props(props, rest) {
	return new Proxy({ props, exclude: rest }, rest_props_handler);
}

/**
 * The proxy handler for spread props. Handles the incoming array of props
 * that looks like `() => { dynamic: props }, { static: prop }, ..` and wraps
 * them so that the whole thing is passed to the component as the `$$props` argument.
 * @template {Record<string | symbol, unknown>} T
 * @type {ProxyHandler<{ props: Array<T | (() => T)> }>}}
 */
const spread_props_handler = {
	get(target, key) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			if (typeof p === 'object' && p !== null && key in p) return p[key];
		}
	},
	getOwnPropertyDescriptor(target, key) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			if (typeof p === 'object' && p !== null && key in p) return get_descriptor(p, key);
		}
	},
	has(target, key) {
		for (let p of target.props) {
			if (is_function(p)) p = p();
			if (key in p) return true;
		}

		return false;
	},
	ownKeys(target) {
		/** @type {Array<string | symbol>} */
		const keys = [];

		for (let p of target.props) {
			if (is_function(p)) p = p();
			for (const key in p) {
				if (!keys.includes(key)) keys.push(key);
			}
		}

		return keys;
	}
};

/**
 * @param {Array<Record<string, unknown> | (() => Record<string, unknown>)>} props
 * @returns {any}
 */
export function spread_props(...props) {
	return new Proxy({ props }, spread_props_handler);
}

// TODO 5.0 remove this
/**
 * @deprecated Use `mount` or `hydrate` instead
 */
export function createRoot() {
	throw new Error(
		'`createRoot` has been removed. Use `mount` or `hydrate` instead. See the updated docs for more info: https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes'
	);
}

/**
 * Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component
 *
 * @template {Record<string, any>} Props
 * @template {Record<string, any>} Exports
 * @template {Record<string, any>} Events
 * @param {import('../../main/public.js').ComponentType<import('../../main/public.js').SvelteComponent<Props, Events>>} component
 * @param {{
 * 		target: Node;
 * 		props?: Props;
 * 		events?: { [Property in keyof Events]: (e: Events[Property]) => any };
 *  	context?: Map<any, any>;
 * 		intro?: boolean;
 * 	}} options
 * @returns {Exports}
 */
export function mount(component, options) {
	init_operations();
	const anchor = empty();
	options.target.appendChild(anchor);
	// Don't flush previous effects to ensure order of outer effects stays consistent
	return flush_sync(() => _mount(component, { ...options, anchor }), false);
}

/**
 * Hydrates a component on the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component
 *
 * @template {Record<string, any>} Props
 * @template {Record<string, any>} Exports
 * @template {Record<string, any>} Events
 * @param {import('../../main/public.js').ComponentType<import('../../main/public.js').SvelteComponent<Props, Events>>} component
 * @param {{
 * 		target: Node;
 * 		props?: Props;
 * 		events?: { [Property in keyof Events]: (e: Events[Property]) => any };
 *  	context?: Map<any, any>;
 * 		intro?: boolean;
 * 		recover?: false;
 * 	}} options
 * @returns {Exports}
 */
export function hydrate(component, options) {
	init_operations();
	const container = options.target;
	const first_child = /** @type {ChildNode} */ (container.firstChild);
	// Call with insert_text == true to prevent empty {expressions} resulting in an empty
	// fragment array, resulting in a hydration error down the line
	const hydration_fragment = get_hydration_fragment(first_child, true);
	const previous_hydration_fragment = current_hydration_fragment;
	set_current_hydration_fragment(hydration_fragment);

	/** @type {null | Text} */
	let anchor = null;
	if (hydration_fragment === null) {
		anchor = empty();
		container.appendChild(anchor);
	}

	let finished_hydrating = false;

	try {
		// Don't flush previous effects to ensure order of outer effects stays consistent
		return flush_sync(() => {
			const instance = _mount(component, { ...options, anchor });
			// flush_sync will run this callback and then synchronously run any pending effects,
			// which don't belong to the hydration phase anymore - therefore reset it here
			set_current_hydration_fragment(null);
			finished_hydrating = true;
			return instance;
		}, false);
	} catch (error) {
		if (!finished_hydrating && options.recover !== false && hydration_fragment !== null) {
			// eslint-disable-next-line no-console
			console.error(
				'ERR_SVELTE_HYDRATION_MISMATCH' +
					(DEV
						? ': Hydration failed because the initial UI does not match what was rendered on the server.'
						: ''),
				error
			);
			remove(hydration_fragment);
			first_child.remove();
			hydration_fragment.at(-1)?.nextSibling?.remove();
			set_current_hydration_fragment(null);
			return mount(component, options);
		} else {
			throw error;
		}
	} finally {
		set_current_hydration_fragment(previous_hydration_fragment);
	}
}

/**
 * @template {Record<string, any>} Props
 * @template {Record<string, any>} Exports
 * @template {Record<string, any>} Events
 * @param {import('../../main/public.js').ComponentType<import('../../main/public.js').SvelteComponent<Props, Events>>} Component
 * @param {{
 * 		target: Node;
 * 		anchor: null | Text;
 * 		props?: Props;
 * 		events?: { [Property in keyof Events]: (e: Events[Property]) => any };
 *  	context?: Map<any, any>;
 * 		intro?: boolean;
 * 		recover?: false;
 * 	}} options
 * @returns {Exports}
 */
function _mount(Component, options) {
	const registered_events = new Set();
	const container = options.target;
	const block = create_root_block(options.intro || false);

	/** @type {Exports} */
	// @ts-expect-error will be defined because the render effect runs synchronously
	let component = undefined;

	const effect = render_effect(
		() => {
			if (options.context) {
				push({});
				/** @type {import('../client/types.js').ComponentContext} */ (current_component_context).c =
					options.context;
			}
			if (!options.props) {
				options.props = /** @type {Props} */ ({});
			}
			if (options.events) {
				// We can't spread the object or else we'd lose the state proxy stuff, if it is one
				/** @type {any} */ (options.props).$$events = options.events;
			}
			component =
				// @ts-expect-error the public typings are not what the actual function looks like
				Component(options.anchor, options.props) || {};
			if (options.context) {
				pop();
			}
		},
		block,
		true
	);
	block.e = effect;
	const bound_event_listener = handle_event_propagation.bind(null, container);
	const bound_document_event_listener = handle_event_propagation.bind(null, document);

	/** @param {Array<string>} events */
	const event_handle = (events) => {
		for (let i = 0; i < events.length; i++) {
			const event_name = events[i];
			if (!registered_events.has(event_name)) {
				registered_events.add(event_name);
				// Add the event listener to both the container and the document.
				// The container listener ensures we catch events from within in case
				// the outer content stops propagation of the event.
				container.addEventListener(
					event_name,
					bound_event_listener,
					PassiveDelegatedEvents.includes(event_name)
						? {
								passive: true
							}
						: undefined
				);
				// The document listener ensures we catch events that originate from elements that were
				// manually moved outside of the container (e.g. via manual portals).
				document.addEventListener(
					event_name,
					bound_document_event_listener,
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

	mounted_components.set(component, () => {
		for (const event_name of registered_events) {
			container.removeEventListener(event_name, bound_event_listener);
		}
		root_event_handles.delete(event_handle);
		const dom = block.d;
		if (dom !== null) {
			remove(dom);
		}
		destroy_signal(/** @type {import('./types.js').EffectSignal} */ (block.e));
	});

	return component;
}

/**
 * References of the components that were mounted or hydrated.
 * Uses a `WeakMap` to avoid memory leaks.
 */
let mounted_components = new WeakMap();

/**
 * Unmounts a component that was previously mounted using `mount` or `hydrate`.
 * @param {Record<string, any>} component
 */
export function unmount(component) {
	const fn = mounted_components.get(component);
	if (DEV && !fn) {
		// eslint-disable-next-line no-console
		console.warn('Tried to unmount a component that was not mounted.');
	}
	fn?.();
}

/**
 * @param {Record<string, any>} props
 * @returns {Record<string, any>}
 */
export function sanitize_slots(props) {
	const sanitized = { ...props.$$slots };
	if (props.children) sanitized.default = props.children;
	return sanitized;
}

/**
 * @param {() => Function} get_snippet
 * @param {Node} node
 * @param {(() => any)[]} args
 * @returns {void}
 */
export function snippet_effect(get_snippet, node, ...args) {
	const block = create_snippet_block();
	render_effect(() => {
		// Only rerender when the snippet function itself changes,
		// not when an eagerly-read prop inside the snippet function changes
		const snippet = get_snippet();
		untrack(() => snippet(node, ...args));
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

/**
 * This function is responsible for synchronizing a possibly bound prop with the inner component state.
 * It is used whenever the compiler sees that the component writes to the prop, or when it has a default prop_value.
 * @template V
 * @param {Record<string, unknown>} props
 * @param {string} key
 * @param {number} flags
 * @param {V | (() => V)} [initial]
 * @returns {(() => V | ((arg: V) => V) | ((arg: V, mutation: boolean) => V))}
 */
export function prop(props, key, flags, initial) {
	var immutable = (flags & PROPS_IS_IMMUTABLE) !== 0;
	var runes = (flags & PROPS_IS_RUNES) !== 0;
	var prop_value = /** @type {V} */ (props[key]);
	var setter = get_descriptor(props, key)?.set;

	if (prop_value === undefined && initial !== undefined) {
		if (setter && runes) {
			// TODO consolidate all these random runtime errors
			throw new Error(
				'ERR_SVELTE_BINDING_FALLBACK' +
					(DEV
						? `: Cannot pass undefined to bind:${key} because the property contains a fallback value. Pass a different value than undefined to ${key}.`
						: '')
			);
		}

		// @ts-expect-error would need a cumbersome method overload to type this
		if ((flags & PROPS_IS_LAZY_INITIAL) !== 0) initial = initial();

		prop_value = /** @type {V} */ (initial);

		if (setter) setter(prop_value);
	}

	var getter = () => {
		var value = /** @type {V} */ (props[key]);
		if (value !== undefined) initial = undefined;
		return value === undefined ? /** @type {V} */ (initial) : value;
	};

	// easy mode — prop is never written to
	if ((flags & PROPS_IS_UPDATED) === 0) {
		return getter;
	}

	// intermediate mode — prop is written to, but the parent component had
	// `bind:foo` which means we can just call `$$props.foo = value` directly
	if (setter) {
		return function (/** @type {V} */ value) {
			if (arguments.length === 1) {
				/** @type {Function} */ (setter)(value);
				return value;
			} else {
				return getter();
			}
		};
	}

	// hard mode. this is where it gets ugly — the value in the child should
	// synchronize with the parent, but it should also be possible to temporarily
	// set the value to something else locally.
	var from_child = false;
	var was_from_child = false;

	// The derived returns the current value. The underlying mutable
	// source is written to from various places to persist this value.
	var inner_current_value = mutable_source(prop_value);
	var current_value = derived(() => {
		var parent_value = getter();
		var child_value = get(inner_current_value);

		if (from_child) {
			from_child = false;
			was_from_child = true;
			return child_value;
		}

		was_from_child = false;
		return (inner_current_value.v = parent_value);
	});

	if (!immutable) current_value.e = safe_equal;

	return function (/** @type {V} */ value, mutation = false) {
		var current = get(current_value);

		// legacy nonsense — need to ensure the source is invalidated when necessary
		// also needed for when handling inspect logic so we can inspect the correct source signal
		if (is_signals_recorded || (DEV && inspect_fn)) {
			// set this so that we don't reset to the parent value if `d`
			// is invalidated because of `invalidate_inner_signals` (rather
			// than because the parent or child value changed)
			from_child = was_from_child;
			// invoke getters so that signals are picked up by `invalidate_inner_signals`
			getter();
			get(inner_current_value);
		}

		if (arguments.length > 0) {
			if (mutation || (immutable ? value !== current : safe_not_equal(value, current))) {
				from_child = true;
				set(inner_current_value, mutation ? current : value);
				get(current_value); // force a synchronisation immediately
			}

			return value;
		}

		return current;
	};
}

/**
 * Legacy-mode only: Call `onMount` callbacks and set up `beforeUpdate`/`afterUpdate` effects
 */
export function init() {
	const context = /** @type {import('./types.js').ComponentContext} */ (current_component_context);
	const callbacks = context.u;

	if (!callbacks) return;

	// beforeUpdate
	pre_effect(() => {
		observe_all(context);
		callbacks.b.forEach(run);
	});

	// onMount (must run before afterUpdate)
	user_effect(() => {
		const fns = untrack(() => callbacks.m.map(run));
		return () => {
			for (const fn of fns) {
				if (typeof fn === 'function') {
					fn();
				}
			}
		};
	});

	// afterUpdate
	user_effect(() => {
		observe_all(context);
		callbacks.a.forEach(run);
	});
}

/**
 * Invoke the getter of all signals associated with a component
 * so they can be registered to the effect this function is called in.
 * @param {import('./types.js').ComponentContext} context
 */
function observe_all(context) {
	if (context.d) {
		for (const signal of context.d) get(signal);
	}

	deep_read(context.s);
}

/**
 * Under some circumstances, imports may be reactive in legacy mode. In that case,
 * they should be using `reactive_import` as part of the transformation
 * @param {() => any} fn
 */
export function reactive_import(fn) {
	const s = source(0);
	return function () {
		if (arguments.length === 1) {
			set(s, get(s) + 1);
			return arguments[0];
		} else {
			get(s);
			return fn();
		}
	};
}

/**
 * @this {any}
 * @param {Record<string, unknown>} $$props
 * @param {Event} event
 * @returns {void}
 */
export function bubble_event($$props, event) {
	var events = /** @type {Record<string, Function[] | Function>} */ ($$props.$$events)?.[
		event.type
	];
	var callbacks = is_array(events) ? events.slice() : events == null ? [] : [events];
	for (var fn of callbacks) {
		// Preserve "this" context
		fn.call(this, event);
	}
}
