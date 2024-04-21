import { render_effect } from '../../reactivity/effects.js';
import { all_registered_events, root_event_handles } from '../../render.js';
import { define_property, is_array } from '../../utils.js';

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

	/**
	 * @this {EventTarget}
	 */
	function target_handler(/** @type {Event} */ event) {
		if (!capture) {
			// Only call in the bubble phase, else delegated events would be called before the capturing events
			handle_event_propagation(dom, event);
		}
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
			return current_target || owner_document;
		}
	});

	while (current_target !== null) {
		/** @type {null | Element} */
		var parent_element =
			current_target.parentNode || /** @type {any} */ (current_target).host || null;
		var internal_prop_name = '__' + event_name;
		// @ts-ignore
		var delegated = current_target[internal_prop_name];

		if (delegated !== undefined && !(/** @type {any} */ (current_target).disabled)) {
			if (is_array(delegated)) {
				var [fn, ...data] = delegated;
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
