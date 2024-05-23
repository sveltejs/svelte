import { yield_updates } from '../../../runtime.js';
import { listen } from './shared.js';

/**
 * @param {(online: boolean) => void} update
 * @returns {void}
 */
export function bind_online(update) {
	listen(window, ['online', 'offline'], () => {
		yield_updates(() => update(navigator.onLine));
	});
}
