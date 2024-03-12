import { DEV } from 'esm-env';
import { hydrating } from '../hydration.js';
import { render_effect } from '../../reactivity/effects.js';
import { get_descriptors, map_get, map_set, object_assign } from '../../utils.js';
import { AttributeAliases, DelegatedEvents, namespace_svg } from '../../../../constants.js';
import { delegate } from './events.js';
import { autofocus } from './misc.js';

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
 * @param {Element} dom
 * @param {string} attribute
 * @param {() => string} value
 */
export function attr_effect(dom, attribute, value) {
	render_effect(() => {
		attr(dom, attribute, value());
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
 * @param {Element} dom
 * @param {string} attribute
 * @param {() => string} value
 */
export function xlink_attr_effect(dom, attribute, value) {
	render_effect(() => {
		xlink_attr(dom, attribute, value());
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
 * Like `spread_attributes` but self-contained
 * @param {Element & ElementCSSInlineStyle} dom
 * @param {() => Record<string, unknown>[]} attrs
 * @param {boolean} lowercase_attributes
 * @param {string} css_hash
 */
export function spread_attributes_effect(dom, attrs, lowercase_attributes, css_hash) {
	/** @type {Record<string, any> | undefined} */
	var current;

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
	var next = object_assign({}, ...attrs);
	var has_hash = css_hash.length !== 0;

	for (var key in prev) {
		if (!(key in next)) {
			next[key] = null;
		}
	}

	if (has_hash && !next.class) {
		next.class = '';
	}

	var setters = map_get(setters_cache, dom.nodeName);
	if (!setters) map_set(setters_cache, dom.nodeName, (setters = get_setters(dom)));

	for (key in next) {
		var value = next[key];
		if (value === prev?.[key]) continue;

		var prefix = key[0] + key[1]; // this is faster than key.slice(0, 2)
		if (prefix === '$$') continue;

		if (prefix === 'on') {
			/** @type {{ capture?: true }} */
			var opts = {};
			var event_name = key.slice(2);
			var delegated = DelegatedEvents.includes(event_name);

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
			autofocus(/** @type {HTMLElement} */ (dom), Boolean(value));
		} else if (key === '__value' || key === 'value') {
			// @ts-ignore
			dom.value = dom[key] = dom.__value = value;
		} else {
			var name = key;
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
	var current;

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
		var next = object_assign({}, ...attrs);

		for (var key in prev) {
			if (!(key in next)) {
				next[key] = null;
			}
		}

		for (key in next) {
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

	// @ts-expect-error
	var descriptors = get_descriptors(element.__proto__);

	for (var key in descriptors) {
		if (descriptors[key].set && !always_set_through_set_attribute.includes(key)) {
			setters.push(key);
		}
	}

	return setters;
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
