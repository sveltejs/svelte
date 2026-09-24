import { hydrate_next, hydrating } from '../hydration.js';
import { create_element, create_text } from '../operations.js';
import { append } from '../template.js';

/**
 * @param {Comment} anchor
 * @param {Record<string, any>} $$props
 * @param {string} name
 * @param {Record<string, unknown>} slot_props
 * @param {null | ((anchor: Comment) => void)} fallback_fn
 */
export function slot(anchor, $$props, name, slot_props, fallback_fn) {
	if (hydrating) {
		hydrate_next();
	}

	// Custom element slots are native DOM slots.
	// Use the stored reference because the shadow root may be closed.
	if ($$props.$$host?.$$shadowRoot) {
		const element = create_element('slot');
		if (name !== 'default') element.name = name;

		append(anchor, element);

		if (fallback_fn !== null) {
			const fallback_anchor = create_text();
			element.append(fallback_anchor);
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
