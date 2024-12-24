import { DEV } from 'esm-env';
import { hydrating } from '../hydration.js';
import { get_descriptors, get_prototype_of } from '../../../shared/utils.js';
import { create_event, delegate } from './events.js';
import { add_form_reset_listener, autofocus } from './misc.js';
import * as w from '../../warnings.js';
import { LOADING_ATTR_SYMBOL } from '../../constants.js';
import { queue_idle_task } from '../task.js';
import { is_capture_event, is_delegated, normalize_attribute } from '../../../../utils.js';
import {
	active_effect,
	active_reaction,
	set_active_effect,
	set_active_reaction
} from '../../runtime.js';
import { clsx } from '../../../shared/attributes.js';

/**
 * The value/checked attribute in the template actually corresponds to the defaultValue property, so we need
 * to remove it upon hydration to avoid a bug when someone resets the form value.
 * @param {HTMLInputElement} input
 * @returns {void}
 */
export function remove_input_defaults(input) {
	if (!hydrating) return;

	var already_removed = false;

	// We try and remove the default attributes later, rather than sync during hydration.
	// Doing it sync during hydration has a negative impact on performance, but deferring the
	// work in an idle task alleviates this greatly. If a form reset event comes in before
	// the idle callback, then we ensure the input defaults are cleared just before.
	var remove_defaults = () => {
		if (already_removed) return;
		already_removed = true;

		// Remove the attributes but preserve the values
		if (input.hasAttribute('value')) {
			var value = input.value;
			set_attribute(input, 'value', null);
			input.value = value;
		}

		if (input.hasAttribute('checked')) {
			var checked = input.checked;
			set_attribute(input, 'checked', null);
			input.checked = checked;
		}
	};

	// @ts-expect-error
	input.__on_r = remove_defaults;
	queue_idle_task(remove_defaults);
	add_form_reset_listener();
}

/**
 * @param {Element} element
 * @param {any} value
 */
export function set_value(element, value) {
	// @ts-expect-error
	var attributes = (element.__attributes ??= {});

	if (
		attributes.value ===
			(attributes.value =
				// treat null and undefined the same for the initial value
				value ?? undefined) ||
		// @ts-expect-error
		// `progress` elements always need their value set when its `0`
		(element.value === value && (value !== 0 || element.nodeName !== 'PROGRESS'))
	) {
		return;
	}

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

	if (
		attributes.checked ===
		(attributes.checked =
			// treat null and undefined the same for the initial value
			checked ?? undefined)
	) {
		return;
	}

	// @ts-expect-error
	element.checked = checked;
}

/**
 * Sets the `selected` attribute on an `option` element.
 * Not set through the property because that doesn't reflect to the DOM,
 * which means it wouldn't be taken into account when a form is reset.
 * @param {HTMLOptionElement} element
 * @param {boolean} selected
 */
export function set_selected(element, selected) {
	if (selected) {
		// The selected option could've changed via user selection, and
		// setting the value without this check would set it back.
		if (!element.hasAttribute('selected')) {
			element.setAttribute('selected', '');
		}
	} else {
		element.removeAttribute('selected');
	}
}

/**
 * Applies the default checked property without influencing the current checked property.
 * @param {HTMLInputElement} element
 * @param {boolean} checked
 */
export function set_default_checked(element, checked) {
	const existing_value = element.checked;
	element.defaultChecked = checked;
	element.checked = existing_value;
}

/**
 * Applies the default value property without influencing the current value property.
 * @param {HTMLInputElement | HTMLTextAreaElement} element
 * @param {string} value
 */
export function set_default_value(element, value) {
	const existing_value = element.value;
	element.defaultValue = value;
	element.value = existing_value;
}

/**
 * @param {Element} element
 * @param {string} attribute
 * @param {string | null} value
 * @param {boolean} [skip_warning]
 */
export function set_attribute(element, attribute, value, skip_warning) {
	// @ts-expect-error
	var attributes = (element.__attributes ??= {});

	if (hydrating) {
		attributes[attribute] = element.getAttribute(attribute);

		if (
			attribute === 'src' ||
			attribute === 'srcset' ||
			(attribute === 'href' && element.nodeName === 'LINK')
		) {
			if (!skip_warning) {
				check_src_in_dev_hydration(element, attribute, value ?? '');
			}

			// If we reset these attributes, they would result in another network request, which we want to avoid.
			// We assume they are the same between client and server as checking if they are equal is expensive
			// (we can't just compare the strings as they can be different between client and server but result in the
			// same url, so we would need to create hidden anchor elements to compare them)
			return;
		}
	}

	if (attributes[attribute] === (attributes[attribute] = value)) return;

	if (attribute === 'style' && '__styles' in element) {
		// reset styles to force style: directive to update
		element.__styles = {};
	}

	if (attribute === 'loading') {
		// @ts-expect-error
		element[LOADING_ATTR_SYMBOL] = value;
	}

	if (value == null) {
		element.removeAttribute(attribute);
	} else if (typeof value !== 'string' && get_setters(element).includes(attribute)) {
		// @ts-ignore
		element[attribute] = value;
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
 * @param {HTMLElement} node
 * @param {string} prop
 * @param {any} value
 */
export function set_custom_element_data(node, prop, value) {
	// We need to ensure that setting custom element props, which can
	// invoke lifecycle methods on other custom elements, does not also
	// associate those lifecycle methods with the current active reaction
	// or effect
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;

	set_active_reaction(null);
	set_active_effect(null);
	try {
		if (
			// Don't compute setters for custom elements while they aren't registered yet,
			// because during their upgrade/instantiation they might add more setters.
			// Instead, fall back to a simple "an object, then set as property" heuristic.
			setters_cache.has(node.nodeName) || customElements.get(node.tagName.toLowerCase())
				? get_setters(node).includes(prop)
				: value && typeof value === 'object'
		) {
			// @ts-expect-error
			node[prop] = value;
		} else {
			// We did getters etc checks already, stringify before passing to set_attribute
			// to ensure it doesn't invoke the same logic again, and potentially populating
			// the setters cache too early.
			set_attribute(node, prop, value == null ? value : String(value));
		}
	} finally {
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}

/**
 * Spreads attributes onto a DOM element, taking into account the currently set attributes
 * @param {Element & ElementCSSInlineStyle} element
 * @param {Record<string, any> | undefined} prev
 * @param {Record<string, any>} next New attributes - this function mutates this object
 * @param {string} [css_hash]
 * @param {boolean} [preserve_attribute_case]
 * @param {boolean} [is_custom_element]
 * @param {boolean} [skip_warning]
 * @returns {Record<string, any>}
 */
export function set_attributes(
	element,
	prev,
	next,
	css_hash,
	preserve_attribute_case = false,
	is_custom_element = false,
	skip_warning = false
) {
	var current = prev || {};
	var is_option_element = element.tagName === 'OPTION';

	for (var key in prev) {
		if (!(key in next)) {
			next[key] = null;
		}
	}

	if (next.class) {
		next.class = clsx(next.class);
	}

	if (css_hash !== undefined) {
		next.class = next.class ? next.class + ' ' + css_hash : css_hash;
	}

	var setters = get_setters(element);

	// @ts-expect-error
	var attributes = /** @type {Record<string, unknown>} **/ (element.__attributes ??= {});

	// since key is captured we use const
	for (const key in next) {
		// let instead of var because referenced in a closure
		let value = next[key];

		// Up here because we want to do this for the initial value, too, even if it's undefined,
		// and this wouldn't be reached in case of undefined because of the equality check below
		if (is_option_element && key === 'value' && value == null) {
			// The <option> element is a special case because removing the value attribute means
			// the value is set to the text content of the option element, and setting the value
			// to null or undefined means the value is set to the string "null" or "undefined".
			// To align with how we handle this case in non-spread-scenarios, this logic is needed.
			// There's a super-edge-case bug here that is left in in favor of smaller code size:
			// Because of the "set missing props to null" logic above, we can't differentiate
			// between a missing value and an explicitly set value of null or undefined. That means
			// that once set, the value attribute of an <option> element can't be removed. This is
			// a very rare edge case, and removing the attribute altogether isn't possible either
			// for the <option value={undefined}> case, so we're not losing any functionality here.
			// @ts-ignore
			element.value = element.__value = '';
			current[key] = value;
			continue;
		}

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
			var delegated = is_delegated(event_name);

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

					current[event_handle_key] = create_event(event_name, element, handle, opts);
				} else {
					// @ts-ignore
					element[`__${event_name}`] = value;
					delegate([event_name]);
				}
			} else if (delegated) {
				// @ts-ignore
				element[`__${event_name}`] = undefined;
			}
		} else if (key === 'style' && value != null) {
			element.style.cssText = value + '';
		} else if (key === 'autofocus') {
			autofocus(/** @type {HTMLElement} */ (element), Boolean(value));
		} else if (key === '__value' || (key === 'value' && value != null)) {
			// @ts-ignore
			element.value = element[key] = element.__value = value;
		} else if (key === 'selected' && is_option_element) {
			set_selected(/** @type {HTMLOptionElement} */ (element), value);
		} else {
			var name = key;
			if (!preserve_attribute_case) {
				name = normalize_attribute(name);
			}

			var is_default = name === 'defaultValue' || name === 'defaultChecked';

			if (value == null && !is_custom_element && !is_default) {
				attributes[key] = null;

				if (name === 'value' || name === 'checked') {
					// removing value/checked also removes defaultValue/defaultChecked — preserve
					let input = /** @type {HTMLInputElement} */ (element);

					if (name === 'value') {
						let prev = input.defaultValue;
						input.removeAttribute(name);
						input.defaultValue = prev;
					} else {
						let prev = input.defaultChecked;
						input.removeAttribute(name);
						input.defaultChecked = prev;
					}
				} else {
					element.removeAttribute(key);
				}
			} else if (
				is_default ||
				(setters.includes(name) && (is_custom_element || typeof value !== 'string'))
			) {
				// @ts-ignore
				element[name] = value;
			} else if (typeof value !== 'function') {
				if (hydrating && (name === 'src' || name === 'href' || name === 'srcset')) {
					if (!skip_warning) check_src_in_dev_hydration(element, name, value ?? '');
				} else {
					set_attribute(element, name, value);
				}
			}
		}
		if (key === 'style' && '__styles' in element) {
			// reset styles to force style: directive to update
			element.__styles = {};
		}
	}

	return current;
}

/** @type {Map<string, string[]>} */
var setters_cache = new Map();

/** @param {Element} element */
function get_setters(element) {
	var setters = setters_cache.get(element.nodeName);
	if (setters) return setters;
	setters_cache.set(element.nodeName, (setters = []));

	var descriptors;
	var proto = element; // In the case of custom elements there might be setters on the instance
	var element_proto = Element.prototype;

	// Stop at Element, from there on there's only unnecessary setters we're not interested in
	// Do not use contructor.name here as that's unreliable in some browser environments
	while (element_proto !== proto) {
		descriptors = get_descriptors(proto);

		for (var key in descriptors) {
			if (descriptors[key].set) {
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
 * @param {string} value
 */
function check_src_in_dev_hydration(element, attribute, value) {
	if (!DEV) return;
	if (attribute === 'srcset' && srcset_url_equal(element, value)) return;
	if (src_url_equal(element.getAttribute(attribute) ?? '', value)) return;

	w.hydration_attribute_changed(
		attribute,
		element.outerHTML.replace(element.innerHTML, element.innerHTML && '...'),
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
 * @param {string} srcset
 * @returns {boolean}
 */
function srcset_url_equal(element, srcset) {
	var element_urls = split_srcset(element.srcset);
	var urls = split_srcset(srcset);

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
