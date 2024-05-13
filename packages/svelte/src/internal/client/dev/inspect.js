import { snapshot } from '../proxy.js';
import { render_effect, validate_effect } from '../reactivity/effects.js';
import { current_effect, deep_read, untrack } from '../runtime.js';
import { array_prototype, get_prototype_of, object_prototype } from '../utils.js';

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
	validate_effect('$inspect');

	let initial = true;

	// we assign the function directly to signals, rather than just
	// calling `inspector` directly inside the effect, so that
	// we get useful stack traces
	var fn = () => {
		const value = untrack(() => deep_snapshot(get_value()));
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

/**
 * Like `snapshot`, but recursively traverses into normal arrays/objects to find potential states in them.
 * @param {any} value
 * @param {Map<any, any>} visited
 * @returns {any}
 */
function deep_snapshot(value, visited = new Map()) {
	if (typeof value === 'object' && value !== null && !visited.has(value)) {
		const unstated = snapshot(value);

		if (unstated !== value) {
			visited.set(value, unstated);
			return unstated;
		}

		const prototype = get_prototype_of(value);

		// Only deeply snapshot plain objects and arrays
		if (prototype === object_prototype || prototype === array_prototype) {
			let contains_unstated = false;
			/** @type {any} */
			const nested_unstated = Array.isArray(value) ? [] : {};

			for (let key in value) {
				const result = deep_snapshot(value[key], visited);
				nested_unstated[key] = result;
				if (result !== value[key]) {
					contains_unstated = true;
				}
			}

			visited.set(value, contains_unstated ? nested_unstated : value);
		} else {
			visited.set(value, value);
		}
	}

	return visited.get(value) ?? value;
}
