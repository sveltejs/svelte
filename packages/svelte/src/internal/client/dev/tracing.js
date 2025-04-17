/** @import { Derived, Reaction, Value } from '#client' */
import { UNINITIALIZED } from '../../../constants.js';
import { snapshot } from '../../shared/clone.js';
import { define_property } from '../../shared/utils.js';
import { DERIVED, STATE_SYMBOL } from '#client/constants';
import { effect_tracking } from '../reactivity/effects.js';
import { active_reaction, captured_signals, set_captured_signals, untrack } from '../runtime.js';

/** @type { any } */
export let tracing_expressions = null;

/**
 * @param { Value } signal
 * @param { { read: Error[] } } [entry]
 */
function log_entry(signal, entry) {
	const debug = signal.debug;
	const value = signal.trace_need_increase ? signal.trace_v : signal.v;

	if (value === UNINITIALIZED) {
		return;
	}

	if (debug) {
		var previous_captured_signals = captured_signals;
		var captured = new Set();
		set_captured_signals(captured);
		try {
			untrack(() => {
				debug();
			});
		} finally {
			set_captured_signals(previous_captured_signals);
		}
		if (captured.size > 0) {
			for (const dep of captured) {
				log_entry(dep);
			}
			return;
		}
	}

	const type = (signal.f & DERIVED) !== 0 ? '$derived' : '$state';
	const current_reaction = /** @type {Reaction} */ (active_reaction);
	const dirty = signal.wv > current_reaction.wv || current_reaction.wv === 0;

	// eslint-disable-next-line no-console
	console.groupCollapsed(
		`%c${type}`,
		dirty ? 'color: CornflowerBlue; font-weight: bold' : 'color: grey; font-weight: bold',
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

	if (signal.updated) {
		// eslint-disable-next-line no-console
		console.log(signal.updated);
	}

	const read = entry?.read;

	if (read && read.length > 0) {
		for (var stack of read) {
			// eslint-disable-next-line no-console
			console.log(stack);
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

		if (!effect_tracking()) {
			// eslint-disable-next-line no-console
			console.log(`${label()} %cran outside of an effect (${time}ms)`, 'color: grey');
		} else if (tracing_expressions.entries.size === 0) {
			// eslint-disable-next-line no-console
			console.log(`${label()} %cno reactive dependencies (${time}ms)`, 'color: grey');
		} else {
			// eslint-disable-next-line no-console
			console.group(`${label()} %c(${time}ms)`, 'color: grey');

			var entries = tracing_expressions.entries;

			tracing_expressions = null;

			for (const [signal, entry] of entries) {
				log_entry(signal, entry);
			}
			// eslint-disable-next-line no-console
			console.groupEnd();
		}

		if (previously_tracing_expressions !== null && tracing_expressions !== null) {
			for (const [signal, entry] of tracing_expressions.entries) {
				var prev_entry = previously_tracing_expressions.get(signal);

				if (prev_entry === undefined) {
					previously_tracing_expressions.set(signal, entry);
				} else {
					prev_entry.read.push(...entry.read);
				}
			}
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
