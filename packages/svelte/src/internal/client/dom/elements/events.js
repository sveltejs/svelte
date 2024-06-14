import { teardown } from '../../reactivity/effects.js';
import { all_registered_events, root_event_handles } from '../../render.js';
import { define_property, is_array } from '../../utils.js';
import { hydrating } from '../hydration.js';
import { queue_micro_task } from '../task.js';

/**
 * SSR adds onload and onerror attributes to catch those events before the hydration.
 * This function detects those cases, removes the attributes and replays the events.
 * @param {HTMLElement} dom
 */
export function replay_events(dom) {
	if (!hydrating) return;

	if (dom.onload) {
		dom.removeAttribute('onload');
	}
	if (dom.onerror) {
		dom.removeAttribute('onerror');
	}
	// @ts-expect-error
	const event = dom.__e;
	if (event !== undefined) {
		// @ts-expect-error
		dom.__e = undefined;
		queueMicrotask(() => {
			if (dom.isConnected) {
				dom.dispatchEvent(event);
			}
		});
	}
}

/**
 * @param {string} event_name
 * @param {Element} dom
 * @param {EventListener} handler
 * @param {AddEventListenerOptions} options
 */
export function create_event(event_name, dom, handler, options) {
	/**
	 * @this {EventTarget}
	 */
	function target_handler(/** @type {Event} */ event) {
		if (!options.capture) {
			// Only call in the bubble phase, else delegated events would be called before the capturing events
			handle_event_propagation(dom, event);
		}
		if (!event.cancelBubble) {
			return handler.call(this, event);
		}
	}

	// Chrome has a bug where pointer events don't work when attached to a DOM element that has been cloned
	// with cloneNode() and the DOM element is disconnected from the document. To ensure the event works, we
	// defer the attachment till after it's been appended to the document. TODO: remove this once Chrome fixes
	// this bug. The same applies to wheel events.
	if (event_name.startsWith('pointer') || event_name === 'wheel') {
		queue_micro_task(() => {
			dom.addEventListener(event_name, target_handler, options);
		});
	} else {
		dom.addEventListener(event_name, target_handler, options);
	}

	return target_handler;
}

/**
 * Attaches an event handler to an element and returns a function that removes the handler. Using this
 * rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
 * (with attributes like `onclick`), which use event delegation for performance reasons
 *
 * @param {Element} element
 * @param {string} type
 * @param {EventListener} handler
 * @param {AddEventListenerOptions} [options]
 */
export function on(element, type, handler, options = {}) {
	var target_handler = create_event(type, element, handler, options);

	return () => {
		element.removeEventListener(type, target_handler, options);
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
	var options = { capture, passive };
	var target_handler = create_event(event_name, dom, handler, options);

	// @ts-ignore
	if (dom === document.body || dom === window || dom === document) {
		teardown(() => {
			dom.removeEventListener(event_name, target_handler, options);
		});
	}
}

/**
 * @param {Array<string>} events
 * @returns {void}
 */
export function delegate(events) {
	for (var i = 0; i < events.length; i++) {
		all_registered_events.add(events[i]);
	}

	for (var fn of root_event_handles) {
		fn(events);
	}
}

/**
 * @param {Node} handler_element
 * @param {Event} event
 * @returns {void}
 */
export function handle_event_propagation(handler_element, event) {
	var owner_document = handler_element.ownerDocument;
	var event_name = event.type;
	var path = event.composedPath?.() || [];
	var current_target = /** @type {null | Element} */ (path[0] || event.target);

	// composedPath contains list of nodes the event has propagated through.
	// We check __root to skip all nodes below it in case this is a
	// parent of the __root node, which indicates that there's nested
	// mounted apps. In this case we don't want to trigger events multiple times.
	var path_idx = 0;

	// @ts-expect-error is added below
	var handled_at = event.__root;

	if (handled_at) {
		var at_idx = path.indexOf(handled_at);
		if (
			at_idx !== -1 &&
			(handler_element === document || handler_element === /** @type {any} */ (window))
		) {
			// This is the fallback document listener or a window listener, but the event was already handled
			// -> ignore, but set handle_at to document/window so that we're resetting the event
			// chain in case someone manually dispatches the same event object again.
			// @ts-expect-error
			event.__root = handler_element;
			return;
		}

		// We're deliberately not skipping if the index is higher, because
		// someone could create an event programmatically and emit it multiple times,
		// in which case we want to handle the whole propagation chain properly each time.
		// (this will only be a false negative if the event is dispatched multiple times and
		// the fallback document listener isn't reached in between, but that's super rare)
		var handler_idx = path.indexOf(handler_element);
		if (handler_idx === -1) {
			// handle_idx can theoretically be -1 (happened in some JSDOM testing scenarios with an event listener on the window object)
			// so guard against that, too, and assume that everything was handled at this point.
			return;
		}

		if (at_idx <= handler_idx) {
			path_idx = at_idx;
		}
	}

	current_target = /** @type {Element} */ (path[path_idx] || event.target);
	// there can only be one delegated event per element, and we either already handled the current target,
	// or this is the very first target in the chain which has a non-delegated listener, in which case it's safe
	// to handle a possible delegated event on it later (through the root delegation listener for example).
	if (current_target === handler_element) return;

	// Proxy currentTarget to correct target
	define_property(event, 'currentTarget', {
		configurable: true,
		get() {
			return current_target || owner_document;
		}
	});

	try {
		/**
		 * @type {unknown}
		 */
		var throw_error;
		/**
		 * @type {unknown[]}
		 */
		var other_errors = [];

		while (current_target !== null) {
			/** @type {null | Element} */
			var parent_element =
				current_target.parentNode || /** @type {any} */ (current_target).host || null;

			try {
				// @ts-expect-error
				var delegated = current_target['__' + event_name];

				if (delegated !== undefined && !(/** @type {any} */ (current_target).disabled)) {
					if (is_array(delegated)) {
						var [fn, ...data] = delegated;
						fn.apply(current_target, [event, ...data]);
					} else {
						delegated.call(current_target, event);
					}
				}
			} catch (error) {
				if (throw_error) {
					other_errors.push(error);
				} else {
					throw_error = error;
				}
			}
			if (event.cancelBubble || parent_element === handler_element || parent_element === null) {
				break;
			}
			current_target = parent_element;
		}

		if (throw_error) {
			for (let error of other_errors) {
				// Throw the rest of the errors, one-by-one on a microtask
				queueMicrotask(() => {
					throw error;
				});
			}
			throw throw_error;
		}
	} finally {
		// @ts-expect-error is used above
		event.__root = handler_element;
		// @ts-expect-error is used above
		current_target = handler_element;
	}
}
