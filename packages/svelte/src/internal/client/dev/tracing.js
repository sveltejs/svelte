/** @import { Derived, Reaction, Value } from '#client' */
import { UNINITIALIZED } from '../../../constants.js';
import { snapshot } from '../../shared/clone.js';
import { define_property } from '../../shared/utils.js';
import { DERIVED, PROXY_PATH_SYMBOL, STATE_SYMBOL } from '#client/constants';
import { effect_tracking } from '../reactivity/effects.js';
import { active_reaction, captured_signals, set_captured_signals, untrack } from '../runtime.js';

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

	const type = (signal.f & DERIVED) !== 0 ? '$derived' : '$state';
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
		// eslint-disable-next-line no-console
		console.log(signal.updated);
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
 * @param {string} label
 */
export function get_stack(label) {
	let error = Error();
	const stack = error.stack;

	if (stack) {
		const lines = stack.split('\n');
		const new_lines = ['\n'];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			if (line === 'Error') {
				continue;
			}
			if (line.includes('validate_each_keys')) {
				return null;
			}
			if (line.includes('svelte/src/internal')) {
				continue;
			}
			new_lines.push(line);
		}

		if (new_lines.length === 1) {
			return null;
		}

		define_property(error, 'stack', {
			value: new_lines.join('\n')
		});

		define_property(error, 'name', {
			// 'Error' suffix is required for stack traces to be rendered properly
			value: `${label}Error`
		});
	}
	return error;
}

/**
 * @param {Value} source
 * @param {string} label
 */
export function tag(source, label) {
	source.label = label;
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
