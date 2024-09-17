import { STATE_SYMBOL } from '../constants.js';
import { snapshot } from '../../shared/clone.js';
import * as w from '../warnings.js';
import { untrack } from '../runtime.js';

/**
 * @param {string} method
 * @param  {...any} objects
 */
export function log_if_contains_state(method, ...objects) {
	untrack(() => {
		try {
			let has_state = false;
			const transformed = [];

			for (const obj of objects) {
				if (obj && typeof obj === 'object' && STATE_SYMBOL in obj) {
					transformed.push(snapshot(obj, true));
					has_state = true;
				} else {
					transformed.push(obj);
				}
			}

			if (has_state) {
				w.console_log_state(method);

				// eslint-disable-next-line no-console
				console.log('%c[snapshot]', 'color: grey', ...transformed);
			}
		} catch {}
	});

	return objects;
}
