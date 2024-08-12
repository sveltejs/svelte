/**
 * @template T
 * @param {any} actual
 * @param {T} expected
 * @returns {asserts actual is T}
 */
export function equal(actual, expected) {
	if (actual !== expected) throw new Error('Assertion failed');
}
