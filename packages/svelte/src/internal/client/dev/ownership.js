/** @import { ProxyMetadata } from '#client' */
/** @typedef {{ file: string, line: number, column: number }} Location */

import { STATE_SYMBOL_METADATA } from '../constants.js';
import { render_effect, user_pre_effect } from '../reactivity/effects.js';
import { dev_current_component_function } from '../context.js';
import { get_prototype_of } from '../../shared/utils.js';
import * as w from '../warnings.js';
import { FILENAME } from '../../../constants.js';

/** @type {Record<string, Array<{ start: Location, end: Location, component: Function }>>} */
const boundaries = {};

const chrome_pattern = /at (?:.+ \()?(.+):(\d+):(\d+)\)?$/;
const firefox_pattern = /@(.+):(\d+):(\d+)$/;

function get_stack() {
	const stack = new Error().stack;
	if (!stack) return null;

	const entries = [];

	for (const line of stack.split('\n')) {
		let match = chrome_pattern.exec(line) ?? firefox_pattern.exec(line);

		if (match) {
			entries.push({
				file: match[1],
				line: +match[2],
				column: +match[3]
			});
		}
	}

	return entries;
}

/**
 * Determines which `.svelte` component is responsible for a given state change
 * @returns {Function | null}
 */
export function get_component() {
	// first 4 lines are svelte internals; adjust this number if we change the internal call stack
	const stack = get_stack()?.slice(4);
	if (!stack) return null;

	for (let i = 0; i < stack.length; i++) {
		const entry = stack[i];
		const modules = boundaries[entry.file];
		if (!modules) {
			// If the first entry is not a component, that means the modification very likely happened
			// within a .svelte.js file, possibly triggered by a component. Since these files are not part
			// of the bondaries/component context heuristic, we need to bail in this case, else we would
			// have false positives when the .svelte.ts file provides a state creator function, encapsulating
			// the state and its mutations, and is being called from a component other than the one who
			// called the state creator function.
			if (i === 0) return null;
			continue;
		}

		for (const module of modules) {
			if (module.end == null) {
				return null;
			}
			if (module.start.line < entry.line && module.end.line > entry.line) {
				return module.component;
			}
		}
	}

	return null;
}

export const ADD_OWNER = Symbol('ADD_OWNER');

/**
 * Together with `mark_module_end`, this function establishes the boundaries of a `.svelte` file,
 * such that subsequent calls to `get_component` can tell us which component is responsible
 * for a given state change
 */
export function mark_module_start() {
	const start = get_stack()?.[2];

	if (start) {
		(boundaries[start.file] ??= []).push({
			start,
			// @ts-expect-error
			end: null,
			// @ts-expect-error we add the component at the end, since HMR will overwrite the function
			component: null
		});
	}
}

/**
 * @param {Function} component
 */
export function mark_module_end(component) {
	const end = get_stack()?.[2];

	if (end) {
		const boundaries_file = boundaries[end.file];
		const boundary = boundaries_file[boundaries_file.length - 1];

		boundary.end = end;
		boundary.component = component;
	}
}

/**
 * @param {any} object
 * @param {any | null} owner
 * @param {boolean} [global]
 * @param {boolean} [skip_warning]
 */
export function add_owner(object, owner, global = false, skip_warning = false) {
	if (object && !global) {
		const component = dev_current_component_function;
		const metadata = object[STATE_SYMBOL_METADATA];
		if (metadata && !has_owner(metadata, component)) {
			let original = get_owner(metadata);

			if (owner && owner[FILENAME] !== component[FILENAME] && !skip_warning) {
				w.ownership_invalid_binding(component[FILENAME], owner[FILENAME], original[FILENAME]);
			}
		}
	}

	add_owner_to_object(object, owner, new Set());
}

/**
 * @param {() => unknown} get_object
 * @param {any} Component
 * @param {boolean} [skip_warning]
 */
export function add_owner_effect(get_object, Component, skip_warning = false) {
	user_pre_effect(() => {
		add_owner(get_object(), Component, false, skip_warning);
	});
}

/**
 * @param {ProxyMetadata | null} from
 * @param {ProxyMetadata} to
 */
export function widen_ownership(from, to) {
	if (to.owners === null) {
		return;
	}

	while (from) {
		if (from.owners === null) {
			to.owners = null;
			break;
		}

		for (const owner of from.owners) {
			to.owners.add(owner);
		}

		from = from.parent;
	}
}

/**
 * @param {any} object
 * @param {Function | null} owner If `null`, then the object is globally owned and will not be checked
 * @param {Set<any>} seen
 */
function add_owner_to_object(object, owner, seen) {
	const metadata = /** @type {ProxyMetadata} */ (object?.[STATE_SYMBOL_METADATA]);

	if (metadata) {
		// this is a state proxy, add owner directly, if not globally shared
		if ('owners' in metadata && metadata.owners != null) {
			if (owner) {
				metadata.owners.add(owner);
			} else {
				metadata.owners = null;
			}
		}
	} else if (object && typeof object === 'object') {
		if (seen.has(object)) return;
		seen.add(object);
		if (ADD_OWNER in object && object[ADD_OWNER]) {
			// this is a class with state fields. we put this in a render effect
			// so that if state is replaced (e.g. `instance.name = { first, last }`)
			// the new state is also co-owned by the caller of `getContext`
			render_effect(() => {
				object[ADD_OWNER](owner);
			});
		} else {
			var proto = get_prototype_of(object);

			if (proto === Object.prototype) {
				// recurse until we find a state proxy
				for (const key in object) {
					add_owner_to_object(object[key], owner, seen);
				}
			} else if (proto === Array.prototype) {
				// recurse until we find a state proxy
				for (let i = 0; i < object.length; i += 1) {
					add_owner_to_object(object[i], owner, seen);
				}
			}
		}
	}
}

/**
 * @param {ProxyMetadata} metadata
 * @param {Function} component
 * @returns {boolean}
 */
function has_owner(metadata, component) {
	if (metadata.owners === null) {
		return true;
	}

	return (
		metadata.owners.has(component) ||
		// This helps avoid false positives when using HMR, where the component function is replaced
		[...metadata.owners].some(
			(owner) => /** @type {any} */ (owner)[FILENAME] === /** @type {any} */ (component)?.[FILENAME]
		) ||
		(metadata.parent !== null && has_owner(metadata.parent, component))
	);
}

/**
 * @param {ProxyMetadata} metadata
 * @returns {any}
 */
function get_owner(metadata) {
	return (
		metadata?.owners?.values().next().value ??
		get_owner(/** @type {ProxyMetadata} */ (metadata.parent))
	);
}

let skip = false;

/**
 * @param {() => any} fn
 */
export function skip_ownership_validation(fn) {
	skip = true;
	fn();
	skip = false;
}

/**
 * @param {ProxyMetadata} metadata
 */
export function check_ownership(metadata) {
	if (skip) return;

	const component = get_component();

	if (component && !has_owner(metadata, component)) {
		let original = get_owner(metadata);

		// @ts-expect-error
		if (original[FILENAME] !== component[FILENAME]) {
			// @ts-expect-error
			w.ownership_invalid_mutation(component[FILENAME], original[FILENAME]);
		} else {
			w.ownership_invalid_mutation();
		}
	}
}
