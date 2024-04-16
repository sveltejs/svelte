/** @typedef {{ file: string, line: number, column: number }} Location */

import { STATE_SYMBOL } from '../constants.js';
import { untrack } from '../runtime.js';

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
function get_component() {
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
 *
 * @param {any} object
 * @param {any} owner
 */
export function add_owner(object, owner) {
	untrack(() => {
		add_owner_to_object(object, owner);
	});
}

/**
 * @param {any} object
 * @param {Function} owner
 */
function add_owner_to_object(object, owner) {
	if (object?.[STATE_SYMBOL]?.o && !object[STATE_SYMBOL].o.has(owner)) {
		object[STATE_SYMBOL].o.add(owner);

		for (const key in object) {
			add_owner_to_object(object[key], owner);
		}
	}
}

/**
 * @param {any} object
 */
export function strip_owner(object) {
	untrack(() => {
		strip_owner_from_object(object);
	});
}

/**
 * @param {any} object
 */
function strip_owner_from_object(object) {
	if (object?.[STATE_SYMBOL]?.o) {
		object[STATE_SYMBOL].o = null;

		for (const key in object) {
			strip_owner(object[key]);
		}
	}
}

/**
 * @param {Set<Function>} owners
 */
export function check_ownership(owners) {
	const component = get_component();

	if (component && !owners.has(component)) {
		let original = [...owners][0];

		let message =
			// @ts-expect-error
			original.filename !== component.filename
				? // @ts-expect-error
					`${component.filename} mutated a value owned by ${original.filename}. This is strongly discouraged`
				: 'Mutating a value outside the component that created it is strongly discouraged';

		// eslint-disable-next-line no-console
		console.warn(
			`${message}. Consider passing values to child components with \`bind:\`, or use a callback instead.`
		);

		// eslint-disable-next-line no-console
		console.trace();
	}
}
