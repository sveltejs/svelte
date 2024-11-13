import { snapshot } from '../../shared/clone.js';
import { define_property } from '../../shared/utils.js';
import { STATE_SYMBOL } from '../constants.js';
import { captured_signals, set_captured_signals } from '../runtime.js';

export const NOT_REACTIVE = 0;
export const REACTIVE_UNCHANGED = 1;
export const REACTIVE_CHANGED = 2;
export const REACTIVE_CHANGED_CACHED = 3;

/** @type { { changed: boolean, label: string, time: number, sub: any, stacks: any[], value: any }[] | null } */
export let tracing_expressions = null;
/** @type { 0 | 1 | 2 | 3 } */
export let tracing_expression_reactive = NOT_REACTIVE;

/**
 * @param {any} expressions
 */
function log_expressions(expressions) {
	for (let expression of expressions) {
		const val = expression.value;
		const label = expression.label;
		const time = expression.time;
		const changed = expression.changed;

		if (time) {
			// eslint-disable-next-line no-console
			console.groupCollapsed(
				`%c${label} %c(${time.toFixed(2)}ms)`,
				changed ? 'color: CornflowerBlue; font-weight: bold' : 'color: grey; font-weight: bold',
				'color: grey',
				val && typeof val === 'object' && STATE_SYMBOL in val ? snapshot(val, true) : val
			);
		} else {
			// eslint-disable-next-line no-console
			console.groupCollapsed(
				`%c${label}`,
				changed ? 'color: CornflowerBlue; font-weight: bold' : 'color: grey; font-weight: bold',
				val && typeof val === 'object' && STATE_SYMBOL in val ? snapshot(val, true) : val
			);
		}

		if (expression.sub) {
			log_expressions(expression.sub);
		}

		for (var [name, stack] of expression.stacks) {
			// eslint-disable-next-line no-console
			console.groupCollapsed('%c' + name + ' stack', 'color: white; font-weight: normal;');
			// eslint-disable-next-line no-console
			console.log(stack);
			// eslint-disable-next-line no-console
			console.groupEnd();
		}

		// eslint-disable-next-line no-console
		console.groupEnd();
	}
}

/**
 * @template T
 * @param {() => T} fn
 * @param {string} label
 */
export function log_trace(fn, label) {
	var previously_tracing_expressions = tracing_expressions;
	try {
		tracing_expressions = [];

		var start = performance.now();
		var value = fn();
		var time = (performance.now() - start).toFixed(2);
		if (tracing_expressions.length > 0) {
			// eslint-disable-next-line no-console
			console.group(`${label} %c(${time}ms)`, 'color: grey');
			log_expressions(tracing_expressions);
			// eslint-disable-next-line no-console
			console.groupEnd();
		} else {
			// eslint-disable-next-line no-console
			console.log(`${label} %cno reactive dependencies (${time}ms)`, 'color: grey');
		}

		if (previously_tracing_expressions !== null) {
			previously_tracing_expressions.push(...tracing_expressions);
		}

		return value;
	} finally {
		tracing_expressions = previously_tracing_expressions;
	}
}

/**
 * @template T
 * @param {() => T} fn
 * @param {boolean} [computed]
 * @param {string} label
 */
export function trace(fn, label, computed) {
	// If we aren't capturing the trace, just return the value
	if (tracing_expressions === null) {
		return fn();
	}
	var previously_tracing_expressions = tracing_expressions;
	var previously_tracing_expression_reactive = tracing_expression_reactive;
	var previous_captured_signals = captured_signals;
	var signals = new Set();
	set_captured_signals(signals);

	try {
		tracing_expression_reactive = NOT_REACTIVE;
		tracing_expressions = [];
		var value,
			time = 0;

		if (computed) {
			var start = performance.now();
			value = fn();
			time = performance.now() - start;
		} else {
			value = fn();
		}

		if (tracing_expressions !== null) {
			var read_stack = ['read', get_stack()];

			if (tracing_expression_reactive !== NOT_REACTIVE) {
				var set_stack;
				if (signals.size === 1) {
					set_stack = Array.from(signals)[0].stack;
				}
				var sub = null;
				if (tracing_expressions.length !== 0) {
					sub = tracing_expressions.slice();
					tracing_expressions = [];
				}
				tracing_expressions.push({
					changed:
						tracing_expression_reactive === REACTIVE_CHANGED ||
						tracing_expression_reactive === REACTIVE_CHANGED_CACHED,
					label: label + (tracing_expression_reactive === REACTIVE_CHANGED_CACHED ? ' [cached derived]' : ''),
					value,
					time,
					stacks: set_stack ? [read_stack, set_stack] : [read_stack],
					sub
				});

				if (previously_tracing_expressions !== null) {
					previously_tracing_expressions.push(...tracing_expressions);
				}
			} else if (tracing_expressions.length !== 0) {
				previously_tracing_expressions.push({
					changed: tracing_expressions.some((e) => e.changed),
					label,
					value,
					time,
					stacks: [read_stack],
					sub: tracing_expressions
				});
			}
		}

		return value;
	} finally {
		tracing_expressions = previously_tracing_expressions;
		tracing_expression_reactive = previously_tracing_expression_reactive;
		set_captured_signals(previous_captured_signals);
	}
}

/**
 * @param {0 | 1 | 2 | 3} value
 */
export function set_tracing_expression_reactive(value) {
	tracing_expression_reactive = value;
}

export function get_stack() {
	let error = Error();
	const stack = error.stack;

	if (stack) {
		const lines = stack.split('\n');
		const new_lines = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.includes('svelte/src/internal')) {
				continue;
			}
			new_lines.push(line);
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
