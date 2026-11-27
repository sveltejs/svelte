import { render_effect, teardown } from '../../../reactivity/effects.js';
import { untrack } from '../../../runtime.js';
import { set_custom_element_data } from '../attributes.js';
import { queue_micro_task } from '../../task.js';
import { get_custom_element_change_event, listen, without_reactive_context } from './shared.js';

/**
 * @param {'innerHTML' | 'textContent' | 'innerText'} property
 * @param {HTMLElement} element
 * @param {() => unknown} get
 * @param {(value: unknown) => void} set
 * @returns {void}
 */
export function bind_content_editable(property, element, get, set = get) {
	element.addEventListener('input', () => {
		// @ts-ignore
		set(element[property]);
	});

	render_effect(() => {
		var value = get();

		if (element[property] !== value) {
			if (value == null) {
				// @ts-ignore
				var non_null_value = element[property];
				set(non_null_value);
			} else {
				// @ts-ignore
				element[property] = value + '';
			}
		}
	});
}

/**
 * @param {string} property
 * @param {string} event_name
 * @param {Element} element
 * @param {(value: unknown) => void} set
 * @param {() => unknown} [get]
 * @returns {void}
 */
export function bind_property(property, event_name, element, set, get) {
	var handler = () => {
		// @ts-ignore
		set(element[property]);
	};

	element.addEventListener(event_name, handler);

	if (get) {
		render_effect(() => {
			// @ts-ignore
			element[property] = get();
		});
	} else {
		handler();
	}

	// @ts-ignore
	if (element === document.body || element === window || element === document) {
		teardown(() => {
			element.removeEventListener(event_name, handler);
		});
	}
}

/**
 * `bind:foo={x}` on a custom element. Sets the `foo` property whenever `x` changes, and
 * updates `x` with the current value of the `foo` property whenever the element dispatches a `foochange` event.
 * In other words, it's sugar for `foo={x} onfoochange={() => x = element.foo}`
 * @param {HTMLElement} element
 * @param {string} property
 * @param {() => unknown} get
 * @param {(value: unknown) => void} [set]
 * @returns {void}
 */
export function bind_custom_element_property(element, property, get, set = get) {
	element.addEventListener(get_custom_element_change_event(property), () => {
		// the element might dispatch the event while one of its own effects is running
		without_reactive_context(() => {
			// @ts-ignore
			set(element[property]);
		});
	});

	render_effect(() => {
		var value = get();

		// don't write back the value we just read from the element
		// @ts-ignore
		if (untrack(() => element[property]) !== value) {
			set_custom_element_data(element, property, value);
		}
	});
}

/**
 * Called when a component that is compiled to a custom element assigns to a `$bindable()` prop. Dispatches a
 * `<name>change` event on the host element, which is what makes `bind:name` work on the custom element.
 * Does nothing if the component isn't rendered as a custom element.
 * @template T
 * @param {Record<string, any>} props
 * @param {string} name
 * @param {T} value The result of the assignment, which is passed through
 * @returns {T}
 */
export function dispatch_custom_event(props, name, value) {
	// neither reading `$$host` nor the event listeners should be tracked by the current reaction
	without_reactive_context(() => {
		/** @type {any} */
		var host = props.$$host;
		if (!host) return;

		var dispatch = () => {
			host.dispatchEvent(
				new CustomEvent(get_custom_element_change_event(name), { detail: host[name] })
			);
		};

		if (host.$$c) {
			dispatch();
		} else {
			// The assignment happened while the custom element is still creating the component, i.e. during
			// initialization. Until that's done, the element's properties don't reflect the component's state
			queue_micro_task(dispatch);
		}
	});

	return value;
}

/**
 * @param {HTMLElement} element
 * @param {(value: unknown) => void} set
 * @returns {void}
 */
export function bind_focused(element, set) {
	listen(element, ['focus', 'blur'], () => {
		set(element === document.activeElement);
	});
}
