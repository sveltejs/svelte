/**
 * Pushes all `items` into `array` using `push`, therefore mutating the array.
 * We do this for memory and perf reasons, and because `array.push(...items)` would
 * run into a "max call stack size exceeded" error with too many items (~65k).
 * @param {T[]} array  undefined
 * @param {T[]} items  undefined
 * @template T
 * @returns {void}
 */
export function push_array(array, items) {
	for (let i = 0; i < items.length; i++) {
		array.push(items[i]);
	}
}
