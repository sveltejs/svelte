import { STATE_SYMBOL } from '../constants.js';
import { snapshot } from '../../shared/clone.js';

/**
 * @param  {...any} objects
 */
export function log_if_contains_state(...objects) {
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
		// eslint-disable-next-line no-console
		console.log(
			'Your console.log contained $state objects. We recommend using $inspect or $state.snapshot when logging these for better results. The snapshotted value is:\n',
			...transformed,
			'\nThe original value is:\n'
		);
	}

	return objects;
}
