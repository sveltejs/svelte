/**
 * @template T
 * @template U
 * @param {Iterable<T>} iterable
 * @param {(value: T) => U} fn
 * @param {string} name
 * @returns {IterableIterator<U>}
 */
export function map(iterable, fn, name) {
	return {
		[Symbol.iterator]: get_this,
		next() {
			for (const value of iterable) {
				return { done: false, value: fn(value) };
			}

			return { done: true, value: undefined };
		},
		// @ts-expect-error
		get [Symbol.toStringTag]() {
			return name;
		}
	};
}

/** @this {any} */
function get_this() {
	return this;
}
