import { UNINITIALIZED } from '../../../constants.js';
import { snapshot } from '../../shared/clone.js';
import { inspect_effect, validate_effect } from '../reactivity/effects.js';

/**
 * @param {() => any[]} get_value
 * @param {Function} [inspector]
 */
// eslint-disable-next-line no-console
export function inspect(get_value, inspector = console.log) {
	validate_effect('$inspect');

	let initial = true;

	inspect_effect(() => {
		/** @type {any} */
		var value = UNINITIALIZED;

		// Capturing the value might result in an exception due to the inspect effect being
		// sync and thus operating on stale data. In the case we encounter an exception we
		// can bail-out of reporting the value
		try {
			value = get_value();
		} catch {
			// NO-OP
		}

		if (value !== UNINITIALIZED) {
			inspector(initial ? 'init' : 'update', ...snapshot(value, true));
		}

		initial = false;
	});
}
