import { DEV } from 'esm-env';
import { FILENAME } from '../../../constants.js';
import { dev_current_component_function } from '../runtime.js';

/**
 *
 * @param {number} [line]
 * @param {number} [column]
 */
export function get_location(line, column) {
	if (!DEV || line === undefined) return undefined;

	var filename = dev_current_component_function?.[FILENAME];
	var location = filename && `${filename}:${line}:${column}`;

	return sanitize_location(location);
}

/**
 * Prevent devtools trying to make `location` a clickable link by inserting a zero-width space
 * @param {string | undefined} location
 */
export function sanitize_location(location) {
	return location?.replace(/\//g, '/\u200b');
}
