/**
 * Pushes all `items` into `array` using `push`, therefore mutating the array.
 * We do this for memory and perf reasons, and because `array.push(...items)` would
 * run into a "max call stack size exceeded" error with too many items (~65k).
 * @template T
 * @param {T[]} array
 * @param {T[]} items
 */
export function push_array(array, items) {
	for (let i = 0; i < items.length; i++) {
		array.push(items[i]);
	}
}
