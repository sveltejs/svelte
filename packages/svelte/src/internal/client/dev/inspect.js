import { snapshot } from '../proxy.js';
import { inspect_effect, validate_effect } from '../reactivity/effects.js';
import { array_prototype, get_prototype_of, object_prototype } from '../utils.js';

/**
 * @param {() => any[]} get_value
 * @param {Function} [inspector]
 */
// eslint-disable-next-line no-console
export function inspect(get_value, inspector = console.log) {
	validate_effect('$inspect');

	let initial = true;

	inspect_effect(() => {
		inspector(initial ? 'init' : 'update', ...deep_snapshot(get_value()));
		initial = false;
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
