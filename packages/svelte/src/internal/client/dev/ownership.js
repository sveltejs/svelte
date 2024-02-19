/** @typedef {{ file: string, line: number, column: number }} Location */

import { deep_read, set_current_owner_override, untrack } from '../runtime.js';

/** @type {Record<string, Array<{ start: Location, end: Location, component: Function }>>} */
const boundaries = {};

const chrome_pattern = /at (?:.+ \()?(.+):(\d+):(\d+)\)?$/;
const firefox_pattern = /@(.+):(\d+):(\d+)$/;

export function get_stack() {
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
	const stack = get_stack();
	if (!stack) return null;

	for (const entry of stack) {
		const modules = boundaries[entry.file];
		if (!modules) continue;

		for (const module of modules) {
			if (module.start.line < entry.line && module.end.line > entry.line) {
				return module.component;
			}
		}
	}

	return null;
}

/**
 * Together with `mark_module_end`, this function establishes the boundaries of a `.svelte` file,
 * such that subsequent calls to `get_component` can tell us which component is responsible
 * for a given state change
 * @param {Function} component
 */
export function mark_module_start(component) {
	const start = get_stack()?.[2];

	if (start) {
		(boundaries[start.file] ??= []).push({
			start,
			// @ts-expect-error
			end: null,
			component
		});
	}
}

export function mark_module_end() {
	const end = get_stack()?.[2];

	if (end) {
		// @ts-expect-error
		boundaries[end.file].at(-1).end = end;
	}
}

/**
 *
 * @param {any} object
 * @param {any} owner
 */
export function add_owner(object, owner) {
	untrack(() => {
		set_current_owner_override(owner);
		deep_read(object);
		set_current_owner_override(null);
	});
}

/**
 * @param {import('../types.js').Signal} signal
 */
export function check_ownership(signal) {
	// @ts-expect-error
	if (!signal.owners) return;

	const component = get_component();

	// @ts-expect-error
	if (component && signal.owners.size > 0 && !signal.owners.has(component)) {
		// eslint-disable-next-line no-console
		console.warn(
			'Mutating a value outside the component that created it is strongly discouraged. Consider passing values to child components with `bind:`, or use callback instead.'
		);

		// eslint-disable-next-line no-console
		console.trace();
	}
}
