import { define_property } from './utils.js';

/**
 * @param {string} label
 * @returns {Error & { stack: string } | null}
 */
export function get_stack(label) {
	// @ts-ignore stackTraceLimit doesn't exist everywhere
	const limit = Error.stackTraceLimit;

	// @ts-ignore
	Error.stackTraceLimit = Infinity;
	let error = Error();

	// @ts-ignore
	Error.stackTraceLimit = limit;

	const stack = error.stack;

	if (!stack) return null;

	const lines = stack.split('\n');
	const new_lines = ['\n'];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const posixified = line.replaceAll('\\', '/');

		if (line === 'Error') {
			continue;
		}

		if (line.includes('validate_each_keys')) {
			return null;
		}

		if (posixified.includes('svelte/src/internal') || posixified.includes('node_modules/.vite')) {
			continue;
		}

		new_lines.push(line);
	}

	if (new_lines.length === 1) {
		return null;
	}

	define_property(error, 'stack', {
		value: new_lines.join('\n')
	});

	define_property(error, 'name', {
		value: label
	});

	return /** @type {Error & { stack: string }} */ (error);
}
