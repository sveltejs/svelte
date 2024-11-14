/** @import { Derived, Reaction, Signal, Value } from '#client' */
import { UNINITIALIZED } from '../../../constants.js';
import { snapshot } from '../../shared/clone.js';
import { define_property } from '../../shared/utils.js';
import { DERIVED, STATE_SYMBOL } from '../constants.js';
import {
	active_reaction,
	captured_signals,
	set_captured_signals,
	trace_version,
	untrack
} from '../runtime.js';

/** @type { any } */
export let tracing_expressions = null;

/**
 * @param { Value } signal
 * @param { number } version
 * @param { { read: Error[] } } [entry]
 */
function log_entry(signal, version, entry) {
	const debug = signal.debug;
	const value = signal.v;

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
				log_entry(dep, signal.version);
			}
			return;
		}
	}
	const type = (signal.f & DERIVED) !== 0 ? 'derived' : 'state';
	const current_reaction = /** @type {Reaction} */ (active_reaction);
	const status =
		signal.version > current_reaction.version || version === signal.version ? 'dirty' : 'clean';
	// eslint-disable-next-line no-console
	console.groupCollapsed(
		`%c${type}`,
		status !== 'clean'
			? 'color: CornflowerBlue; font-weight: bold'
			: 'color: grey; font-weight: bold',
		typeof value === 'object' && STATE_SYMBOL in value ? snapshot(value, true) : value
	);

	if (type === 'derived') {
		const deps = new Set(/** @type {Derived} */ (signal).deps);
		for (const dep of deps) {
			log_entry(dep, version);
		}
	}

	const read = entry?.read;

	if (read && read.length > 0) {
		// eslint-disable-next-line no-console
		console.groupCollapsed('tracked');
		for (var stack of read) {
			// eslint-disable-next-line no-console
			console.log(stack);
		}
		// eslint-disable-next-line no-console
		console.groupEnd();
	}
	const created = signal.created;

	if (created) {
		// eslint-disable-next-line no-console
		console.groupCollapsed('created');
		// eslint-disable-next-line no-console
		console.log(created);
		// eslint-disable-next-line no-console
		console.groupEnd();
	}
	const updated = signal.updated;

	if (updated) {
		// eslint-disable-next-line no-console
		console.groupCollapsed('updated');
		// eslint-disable-next-line no-console
		console.log(updated);
		// eslint-disable-next-line no-console
		console.groupEnd();
	}
	// eslint-disable-next-line no-console
	console.groupEnd();
}

/**
 * @template T
 * @param {() => T} fn
 * @param {string} label
 */
export function trace(fn, label) {
	var previously_tracing_expressions = tracing_expressions;
	try {
		tracing_expressions = { entries: new Map(), reaction: active_reaction };

		var start = performance.now();
		var version = trace_version;
		var value = fn();
		var time = (performance.now() - start).toFixed(2);

		if (tracing_expressions.size === 0) {
			// eslint-disable-next-line no-console
			console.log(`${label} %cno reactive dependencies (${time}ms)`, 'color: grey');
		} else {
			// eslint-disable-next-line no-console
			console.group(`${label} %c(${time}ms)`, 'color: grey');

			var entries = tracing_expressions.entries;

			tracing_expressions = null;

			for (const [signal, entry] of entries) {
				log_entry(signal, version, entry);
			}
			// eslint-disable-next-line no-console
			console.groupEnd();
		}

		if (previously_tracing_expressions !== null) {
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

export function get_stack() {
	let error = Error();
	const stack = error.stack;

	if (stack) {
		const lines = stack.split('\n');
		const new_lines = ['\n'];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.includes('validate_each_keys')) {
				return null;
			}
			if (line.includes('svelte/src/internal') || !line.includes('.svelte')) {
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
			value: 'TraceInvokedError'
		});
	}
	return error;
}
