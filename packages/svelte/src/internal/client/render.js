import { DEV } from 'esm-env';
import {
	append_child,
	create_element,
	empty,
	init_operations,
	map_get,
	map_set,
	set_class_name
} from './operations.js';
import {
	PassiveDelegatedEvents,
	DelegatedEvents,
	AttributeAliases,
	namespace_svg
} from '../../constants.js';
import { remove } from './reconciler.js';
import {
	untrack,
	flush_sync,
	current_block,
	push,
	pop,
	current_component_context,
	deep_read_state
} from './runtime.js';
import { render_effect, effect, destroy_effect } from './reactivity/effects.js';
import {
	current_hydration_fragment,
	get_hydration_fragment,
	hydrate_block_anchor,
	hydrating,
	set_current_hydration_fragment
} from './hydration.js';
import { array_from, define_property, get_descriptors, is_array, object_assign } from './utils.js';
import { bind_transition } from './transitions.js';
import { ROOT_BLOCK } from './constants.js';

/** @type {Set<string>} */
const all_registered_events = new Set();

/** @type {Set<(events: Array<string>) => void>} */
const root_event_handles = new Set();

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
export function autofocus(dom, value) {
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
 * @param {Array<string>} events
 * @returns {void}
 */
export function delegate(events) {
	for (let i = 0; i < events.length; i++) {
		all_registered_events.add(events[i]);
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
	const owner_document = handler_element.ownerDocument;
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
			return current_target || owner_document;
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
 * @param {unknown} value
 * @returns {string}
 */
export function stringify(value) {
	return typeof value === 'string' ? value : value == null ? '' : value + '';
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
	let needs_deep_read = false;
	// Action could come from a prop, therefore could be a signal, therefore untrack
	// TODO we could take advantage of this and enable https://github.com/sveltejs/svelte/issues/6942
	effect(() => {
		if (value_fn) {
			const value = value_fn();
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
				deep_read_state(value);
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
			autofocus(/** @type {HTMLElement} */ (dom), Boolean(value));
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
			hydration_fragment[hydration_fragment.length - 1]?.nextSibling?.remove();
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

	/** @type {import('#client').RootBlock} */
	const block = {
		// dom
		d: null,
		// effect
		e: null,
		// intro
		i: options.intro || false,
		// parent
		p: null,
		// transition
		r: null,
		// type
		t: ROOT_BLOCK
	};

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
	event_handle(array_from(all_registered_events));
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
		destroy_effect(/** @type {import('./types.js').Effect} */ (block.e));
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
