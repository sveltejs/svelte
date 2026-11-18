import { DEV } from 'esm-env';
import { component_context, dev_stack } from '../../context.js';
import { hydrate_next, hydrating } from '../hydration.js';
import { append_child, create_element, create_text, set_attribute } from '../operations.js';
import { append } from '../template.js';

/**
 * @param {Comment} anchor
 * @param {Record<string, any>} $$props
 * @param {string} name
 * @param {Record<string, unknown>} slot_props
 * @param {null | ((anchor: Comment) => void)} fallback_fn
 * @param {[string, number, number]} [location] the filename, line and column of the slot
 */
export function slot(anchor, $$props, name, slot_props, fallback_fn, location) {
	if (hydrating) {
		hydrate_next();
	}

	// Custom element slots are native DOM slots.
	// Use the stored reference because the shadow root may be closed.
	if ($$props.$$host?.$$shadowRoot) {
		const element = create_element('slot');
		if (name !== 'default') set_attribute(element, 'name', name);

		if (DEV && location) {
			// Native slots are created outside the template, so mark their ownership
			// before the surrounding template assigns its locations.
			// @ts-expect-error
			element.__svelte_meta = {
				parent: dev_stack,
				loc: {
					file: location[0],
					line: location[1],
					column: location[2]
				},
				component: component_context
			};
		}

		append(anchor, element);

		if (fallback_fn !== null) {
			const fallback_anchor = create_text();
			append_child(element, fallback_anchor);
			fallback_fn(fallback_anchor);
		}

		return;
	}

	var slot_fn = $$props.$$slots?.[name];
	// Interop: Can use snippets to fill slots
	var is_interop = false;
	if (slot_fn === true) {
		slot_fn = $$props[name === 'default' ? 'children' : name];
		is_interop = true;
	}

	if (slot_fn === undefined) {
		if (fallback_fn !== null) {
			fallback_fn(anchor);
		}
	} else {
		slot_fn(anchor, is_interop ? () => slot_props : slot_props);
	}
}

/**
 * @param {Record<string, any>} props
 * @returns {Record<string, boolean>}
 */
export function sanitize_slots(props) {
	/** @type {Record<string, boolean>} */
	const sanitized = {};
	if (props.children) sanitized.default = true;
	for (const key in props.$$slots) {
		sanitized[key] = true;
	}
	return sanitized;
}
