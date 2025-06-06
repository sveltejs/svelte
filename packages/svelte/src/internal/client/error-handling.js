/** @import { Effect } from '#client' */
import { DEV } from 'esm-env';
import { FILENAME } from '../../constants.js';
import { is_firefox } from './dom/operations.js';
import { BOUNDARY_EFFECT, EFFECT_RAN } from './constants.js';
import { define_property } from '../shared/utils.js';
import { active_effect } from './runtime.js';

// Used for DEV time error handling
/** @param {WeakSet<Error>} value */
const adjusted_errors = new WeakSet();

/**
 * @param {unknown} error
 */
export function handle_error(error) {
	var effect = /** @type {Effect} */ (active_effect);

	if (DEV && error instanceof Error) {
		adjust_error(error, effect);
	}

	if ((effect.f & EFFECT_RAN) !== 0) {
		invoke_error_boundary(error, effect);
	} else if ((effect.f & BOUNDARY_EFFECT) !== 0) {
		// invoke directly
		effect.fn(error);
	} else {
		throw error;
	}
}

/**
 * @param {unknown} error
 * @param {Effect} effect
 */
export function invoke_error_boundary(error, effect) {
	/** @type {Effect | null} */
	var current = effect;

	while (current !== null) {
		if ((current.f & BOUNDARY_EFFECT) !== 0) {
			try {
				// @ts-expect-error
				current.fn(error);
				return;
			} catch {}
		}

		current = current.parent;
	}

	throw error;
}

/**
 * Add useful information to the error message/stack
 * @param {Error} error
 * @param {Effect} effect
 */
function adjust_error(error, effect) {
	if (adjusted_errors.has(error)) return;
	adjusted_errors.add(error);

	var indent = is_firefox ? '  ' : '\t';
	var component_stack = `\n${indent}in ${effect.fn?.name || '<unknown>'}`;
	var context = effect.ctx;

	while (context !== null) {
		component_stack += `\n${indent}in ${context.function?.[FILENAME].split('/').pop()}`;
		context = context.p;
	}

	define_property(error, 'message', {
		value: error.message + `\n${component_stack}\n`
	});

	if (error.stack) {
		// Filter out internal modules
		define_property(error, 'stack', {
			value: error.stack
				.split('\n')
				.filter((line) => !line.includes('svelte/src/internal'))
				.join('\n')
		});
	}
}
