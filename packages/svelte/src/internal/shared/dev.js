import { define_property } from './utils';

/**
 * @param {string} label
 * @param {(stack: string | undefined) => string | undefined} fn
 * @returns {Error & { stack: string } | null}
 */
export function get_infinite_stack(label, fn) {
	const limit = Error.stackTraceLimit;
	Error.stackTraceLimit = Infinity;
	let error = Error();
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
