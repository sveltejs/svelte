import { proxy } from './proxy';
import { assert, test } from 'vitest';
import { disable_async_mode_flag, enable_async_mode_flag } from '../flags';
import { fork } from './reactivity/batch';

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

	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	state.x;
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	state.x;

	assert.equal(original.count, 0);
	assert.equal(count, 2);
	assert.equal(state.count, 2);
});

test('defines a property', () => {
	const original = { y: 0 };
	const state = proxy<any>(original);

	let value = 0;

	Object.defineProperty(state, 'x', {
		value: 1
	});
	Object.defineProperty(state, 'y', {
		value: 1
	});

	assert.equal(state.x, 1);
	assert.deepEqual(Object.getOwnPropertyDescriptor(state, 'x'), {
		configurable: true,
		writable: true,
		value: 1,
		enumerable: true
	});

	assert.ok(!('x' in original));
	assert.deepEqual(Object.getOwnPropertyDescriptor(original, 'y'), {
		configurable: true,
		writable: true,
		value: 0,
		enumerable: true
	});

	assert.throws(
		() =>
			Object.defineProperty(state, 'x', {
				get: () => value,
				set: (v) => (value = v)
			}),
		/state_descriptors_fixed/
	);
});

test('does not re-proxy proxies', () => {
	const inner = proxy({ count: 0 });
	const outer = proxy({ inner });

	assert.equal(inner.count, 0);
	assert.equal(outer.inner.count, 0);

	inner.count += 1;

	assert.equal(inner.count, 1);
	assert.equal(outer.inner.count, 1);
});

test('deletes a property', () => {
	const state = proxy({ a: 1, b: 2 } as { a?: number; b?: number; c?: number });

	delete state.a;
	assert.equal(JSON.stringify(state), '{"b":2}');
	delete state.a;

	// deleting a non-existent property should succeed
	delete state.c;
});

test('handles array.push', () => {
	const original = [1, 2, 3];
	const state = proxy(original);

	state.push(4);
	assert.deepEqual(original.length, 3);
	assert.deepEqual(original, [1, 2, 3]);
	assert.deepEqual(state.length, 4);
	assert.deepEqual(state, [1, 2, 3, 4]);
});

test('handles array mutation', () => {
	const original = [1, 2, 3];
	const state = proxy(original);

	state[3] = 4;
	assert.deepEqual(original.length, 3);
	assert.deepEqual(original, [1, 2, 3]);
	assert.deepEqual(state.length, 4);
	assert.deepEqual(state, [1, 2, 3, 4]);
});

test('handles array length mutation', () => {
	const original = [1, 2, 3];
	const state = proxy(original);

	state.length = 0;
	assert.deepEqual(original.length, 3);
	assert.deepEqual(original, [1, 2, 3]);
	assert.deepEqual(original[0], 1);
	assert.deepEqual(state.length, 0);
	assert.deepEqual(state, []);
	assert.deepEqual(state[0], undefined);
});

test('deleting or truncating does not call accessors', () => {
	const original = {
		count: 0,
		get value() {
			this.count += 1;
			return 1;
		}
	};
	const object = proxy<any>(original);
	delete object.value;
	assert.equal(original.count, 0);

	const items = [1];
	Object.defineProperty(items, 0, {
		get() {
			throw new Error('called');
		},
		configurable: true,
		enumerable: true
	});
	const array = proxy<any>(items);
	array.length = 0;
	assert.equal(array.length, 0);
});

test('discards fork-local proxy changes', () => {
	enable_async_mode_flag();

	try {
		const added = proxy<{ x?: number }>({});
		fork(() => {
			added.x = 1;
		}).discard();

		assert.equal('x' in added, false);
		assert.deepEqual(Object.keys(added), []);

		const updated = proxy({ x: 1 });
		fork(() => {
			updated.x = 2;
		}).discard();

		assert.equal(updated.x, 1);
		assert.deepEqual(Object.keys(updated), ['x']);

		const deleted = proxy<{ x?: number }>({ x: 1 });
		fork(() => {
			delete deleted.x;
		}).discard();

		assert.equal(deleted.x, 1);
		assert.deepEqual(Object.keys(deleted), ['x']);

		const populated = proxy([1, 2]);
		fork(() => {
			populated.length = 0;
		}).discard();

		assert.deepEqual(populated, [1, 2]);

		const truncated = proxy<number[]>([]);
		void truncated[0];
		void truncated[1];

		let fork_value;
		fork(() => {
			truncated.push(1, 2);
			truncated.length = 0;
			fork_value = [0 in truncated, Object.keys(truncated), truncated.length];
		}).discard();

		assert.deepEqual(fork_value, [false, [], 0]);
		assert.deepEqual(truncated, []);
	} finally {
		disable_async_mode_flag();
	}
});
