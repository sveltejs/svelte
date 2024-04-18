import { snapshot } from '../reactivity/snapshot.js';
import { render_effect } from '../reactivity/effects.js';
import { current_effect, deep_read } from '../runtime.js';

/** @type {Function | null} */
export let inspect_fn = null;

/** @param {Function | null} fn */
export function set_inspect_fn(fn) {
	inspect_fn = fn;
}

/** @type {Array<import('#client').ValueDebug>} */
export let inspect_captured_signals = [];

/**
 * @param {() => any[]} get_value
 * @param {Function} [inspector]
 */
// eslint-disable-next-line no-console
export function inspect(get_value, inspector = console.log) {
	if (!current_effect) {
		throw new Error(
			'$inspect can only be used inside an effect (e.g. during component initialisation)'
		);
	}

	let initial = true;

	// we assign the function directly to signals, rather than just
	// calling `inspector` directly inside the effect, so that
	// we get useful stack traces
	var fn = () => {
		const value = snapshot(get_value());
		inspector(initial ? 'init' : 'update', ...value);
	};

	render_effect(() => {
		inspect_fn = fn;
		deep_read(get_value());
		inspect_fn = null;

		const signals = inspect_captured_signals.slice();
		inspect_captured_signals = [];

		if (initial) {
			fn();
			initial = false;
		}

		return () => {
			for (const s of signals) {
				s.inspect.delete(fn);
			}
		};
	});
}
