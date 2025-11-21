import { define_property } from './utils.js';

/**
 * @param {string} label
 * @param {(stack: string | undefined) => string | undefined} fn
 * @returns {Error & { stack: string } | null}
 */
export function get_infinite_stack(label, fn) {
	// @ts-ignore - doesn't exist everywhere
	const limit = Error.stackTraceLimit;
	// @ts-ignore - doesn't exist everywhere
	Error.stackTraceLimit = Infinity;
	let error = Error();
	// @ts-ignore - doesn't exist everywhere
	Error.stackTraceLimit = limit;
	const stack = fn(error.stack);

	if (!stack) return null;

	define_property(error, 'stack', {
		value: stack
	});

	define_property(error, 'name', {
		value: label
	});

	return /** @type {Error & { stack: string }} */ (error);
}
