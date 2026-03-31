/** @import { Derived, Reaction, Value } from '#client' */
import { UNINITIALIZED } from '../../../constants.js';
import { snapshot } from '../../shared/clone.js';
import { DERIVED, ASYNC, PROXY_PATH_SYMBOL, STATE_SYMBOL } from '#client/constants';
import { effect_tracking } from '../reactivity/effects.js';
import { active_reaction, untrack } from '../runtime.js';

/**
 * @typedef {{
 *   traces: Error[];
 * }} TraceEntry
 */

/** @type {{ reaction: Reaction | null, entries: Map<Value, TraceEntry> } | null} */
export let tracing_expressions = null;

/**
 * @param {Value} signal
 * @param {TraceEntry} [entry]
 */
function log_entry(signal, entry) {
	const value = signal.v;

	if (value === UNINITIALIZED) {
		return;
	}

	const type = get_type(signal);
	const current_reaction = /** @type {Reaction} */ (active_reaction);
	const dirty = signal.wv > current_reaction.wv || current_reaction.wv === 0;
	const style = dirty
		? 'color: CornflowerBlue; font-weight: bold'
		: 'color: grey; font-weight: normal';

	// eslint-disable-next-line no-console
	console.groupCollapsed(
		signal.label ? `%c${type}%c ${signal.label}` : `%c${type}%c`,
		style,
		dirty ? 'font-weight: normal' : style,
		typeof value === 'object' && value !== null && STATE_SYMBOL in value
			? snapshot(value, true)
			: value
	);

	if (type === '$derived') {
		const deps = new Set(/** @type {Derived} */ (signal).deps);
		for (const dep of deps) {
			log_entry(dep);
		}
	}

	if (signal.created) {
		// eslint-disable-next-line no-console
		console.log(signal.created);
	}

	if (dirty && signal.updated) {
		for (const updated of signal.updated.values()) {
			if (updated.error) {
				// eslint-disable-next-line no-console
				console.log(updated.error);
			}
		}
	}

	if (entry) {
		for (var trace of entry.traces) {
			// eslint-disable-next-line no-console
			console.log(trace);
		}
	}

	// eslint-disable-next-line no-console
	console.groupEnd();
}

/**
 * @param {Value} signal
 * @returns {'$state' | '$derived' | 'store'}
 */
function get_type(signal) {
	if ((signal.f & (DERIVED | ASYNC)) !== 0) return '$derived';
	return signal.label?.startsWith('$') ? 'store' : '$state';
}

/**
 * @template T
 * @param {() => string} label
 * @param {() => T} fn
 */
export function trace(label, fn) {
	var previously_tracing_expressions = tracing_expressions;

	try {
		tracing_expressions = { entries: new Map(), reaction: active_reaction };

		var start = performance.now();
		var value = fn();
		var time = (performance.now() - start).toFixed(2);

		var prefix = untrack(label);

		if (!effect_tracking()) {
			// eslint-disable-next-line no-console
			console.log(`${prefix} %cran outside of an effect (${time}ms)`, 'color: grey');
		} else if (tracing_expressions.entries.size === 0) {
			// eslint-disable-next-line no-console
			console.log(`${prefix} %cno reactive dependencies (${time}ms)`, 'color: grey');
		} else {
			// eslint-disable-next-line no-console
			console.group(`${prefix} %c(${time}ms)`, 'color: grey');

			var entries = tracing_expressions.entries;

			untrack(() => {
				for (const [signal, traces] of entries) {
					log_entry(signal, traces);
				}
			});

			tracing_expressions = null;

			// eslint-disable-next-line no-console
			console.groupEnd();
		}

		return value;
	} finally {
		tracing_expressions = previously_tracing_expressions;
	}
}

/**
 * Recursively compares two values for deep equality.
 * Used to detect when a $state initial value has changed in source code
 * (e.g., `$state(0)` → `$state(10)`), so we know not to restore the
 * old runtime value over the developer's intentional code change.
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
function deep_equal(a, b) {
	if (a === b) return true;

	if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) return true;

	if (a == null || b == null || typeof a !== typeof b) return false;

	if (typeof a === 'object') {
		if (Array.isArray(a)) {
			if (!Array.isArray(b) || a.length !== b.length) return false;
			for (var i = 0; i < a.length; i++) {
				if (!deep_equal(a[i], b[i])) return false;
			}
			return true;
		}

		if (Array.isArray(b)) return false;

		var keys_a = Object.keys(/** @type {object} */ (a));
		var keys_b = Object.keys(/** @type {object} */ (b));
		if (keys_a.length !== keys_b.length) return false;
		for (var i = 0; i < keys_a.length; i++) {
			var key = keys_a[i];
			if (!(key in /** @type {object} */ (b)) || !deep_equal(/** @type {any} */ (a)[key], /** @type {any} */ (b)[key])) return false;
		}
		return true;
	}

	return false;
}

/**
 * @param {Value} source
 * @param {string} label
 */
export function tag(source, label) {
	source.label = label;

	// Record the initial value from source code BEFORE any restoration,
	// so collect_state() can later save it alongside the runtime value.
	// This lets the next HMR cycle detect when the developer changed
	// the initial value (e.g., $state(0) → $state(10)).
	source.initial = source.v;

	// HMR state preservation: if $.hmr() captured state from the
	// previous component, restore the signal value here — before
	// template effects render the DOM with the default value.
	// Only restore if the initial value hasn't changed in source code.
	/** @type {Map<string, {value: any, initial: any}> | undefined} */
	var preserved = /** @type {any} */ (globalThis).__hmr_preserved_state__;
	if (preserved !== undefined && preserved.has(label)) {
		var entry = preserved.get(label);
		// If the developer changed the initial value, respect their
		// code change instead of restoring the old runtime value
		if (entry && deep_equal(entry.initial, source.v)) {
			source.v = entry.value;
		}
	}

	tag_proxy(source.v, label);

	return source;
}

/**
 * @param {unknown} value
 * @param {string} label
 */
export function tag_proxy(value, label) {
	// @ts-expect-error
	value?.[PROXY_PATH_SYMBOL]?.(label);
	return value;
}

/**
 * @param {unknown} value
 */
export function label(value) {
	if (typeof value === 'symbol') return `Symbol(${value.description})`;
	if (typeof value === 'function') return '<function>';
	if (typeof value === 'object' && value) return '<object>';
	return String(value);
}
