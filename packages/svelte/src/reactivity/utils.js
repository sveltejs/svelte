/**
 * @template T
 * @param {IterableIterator<T>} iterator
 */
export function make_iterable(iterator) {
	iterator[Symbol.iterator] = get_self;
	return iterator;
}

/**
 * @this {any}
 */
function get_self() {
	return this;
}
