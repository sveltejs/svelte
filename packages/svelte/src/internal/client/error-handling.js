/** @import { ComponentContext, Effect } from '#client' */
import { DEV } from 'esm-env';
import { FILENAME } from '../../constants.js';
import { is_firefox } from './dom/operations.js';
import { BOUNDARY_EFFECT, DESTROYED } from './constants.js';
import { define_property } from '../shared/utils.js';

// Used for DEV time error handling
/** @param {WeakSet<Error>} value */
const handled_errors = new WeakSet();

let is_throwing_error = false;

export function reset_is_throwing_error() {
	is_throwing_error = false;
}

/**
 * @param {unknown} error
 * @param {Effect} effect
 * @param {Effect | null} [previous_effect]
 */
export function handle_error(error, effect, previous_effect = null) {
	var component_context = effect.ctx;

	if (is_throwing_error) {
		if (previous_effect === null) {
			is_throwing_error = false;
		}

		if (should_rethrow_error(effect)) {
			throw error;
		}

		return;
	}

	if (previous_effect !== null) {
		is_throwing_error = true;
	}

	if (DEV && component_context !== null && error instanceof Error && !handled_errors.has(error)) {
		handled_errors.add(error);

		const component_stack = [];

		const effect_name = effect.fn?.name;

		if (effect_name) {
			component_stack.push(effect_name);
		}

		/** @type {ComponentContext | null} */
		let current_context = component_context;

		while (current_context !== null) {
			/** @type {string} */
			var filename = current_context.function?.[FILENAME];

			if (filename) {
				const file = filename.split('/').pop();
				component_stack.push(file);
			}

			current_context = current_context.p;
		}

		const indent = is_firefox ? '  ' : '\t';
		define_property(error, 'message', {
			value:
				error.message + `\n${component_stack.map((name) => `\n${indent}in ${name}`).join('')}\n`
		});
		define_property(error, 'component_stack', {
			value: component_stack
		});

		const stack = error.stack;

		// Filter out internal files from callstack
		if (stack) {
			const lines = stack.split('\n');
			const new_lines = [];
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (line.includes('svelte/src/internal')) {
					continue;
				}
				new_lines.push(line);
			}
			define_property(error, 'stack', {
				value: new_lines.join('\n')
			});
		}
	}

	invoke_error_boundary(error, effect);

	if (should_rethrow_error(effect)) {
		throw error;
	}
}

/**
 * @param {unknown} error
 * @param {Effect} effect
 */
function invoke_error_boundary(error, effect) {
	/** @type {Effect | null} */
	var current = effect;

	while (current !== null) {
		if ((current.f & BOUNDARY_EFFECT) !== 0) {
			try {
				// @ts-expect-error
				current.fn(error);
				return;
			} catch {
				// Remove boundary flag from effect
				current.f ^= BOUNDARY_EFFECT;
			}
		}

		current = current.parent;
	}

	is_throwing_error = false;
	throw error;
}

/**
 * @param {Effect} effect
 */
function should_rethrow_error(effect) {
	return (
		(effect.f & DESTROYED) === 0 &&
		(effect.parent === null || (effect.parent.f & BOUNDARY_EFFECT) === 0)
	);
}
