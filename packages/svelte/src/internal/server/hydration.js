import { HYDRATION_END, HYDRATION_START, HYDRATION_START_ELSE } from '../../constants.js';

export const BLOCK_OPEN = `<!--${HYDRATION_START}-->`;
export const BLOCK_OPEN_ELSE = `<!--${HYDRATION_START_ELSE}-->`;
export const BLOCK_CLOSE = `<!--${HYDRATION_END}-->`;
export const EMPTY_COMMENT = `<!---->`;

let hydratable = true;

export function is_hydratable() {
	return hydratable;
}

/**
 *
 * @param {boolean} new_hydratable
 */
export function set_hydratable(new_hydratable) {
	hydratable = new_hydratable;
}
