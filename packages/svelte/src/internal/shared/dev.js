import { DEV } from 'esm-env';
import { define_property } from './utils.js';
import * as e from './errors.js';

/**
 * @param {string} label
 * @returns {Error & { stack: string } | null}
 */
export function get_error(label) {
	const error = new Error();
	const stack = get_stack();

	if (stack.length === 0) {
		return null;
	}

	stack.unshift('\n');

	define_property(error, 'stack', {
		value: stack.join('\n')
	});

	define_property(error, 'name', {
		value: label
	});

	return /** @type {Error & { stack: string }} */ (error);
}

/**
 * @returns {string[]}
 */
export function get_stack() {
	// @ts-ignore - doesn't exist everywhere
	const limit = Error.stackTraceLimit;
	// @ts-ignore - doesn't exist everywhere
	Error.stackTraceLimit = Infinity;
	const stack = new Error().stack;
	// @ts-ignore - doesn't exist everywhere
	Error.stackTraceLimit = limit;

	if (!stack) return [];

	const lines = stack.split('\n');
	const new_lines = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const posixified = line.replaceAll('\\', '/');

		if (line.trim() === 'Error') {
			continue;
		}

		if (line.includes('validate_each_keys')) {
			return [];
		}

		if (posixified.includes('svelte/src/internal') || posixified.includes('node_modules/.vite')) {
			continue;
		}

		new_lines.push(line);
	}

	return new_lines;
}

/**
 * @param {boolean} condition
 * @param {string} message
 */
export function invariant(condition, message) {
	if (!DEV) {
		throw new Error('invariant(...) was not guarded by if (DEV)');
	}

	if (!condition) e.invariant_violation(message);
}
