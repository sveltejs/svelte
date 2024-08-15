import { proxy } from './proxy';
import { assert, test } from 'vitest';

test('does not mutate the original object', () => {
	const original = { x: 1 };
	const state = proxy(original);

	state.x = 2;

	assert.equal(original.x, 1);
	assert.equal(state.x, 2);
});

test('preserves getters', () => {
	let count = 0;
	const original = {
		count: 0,
		get x() {
			this.count += 1;
			count += 1;
			return 42;
		}
	};

	const state = proxy(original);

	state.x;
	state.x;

	assert.equal(original.count, 0);
	assert.equal(count, 2);
	assert.equal(state.count, 2);
});

test('defines a property', () => {
	const original = {};
	const state = proxy(original);

	let value = 0;

	Object.defineProperty(state, 'x', {
		get: () => value,
		set: (v) => (value = v)
	});

	// @ts-ignore
	state.x = 1;

	// @ts-ignore
	assert.equal(state.x, 1);
	assert.equal(value, 1);

	assert.ok(!('x' in original));
});
