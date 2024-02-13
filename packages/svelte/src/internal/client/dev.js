/** @typedef {{ file: string, line: number, column: number }} Location */

import { deep_read, set_current_owner, set_current_owner_override, untrack } from './runtime.js';

/** @type {Record<string, Array<{ start: Location, end: Location, filename: string }>>} */
const boundaries = {};

const chrome_pattern = /\((.+):(\d+):(\d+)\)$/;
const firefox_pattern = /@(.+):(\d+):(\d+)$/;

export function get_stack() {
	const stack = new Error().stack;
	if (!stack) return null;

	const entries = [];

	for (const line of stack.split('\n').slice(1)) {
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

export function get_module() {
	const stack = get_stack();
	if (!stack) return null;

	for (const entry of stack) {
		if (entry) {
			const modules = boundaries[entry.file];
			for (const module of modules) {
				if (module.start.line < entry.line && module.end.line > entry.line) {
					return module.filename;
				}
			}
		}
	}

	return null;
}

/**
 * @param {string} filename The original `path/to/Blah.svelte` filename
 */
export function push_module(filename) {
	const start = get_stack()?.[1];

	if (start) {
		(boundaries[start.file] ??= []).push({
			start,
			// @ts-expect-error
			end: null,
			filename
		});
	}
}

export function pop_module() {
	const end = get_stack()?.[1];

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
		set_current_owner_override(owner.filename);
		deep_read(object);
		set_current_owner_override(null);
	});
}
