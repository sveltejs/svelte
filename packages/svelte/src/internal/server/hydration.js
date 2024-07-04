import {
	HYDRATION_ANCHOR,
	HYDRATION_END,
	HYDRATION_END_ELSE,
	HYDRATION_START,
	HYDRATION_START_ELSE
} from '../../constants.js';

export const BLOCK_OPEN = `<!--${HYDRATION_START}-->`;
export const BLOCK_OPEN_ELSE = `<!--${HYDRATION_START_ELSE}-->`;
export const BLOCK_CLOSE = `<!--${HYDRATION_END}-->`;
export const BLOCK_ANCHOR = `<!--${HYDRATION_ANCHOR}-->`;
export const BLOCK_CLOSE_ELSE = `<!--${HYDRATION_END_ELSE}-->`;
