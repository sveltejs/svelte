/**
 * @template T
 * @param {Set<T>} a
 * @param {Set<T> | T[]} b
 */
export default function add_to_set(a, b) {
	// @ts-ignore
	b.forEach((item) => {
		a.add(item);
	});
}
