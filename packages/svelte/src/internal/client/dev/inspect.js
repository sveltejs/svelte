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
		inspector(initial ? 'init' : 'update', ...snapshot(get_value(), true));
		initial = false;
	});
}
