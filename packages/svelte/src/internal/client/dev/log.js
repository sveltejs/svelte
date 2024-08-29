import { STATE_SYMBOL } from '../constants.js';
import { VERSION } from '../../../version.js';
import { snapshot } from '../../shared/clone.js';
import * as w from '../warnings.js';

export function install_custom_formatter() {
	// Custom formatters are 'supported' in Firefox, but they're worse than useless.
	// They're not supported in Firefox. We can maybe tweak this over time
	var is_chrome = navigator.userAgent.includes('Chrome');
	var custom_formatters_enabled = false;

	if (is_chrome) {
		// @ts-expect-error
		(window.devtoolsFormatters ??= []).push({
			/**
			 * @param {any} object
			 * @param {any} config
			 */
			header(object, config) {
				custom_formatters_enabled = true;

				if (STATE_SYMBOL in object) {
					return [
						'div',
						{},
						['span', { style: 'font-weight: bold' }, '$state'],
						['object', { object: snapshot(object), config }]
					];
				}

				return null;
			},

			hasBody: () => false
		});
	}

	console.log(`Running Svelte in development mode`, { version: VERSION });

	if (is_chrome && !custom_formatters_enabled) {
		w.enable_custom_formatters();
	}
}
