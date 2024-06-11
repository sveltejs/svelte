import { DEV } from 'esm-env';
import { hydrating } from '../hydration.js';
import { get_descriptors, get_prototype_of, map_get, map_set } from '../../utils.js';
import {
	AttributeAliases,
	DelegatedEvents,
	is_capture_event,
	namespace_svg
} from '../../../../constants.js';
import { create_event, delegate } from './events.js';
import { add_form_reset_listener, autofocus } from './misc.js';
import * as w from '../../warnings.js';
import { LOADING_ATTR_SYMBOL } from '../../constants.js';
import { queue_idle_task, queue_micro_task } from '../task.js';

/**
 * The value/checked attribute in the template actually corresponds to the defaultValue property, so we need
 * to remove it upon hydration to avoid a bug when someone resets the form value.
 * @param {HTMLInputElement} dom
 * @returns {void}
 */
export function remove_input_attr_defaults(dom) {
	if (hydrating) {
		let already_removed = false;
		// We try and remove the default attributes later, rather than sync during hydration.
		// Doing it sync during hydration has a negative impact on performance, but deferring the
		// work in an idle task alleviates this greatly. If a form reset event comes in before
		// the idle callback, then we ensure the input defaults are cleared just before.
		const remove_defaults = () => {
			if (already_removed) return;
			already_removed = true;
			const value = dom.getAttribute('value');
			set_attribute(dom, 'value', null);
			set_attribute(dom, 'checked', null);
			if (value) dom.value = value;
		};
		// @ts-expect-error
		dom.__on_r = remove_defaults;
		queue_idle_task(remove_defaults);
		add_form_reset_listener();
	}
}

/**
 * @param {Element} element
 * @param {any} value
 */
export function set_value(element, value) {
	// @ts-expect-error
	var attributes = (element.__attributes ??= {});

	if (attributes.value === (attributes.value = value)) return;
	// @ts-expect-error
	element.value = value;
}

/**
 * @param {Element} element
 * @param {boolean} checked
 */
export function set_checked(element, checked) {
	// @ts-expect-error
	var attributes = (element.__attributes ??= {});

	if (attributes.checked === (attributes.checked = checked)) return;
	// @ts-expect-error
	element.checked = checked;
}

/**
 * @param {Element} element
 * @param {string} attribute
 * @param {string | null} value
 */
export function set_attribute(element, attribute, value) {
	value = value == null ? null : value + '';

	// @ts-expect-error
	var attributes = (element.__attributes ??= {});

	if (hydrating) {
		attributes[attribute] = element.getAttribute(attribute);

		if (attribute === 'src' || attribute === 'href' || attribute === 'srcset') {
			check_src_in_dev_hydration(element, attribute, value);

			// If we reset these attributes, they would result in another network request, which we want to avoid.
			// We assume they are the same between client and server as checking if they are equal is expensive
			// (we can't just compare the strings as they can be different between client and server but result in the
			// same url, so we would need to create hidden anchor elements to compare them)
			return;
		}
	}

	if (attributes[attribute] === (attributes[attribute] = value)) return;

	if (attribute === 'loading') {
		// @ts-expect-error
		element[LOADING_ATTR_SYMBOL] = value;
	}

	if (value === null) {
		element.removeAttribute(attribute);
	} else {
		element.setAttribute(attribute, value);
	}
}

/**
 * @param {Element} dom
 * @param {string} attribute
 * @param {string} value
 */
export function set_xlink_attribute(dom, attribute, value) {
	dom.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}

/**
 * @param {any} node
 * @param {string} prop
 * @param {any} value
 */
export function set_custom_element_data(node, prop, value) {
	if (prop in node) {
		var curr_val = node[prop];
		var next_val = typeof curr_val === 'boolean' && value === '' ? true : value;
		if (typeof curr_val !== 'object' || curr_val !== next_val) {
			node[prop] = next_val;
		}
	} else {
		set_attribute(node, prop, value);
	}
}

/**
 * Spreads attributes onto a DOM element, taking into account the currently set attributes
 * @param {Element & ElementCSSInlineStyle} element
 * @param {Record<string, any> | undefined} prev
 * @param {Record<string, any>} next New attributes - this function mutates this object
 * @param {boolean} lowercase_attributes
 * @param {string} css_hash
 * @returns {Record<string, any>}
 */
export function set_attributes(element, prev, next, lowercase_attributes, css_hash) {
	var has_hash = css_hash.length !== 0;
	var current = prev || {};

	for (var key in prev) {
		if (!(key in next)) {
			next[key] = null;
		}
	}

	if (has_hash && !next.class) {
		next.class = '';
	}

	var setters = map_get(setters_cache, element.nodeName);
	if (!setters) map_set(setters_cache, element.nodeName, (setters = get_setters(element)));

	// @ts-expect-error
	var attributes = /** @type {Record<string, unknown>} **/ (element.__attributes ??= {});
	/** @type {Array<[string, any, () => void]>} */
	var events = [];

	// since key is captured we use const
	for (const key in next) {
		// let instead of var because referenced in a closure
		let value = next[key];
		var prev_value = current[key];
		if (value === prev_value) continue;

		current[key] = value;

		var prefix = key[0] + key[1]; // this is faster than key.slice(0, 2)
		if (prefix === '$$') continue;

		if (prefix === 'on') {
			/** @type {{ capture?: true }} */
			const opts = {};
			const event_handle_key = '$$' + key;
			let event_name = key.slice(2);
			var delegated = DelegatedEvents.includes(event_name);

			if (is_capture_event(event_name)) {
				event_name = event_name.slice(0, -7);
				opts.capture = true;
			}

			if (!delegated && prev_value) {
				// Listening to same event but different handler -> our handle function below takes care of this
				// If we were to remove and add listeners in this case, it could happen that the event is "swallowed"
				// (the browser seems to not know yet that a new one exists now) and doesn't reach the handler
				// https://github.com/sveltejs/svelte/issues/11903
				if (value != null) continue;

				element.removeEventListener(event_name, current[event_handle_key], opts);
				current[event_handle_key] = null;
			}

			if (value != null) {
				if (!delegated) {
					/**
					 * @this {any}
					 * @param {Event} evt
					 */
					function handle(evt) {
						current[key].call(this, evt);
					}

					if (!prev) {
						events.push([
							key,
							value,
							() => (current[event_handle_key] = create_event(event_name, element, handle, opts))
						]);
					} else {
						current[event_handle_key] = create_event(event_name, element, handle, opts);
					}
				} else {
					// @ts-ignore
					element[`__${event_name}`] = value;
					delegate([event_name]);
				}
			}
		} else if (value == null) {
			attributes[key] = null;
			element.removeAttribute(key);
		} else if (key === 'style') {
			element.style.cssText = value + '';
		} else if (key === 'autofocus') {
			autofocus(/** @type {HTMLElement} */ (element), Boolean(value));
		} else if (key === '__value' || key === 'value') {
			// @ts-ignore
			element.value = element[key] = element.__value = value;
		} else {
			var name = key;
			if (lowercase_attributes) {
				name = name.toLowerCase();
				name = AttributeAliases[name] || name;
			}

			if (setters.includes(name)) {
				if (hydrating && (name === 'src' || name === 'href' || name === 'srcset')) {
					check_src_in_dev_hydration(element, name, value);
				} else {
					// @ts-ignore
					element[name] = value;
				}
			} else if (typeof value !== 'function') {
				if (has_hash && name === 'class') {
					if (value) value += ' ';
					value += css_hash;
				}

				set_attribute(element, name, value);
			}
		}
	}

	// On the first run, ensure that events are added after bindings so
	// that their listeners fire after the binding listeners
	if (!prev) {
		queue_micro_task(() => {
			if (!element.isConnected) return;
			for (const [key, value, evt] of events) {
				if (current[key] === value) {
					evt();
				}
			}
		});
	}

	return current;
}

/**
 * @param {Element} node
 * @param {Record<string, any> | undefined} prev
 * @param {Record<string, any>} next The new attributes - this function mutates this object
 * @param {string} css_hash
 */
export function set_dynamic_element_attributes(node, prev, next, css_hash) {
	if (node.tagName.includes('-')) {
		for (var key in prev) {
			if (!(key in next)) {
				next[key] = null;
			}
		}

		for (key in next) {
			set_custom_element_data(node, key, next[key]);
		}

		return next;
	}

	return set_attributes(
		/** @type {Element & ElementCSSInlineStyle} */ (node),
		prev,
		next,
		node.namespaceURI !== namespace_svg,
		css_hash
	);
}

/**
 * List of attributes that should always be set through the attr method,
 * because updating them through the property setter doesn't work reliably.
 * In the example of `width`/`height`, the problem is that the setter only
 * accepts numeric values, but the attribute can also be set to a string like `50%`.
 * If this list becomes too big, rethink this approach.
 */
var always_set_through_set_attribute = ['width', 'height'];

/** @type {Map<string, string[]>} */
var setters_cache = new Map();

/** @param {Element} element */
function get_setters(element) {
	/** @type {string[]} */
	var setters = [];
	var descriptors;
	var proto = get_prototype_of(element);

	// Stop at Element, from there on there's only unnecessary setters we're not interested in
	while (proto.constructor.name !== 'Element') {
		descriptors = get_descriptors(proto);

		for (var key in descriptors) {
			if (descriptors[key].set && !always_set_through_set_attribute.includes(key)) {
				setters.push(key);
			}
		}

		proto = get_prototype_of(proto);
	}

	return setters;
}

/**
 * @param {any} element
 * @param {string} attribute
 * @param {string | null} value
 */
function check_src_in_dev_hydration(element, attribute, value) {
	if (!DEV) return;
	if (attribute === 'srcset' && srcset_url_equal(element, value)) return;
	if (src_url_equal(element.getAttribute(attribute) ?? '', value ?? '')) return;

	w.hydration_attribute_changed(
		attribute,
		element.outerHTML.replace(element.innerHTML, '...'),
		String(value)
	);
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
function srcset_url_equal(element, srcset) {
	var element_urls = split_srcset(element.srcset);
	var urls = split_srcset(srcset ?? '');

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
 * @param {HTMLImageElement} element
 * @returns {void}
 */
export function handle_lazy_img(element) {
	// If we're using an image that has a lazy loading attribute, we need to apply
	// the loading and src after the img element has been appended to the document.
	// Otherwise the lazy behaviour will not work due to our cloneNode heuristic for
	// templates.
	if (!hydrating && element.loading === 'lazy') {
		var src = element.src;
		// @ts-expect-error
		element[LOADING_ATTR_SYMBOL] = null;
		element.loading = 'eager';
		element.removeAttribute('src');
		requestAnimationFrame(() => {
			// @ts-expect-error
			if (element[LOADING_ATTR_SYMBOL] !== 'eager') {
				element.loading = 'lazy';
			}
			element.src = src;
		});
	}
}
