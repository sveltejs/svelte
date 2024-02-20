/** @typedef {{ file: string, line: number, column: number }} Location */

import { current_component_context, current_owner, deep_read, untrack } from '../runtime.js';

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

/** @type {Function | null} */
let new_owner = null;

/**
 * @param {import('../types.js').Signal} signal
 */
export function set_owner(signal) {
	// @ts-expect-error
	if (current_owner && signal.owners) {
		// @ts-expect-error
		signal.owners.add(current_owner);
	}
}

/**
 *
 * @param {any} object
 * @param {any} owner
 */
export function add_owner(object, owner) {
	untrack(() => {
		new_owner = owner;
		deep_read(object);
		new_owner = null;
	});
}

/**
 * @param {import('../types.js').Signal} signal
 */
export function add_owner_to_signal(signal) {
	if (
		new_owner &&
		// @ts-expect-error
		signal.owners?.has(current_component_context.function)
	) {
		// @ts-expect-error
		signal.owners.add(new_owner);
	}
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
		// @ts-expect-error
		let owner = [...signal.owners][0];

		let message =
			// @ts-expect-error
			owner.filename !== component.filename
				? // @ts-expect-error
					`${component.filename} mutated a value owned by ${owner.filename}. This is strongly discouraged`
				: 'Mutating a value outside the component that created it is strongly discouraged';

		// eslint-disable-next-line no-console
		console.warn(
			`${message}. Consider passing values to child components with \`bind:\`, or use a callback instead.`
		);

		// eslint-disable-next-line no-console
		console.trace();
	}
}
