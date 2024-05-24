import { DEV } from 'esm-env';
import { HYDRATION_END, HYDRATION_START, HYDRATION_ERROR } from '../../../constants.js';
import * as w from '../warnings.js';
import { remove_nodes } from './operations.js';

/**
 * Use this variable to guard everything related to hydration code so it can be treeshaken out
 * if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
 */
export let hydrating = false;

/** @param {boolean} value */
export function set_hydrating(value) {
	hydrating = value;
}

/** @type {import('#client').TemplateNode} */
export let hydrate_start = /** @type {any} */ (null);

/**
 * @param {import('#client').TemplateNode} start
 */
export function set_hydrate_nodes(start) {
	hydrate_start = start;
}

/**
 * This function is only called when `hydrating` is true. If passed a `<!--[-->` opening
 * hydration marker, it sets `hydrate_start` to be the next node and returns the closing marker
 * @param {Node} node
 * @returns {Node}
 */
export function hydrate_anchor(node) {
	// TODO this could have false positives, if a user comment consisted of `[`. need to tighten that up
	if (node.nodeType !== 8 || /** @type {Comment} */ (node).data !== HYDRATION_START) {
		return node;
	}

	hydrate_start = /** @type {import('#client').TemplateNode} */ (
		/** @type {Comment} */ (node).nextSibling
	);

	var current = hydrate_start;
	var depth = 0;

	while (current !== null) {
		if (current.nodeType === 8) {
			var data = /** @type {Comment} */ (current).data;

			if (data === HYDRATION_START) {
				depth += 1;
			} else if (data[0] === HYDRATION_END) {
				if (depth === 0) {
					return current;
				}

				depth -= 1;
			}
		}

		current = /** @type {import('#client').TemplateNode} */ (current.nextSibling);
	}

	let location;

	if (DEV) {
		// @ts-expect-error
		const loc = node.parentNode?.__svelte_meta?.loc;
		if (loc) {
			location = `${loc.file}:${loc.line}:${loc.column}`;
		}
	}

	w.hydration_mismatch(location);
	throw HYDRATION_ERROR;
}

export function remove_hydrate_nodes() {
	/** @type {import('#client').TemplateNode | null} */
	var node = hydrate_start;
	var depth = 0;

	while (node) {
		if (node.nodeType === 8) {
			var data = /** @type {Comment} */ (node).data;

			if (data === HYDRATION_START) {
				depth += 1;
			} else if (data[0] === HYDRATION_END) {
				if (depth === 0) return;
				depth -= 1;
			}
		}

		var next = /** @type {import('#client').TemplateNode | null} */ (node.nextSibling);
		node.remove();
		node = next;
	}
}
