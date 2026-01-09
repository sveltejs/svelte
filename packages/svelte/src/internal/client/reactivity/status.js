/** @import { Signal } from '#client' */
import { CLEAN, DIRTY, MAYBE_DIRTY } from '#client/constants';

const STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);

/**
 * @param {Signal} signal
 * @param {number} status
 */
export function set_signal_status(signal, status) {
	signal.f = (signal.f & STATUS_MASK) | status;
}
