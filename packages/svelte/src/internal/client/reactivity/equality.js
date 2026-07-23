/** @import { Equals, Value } from '#client' */
import { active_batch, current_batch } from './batch.js';

/** @param {Value} signal */
function get_value(signal) {
	var batch = active_batch ?? (current_batch?.is_fork ? current_batch : null);
	var override = batch?.values?.get(signal);

	if (override === undefined) return signal.v;

	// In a fork, or for a batch's own writes, the override _is_ the value being
	// written over. An override owned by another live batch is just that batch's
	// pre-write world being shown to us — writes must compare against the real
	// (pending) value, otherwise a write that equals the visible-but-stale value
	// would be swallowed, and one that equals the pending value would be
	// treated as a change
	return batch?.is_fork || override[1] === null ? override[0] : signal.v;
}

/** @type {Equals} */
export function equals(value) {
	return value === get_value(this);
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function safe_not_equal(a, b) {
	return a != a
		? b == b
		: a !== b || (a !== null && typeof a === 'object') || typeof a === 'function';
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function not_equal(a, b) {
	return a !== b;
}

/** @type {Equals} */
export function safe_equals(value) {
	return !safe_not_equal(value, get_value(this));
}
