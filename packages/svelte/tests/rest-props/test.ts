import { describe, assert, it } from 'vitest';
import { rest_props as server_rest_props } from '../../src/internal/server/index.js';
import { legacy_rest_props } from '../../src/internal/client/reactivity/props.js';

/**
 * #18601 — rest-prop exclude lists accept `Set` and use O(1) membership.
 * These helpers are compiler-owned; the compiler emits `new Set([...])`.
 */
describe('server rest_props exclude Set', () => {
	it('omits excluded keys', () => {
		const result = server_rest_props({ a: 1, b: 2, c: 3 }, new Set(['a', 'b']));
		assert.deepEqual(result, { c: 3 });
	});

	it('returns all keys when exclude is empty', () => {
		const result = server_rest_props({ a: 1, b: 2 }, new Set());
		assert.deepEqual(result, { a: 1, b: 2 });
	});

	it('returns empty object when all keys are excluded', () => {
		const result = server_rest_props({ a: 1 }, new Set(['a']));
		assert.deepEqual(result, {});
	});
});

describe('legacy_rest_props exclude Set', () => {
	it('omits excluded keys from get/has/ownKeys', () => {
		const rest = legacy_rest_props({ a: 1, b: 2, c: 3 }, new Set(['a']));

		assert.equal(rest.a, undefined);
		assert.equal(rest.b, 2);
		assert.equal(rest.c, 3);
		assert.equal('a' in rest, false);
		assert.equal('b' in rest, true);
		assert.deepEqual(Object.keys(rest).sort(), ['b', 'c']);
	});

	it('deleteProperty adds the key to the exclude Set', () => {
		const rest = legacy_rest_props({ a: 1, b: 2 }, new Set());

		assert.equal(rest.a, 1);
		delete rest.a;
		assert.equal(rest.a, undefined);
		assert.equal('a' in rest, false);
		assert.deepEqual(Object.keys(rest), ['b']);
	});
});
