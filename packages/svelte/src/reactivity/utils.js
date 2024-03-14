/**
 * @template T
 * @template U
 * @param {Iterable<T>} iterable
 * @param {(value: T) => U} fn
 * @returns {IterableIterator<U>}
 */
export function map(iterable, fn) {
	return {
		[Symbol.iterator]: get_this,
		next() {
			for (const value of iterable) {
				return { done: false, value: fn(value) };
			}

			return { done: true, value: undefined };
		}
	};
}

/** @this {any} */
function get_this() {
	return this;
}
