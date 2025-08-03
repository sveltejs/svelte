/** @import { Value } from '#client' */
import { internal_set } from './reactivity/sources.js';
import { untrack } from './runtime.js';

/**
 * @type {Set<Value> | null}
 * @deprecated
 */
export let captured_signals = null;

/**
 * Capture an array of all the signals that are read when `fn` is called
 * @template T
 * @param {() => T} fn
 */
function capture_signals(fn) {
	var previous_captured_signals = captured_signals;

	try {
		captured_signals = new Set();

		untrack(fn);

		if (previous_captured_signals !== null) {
			for (var signal of captured_signals) {
				previous_captured_signals.add(signal);
			}
		}

		return captured_signals;
	} finally {
		captured_signals = previous_captured_signals;
	}
}

/**
 * Invokes a function and captures all signals that are read during the invocation,
 * then invalidates them.
 * @param {() => any} fn
 * @deprecated
 */
export function invalidate_inner_signals(fn) {
	for (var signal of capture_signals(fn)) {
		internal_set(signal, signal.v);
	}
}
