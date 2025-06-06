/** @import { Effect } from '#client' */
import { DEV } from 'esm-env';
import { FILENAME } from '../../constants.js';
import { is_firefox } from './dom/operations.js';
import { BOUNDARY_EFFECT, EFFECT_RAN } from './constants.js';
import { define_property } from '../shared/utils.js';
import { active_effect } from './runtime.js';

/**
 * @param {unknown} error
 */
export function handle_error(error) {
	var effect = /** @type {Effect} */ (active_effect);

	if (DEV && error instanceof Error) {
		adjust_error(error, effect);
	}

	if ((effect.f & EFFECT_RAN) === 0) {
		// if the error occurred while creating this subtree, we let it
		// bubble up until it hits a boundary that can handle it
		if ((effect.f & BOUNDARY_EFFECT) === 0) {
			throw error;
		}

		// @ts-expect-error
		effect.fn(error);
	} else {
		// otherwise we bubble up the effect tree ourselves
		invoke_error_boundary(error, effect);
	}
}

/**
 * @param {unknown} error
 * @param {Effect | null} effect
 */
export function invoke_error_boundary(error, effect) {
	while (effect !== null) {
		if ((effect.f & BOUNDARY_EFFECT) !== 0) {
			try {
				// @ts-expect-error
				effect.fn(error);
				return;
			} catch {}
		}

		effect = effect.parent;
	}

	throw error;
}

/** @type {WeakSet<Error>} */
const adjusted_errors = new WeakSet();

/**
 * Add useful information to the error message/stack in development
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
