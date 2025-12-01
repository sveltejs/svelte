import { UNINITIALIZED } from '../../../constants.js';
import { snapshot } from '../../shared/clone.js';
import { eager_effect, render_effect, validate_effect } from '../reactivity/effects.js';
import { untrack } from '../runtime.js';
import { get_error } from '../../shared/dev.js';

/**
 * @param {() => any[]} get_value
 * @param {Function} inspector
 * @param {boolean} show_stack
 */
export function inspect(get_value, inspector, show_stack = false) {
	validate_effect('$inspect');

	let initial = true;
	let error = /** @type {any} */ (UNINITIALIZED);

	// Inspect effects runs synchronously so that we can capture useful
	// stack traces. As a consequence, reading the value might result
	// in an error (an `$inspect(object.property)` will run before the
	// `{#if object}...{/if}` that contains it)
	eager_effect(() => {
		try {
			var value = get_value();
		} catch (e) {
			error = e;
			return;
		}

		var snap = snapshot(value, true, true);
		untrack(() => {
			if (show_stack) {
				inspector(...snap);

				if (!initial) {
					const stack = get_error('$inspect(...)');
					if (stack) {
						// eslint-disable-next-line no-console
						console.groupCollapsed('stack trace');
						// eslint-disable-next-line no-console
						console.log(stack);
						// eslint-disable-next-line no-console
						console.groupEnd();
					}
				}
			} else {
				inspector(initial ? 'init' : 'update', ...snap);
			}
		});

		initial = false;
	});

	// If an error occurs, we store it (along with its stack trace).
	// If the render effect subsequently runs, we log the error,
	// but if it doesn't run it's because the `$inspect` was
	// destroyed, meaning we don't need to bother
	render_effect(() => {
		try {
			// call `get_value` so that this runs alongside the inspect effect
			get_value();
		} catch {
			// ignore
		}

		if (error !== UNINITIALIZED) {
			// eslint-disable-next-line no-console
			console.error(error);
			error = UNINITIALIZED;
		}
	});
}
