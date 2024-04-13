/** @typedef {{ file: string, line: number, column: number }} Location */

import { STATE_SYMBOL } from '../constants.js';
import { untrack } from '../runtime.js';
import { get_descriptors } from '../utils.js';

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
		const boundaries_file = boundaries[end.file];
		boundaries_file[boundaries_file.length - 1].end = end;
	}
}

let add_owner_visited = new Set();

/**
 *
 * @param {any} object
 * @param {any} owner
 */
export function add_owner(object, owner) {
	// Needed because ownership addition can invoke getters on a proxy,
	// calling add_owner anew, so just keeping the set as part of
	// add_owner_to_object would not be enough.
	const prev = add_owner_visited;
	try {
		add_owner_visited = new Set(add_owner_visited);
		untrack(() => {
			add_owner_to_object(object, owner, add_owner_visited);
		});
	} finally {
		add_owner_visited = prev;
	}
}

/**
 * @param {any} object
 * @param {Function} owner
 * @param {Set<any>} visited
 */
function add_owner_to_object(object, owner, visited) {
	if (visited.has(object)) return;
	visited.add(object);

	if (object?.[STATE_SYMBOL]?.o && !object[STATE_SYMBOL].o.has(owner)) {
		object[STATE_SYMBOL].o.add(owner);
	}
	// Not inside previous if-block; there could be normal objects in-between
	traverse_for_owners(object, (nested) => add_owner_to_object(nested, owner, visited));
}

let strip_owner_visited = new Set();

/**
 * @param {any} object
 */
export function strip_owner(object) {
	// Needed because ownership stripping can invoke getters on a proxy,
	// calling strip_owner anew, so just keeping the set as part of
	// strip_owner_from_object would not be enough.
	const prev = strip_owner_visited;
	try {
		untrack(() => {
			strip_owner_from_object(object, strip_owner_visited);
		});
	} finally {
		strip_owner_visited = prev;
	}
}

/**
 * @param {any} object
 * @param {Set<any>} visited
 */
function strip_owner_from_object(object, visited) {
	if (visited.has(object)) return;
	visited.add(object);

	if (object?.[STATE_SYMBOL]?.o) {
		object[STATE_SYMBOL].o = null;
	}
	// Not inside previous if-block; there could be normal objects in-between
	traverse_for_owners(object, (nested) => strip_owner_from_object(nested, visited));
}

/**
 * @param {any} object
 * @param {(obj: any) => void} cb
 */
function traverse_for_owners(object, cb) {
	if (typeof object === 'object' && object !== null && !(object instanceof EventTarget)) {
		for (const key in object) {
			cb(object[key]);
		}
		// deal with state on classes
		const proto = Object.getPrototypeOf(object);
		if (
			proto !== Object.prototype &&
			proto !== Array.prototype &&
			proto !== Map.prototype &&
			proto !== Set.prototype &&
			proto !== Date.prototype
		) {
			const descriptors = get_descriptors(proto);
			for (let key in descriptors) {
				const get = descriptors[key].get;
				if (get) {
					try {
						cb(object[key]);
					} catch (e) {
						// continue
					}
				}
			}
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
