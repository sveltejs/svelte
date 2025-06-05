/** @import { Effect } from '#client' */
import { DEV } from 'esm-env';
import { FILENAME } from '../../constants.js';
import { is_firefox } from './dom/operations.js';
import { BOUNDARY_EFFECT, DESTROYED } from './constants.js';
import { define_property } from '../shared/utils.js';

// Used for DEV time error handling
/** @param {WeakSet<Error>} value */
const adjusted_errors = new WeakSet();

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

	if (DEV && error instanceof Error) {
		adjust_error(error, effect);
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

/**
 * Add useful information to the error message/stack
 * @param {Error} error
 * @param {Effect} effect
 */
function adjust_error(error, effect) {
	if (adjusted_errors.has(error)) return;
	adjusted_errors.add(error);

	const component_stack = [effect.fn?.name ?? '<unknown>'];
	const indent = is_firefox ? '  ' : '\t';

	var context = effect.ctx;

	while (context !== null) {
		component_stack.push(context.function?.[FILENAME].split('/').pop());
		context = context.p;
	}

	define_property(error, 'message', {
		value: error.message + `\n${component_stack.map((name) => `\n${indent}in ${name}`).join('')}\n`
	});

	// TODO what is this for? can we get rid of it?
	define_property(error, 'component_stack', {
		value: component_stack
	});

	// Filter out internal files from callstack
	if (error.stack) {
		define_property(error, 'stack', {
			value: error.stack
				.split('\n')
				.filter((line) => !line.includes('svelte/src/internal'))
				.join('\n')
		});
	}
}
