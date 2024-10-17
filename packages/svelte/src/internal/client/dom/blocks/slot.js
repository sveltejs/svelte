import { DEV } from 'esm-env';
import { hydrate_next, hydrating } from '../hydration.js';
import { validated_snippets } from './snippet.js';

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

	var slot_fn = $$props.$$slots?.[name];

	if (slot_fn === undefined) {
		var possible_snippet = $$props[name];
		if (
			typeof possible_snippet === 'function' &&
			(!DEV || validated_snippets.has(possible_snippet))
		) {
			slot_fn = possible_snippet;
		}
	}

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
