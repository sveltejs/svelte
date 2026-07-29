import { assert, describe, test } from 'vitest';
import { spread_props } from './props.js';

/**
 * Behavior lock for spread_props ownKeys (perf #18600).
 * Constrains rewrites: first-seen order, for...in (incl. inherited enumerable strings),
 * getOwnPropertySymbols (incl. non-enumerable), lazy fn props, falsy skip.
 */
describe('spread_props ownKeys', () => {
	test('dedups string keys with first-seen order across objects', () => {
		const props = spread_props({ z: 1, a: 2 }, { a: 3, b: 4 });

		assert.deepEqual(Reflect.ownKeys(props), ['z', 'a', 'b']);
		assert.deepEqual(Object.keys(props), ['z', 'a', 'b']);
	});

	test('integer-like key order is per-object, not global', () => {
		// Object key order: integer indices ascending, then other strings in insertion order.
		// Across spreads, later objects append only unseen keys — no global re-sort.
		const props = spread_props({ b: 1, 2: 0, 1: 0 }, { a: 1 });

		assert.deepEqual(Reflect.ownKeys(props), ['1', '2', 'b', 'a']);
	});

	test('includes inherited enumerable string keys from for...in', () => {
		const child = Object.create(
			{ inherited: 1 },
			{ own: { value: 1, enumerable: true, configurable: true, writable: true } }
		);
		const props = spread_props(child);

		// ownKeys uses for...in → inherited enumerable strings appear
		assert.deepEqual(Reflect.ownKeys(props), ['own', 'inherited']);
		// Object.keys also consults getOwnPropertyDescriptor; inherited has no own descriptor
		assert.deepEqual(Object.keys(props), ['own']);
	});

	test('dedups symbols at first-seen index; non-enumerable own symbols included', () => {
		const s1 = Symbol('s1');
		const s2 = Symbol('s2');
		const s_ne = Symbol('non-enumerable');

		const first: Record<string | symbol, unknown> = { z: 1, a: 2, [s1]: 1 };
		Object.defineProperty(first, s_ne, { value: 1, enumerable: false });

		const second: Record<string | symbol, unknown> = { a: 3, b: 4, [s1]: 9, [s2]: 2 };

		const props = spread_props(first, second);

		// Per object: for...in strings, then getOwnPropertySymbols (all own symbols)
		assert.deepEqual(Reflect.ownKeys(props), ['z', 'a', s1, s_ne, 'b', s2]);
		assert.deepEqual(Object.keys(props), ['z', 'a', 'b']);
	});

	test('evaluates lazy function props and skips nullish returns', () => {
		assert.deepEqual(
			Reflect.ownKeys(spread_props(() => ({ x: 1 }), { y: 2 })),
			['x', 'y']
		);
		assert.deepEqual(Reflect.ownKeys(spread_props(() => null, { a: 1 })), ['a']);
	});

	test('skips falsy non-object props (same as if (!p) continue)', () => {
		// Note: has trap uses `p != null`; ownKeys uses truthiness. Harmonizing is out of scope.
		// @ts-expect-error intentional falsy / nullish spreads to lock current skip semantics
		assert.deepEqual(Reflect.ownKeys(spread_props(0, '', null, undefined, { a: 1 })), ['a']);
	});
});
