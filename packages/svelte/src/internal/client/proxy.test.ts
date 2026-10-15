import { proxy } from './proxy';
import { fork } from './reactivity/batch';
import { snapshot } from '../shared/clone.js';
import { disable_async_mode_flag, enable_async_mode_flag } from '../flags';
import { assert, test } from 'vitest';

test('preserves ordinary object semantics for inherited property names', () => {
	for (const prop of ['toString', 'valueOf', 'constructor', 'hasOwnProperty']) {
		const state = proxy<any>({});
		const inherited = state[prop];

		delete state[prop];
		assert.equal(state[prop], inherited);
		assert.equal(prop in state, true);

		state[prop] = 'own';
		state.other = 'own';

		assert.equal(state[prop], 'own');
		assert.equal(Object.hasOwn(state, prop), true);
		assert.deepEqual(Object.keys(state), [prop, 'other']);
		assert.deepEqual({ ...state }, { [prop]: 'own', other: 'own' });

		delete state[prop];

		assert.equal(state[prop], inherited);
		assert.equal(prop in state, true);
		assert.equal(Object.hasOwn(state, prop), false);
		assert.deepEqual(Object.keys(state), ['other']);
	}
});

test('preserves ordinary object semantics for inherited array properties', () => {
	const state = proxy<any>([]);
	const inherited = state.map;

	state.map = 'own';

	assert.equal(state.map, 'own');
	assert.equal(Object.hasOwn(state, 'map'), true);
	assert.deepEqual(Object.keys(state), ['map']);

	delete state.map;

	assert.equal(state.map, inherited);
	assert.equal('map' in state, true);
	assert.equal(Object.hasOwn(state, 'map'), false);
	assert.deepEqual(Object.keys(state), []);
});

test('restores added proxy properties when a fork is discarded', async () => {
	enable_async_mode_flag();

	try {
		const state = proxy<any>({});
		let forked_keys: string[] = [];

		const discarded = fork(() => {
			state.toString = 'own';
			state.other = 'own';
			forked_keys = Object.keys(state);
		});

		assert.deepEqual(forked_keys, ['toString', 'other']);
		discarded.discard();
		assert.equal(state.toString, Object.prototype.toString);
		assert.equal(Object.hasOwn(state, 'toString'), false);
		assert.deepEqual(Object.keys(state), []);

		const committed = fork(() => {
			state.toString = 'own';
		});

		await committed.commit();
		assert.equal(state.toString, 'own');
		assert.equal(Object.hasOwn(state, 'toString'), true);
		assert.deepEqual(Object.keys(state), ['toString']);
	} finally {
		disable_async_mode_flag();
	}
});

test('restores deleted proxy properties when a fork is discarded', async () => {
	enable_async_mode_flag();

	try {
		const state = proxy<{ value?: string }>({ value: 'original' });
		let forked_keys: string[] = [];

		const discarded = fork(() => {
			delete state.value;
			forked_keys = Object.keys(state);
		});

		assert.deepEqual(forked_keys, []);
		discarded.discard();
		assert.equal(state.value, 'original');
		assert.deepEqual(Object.keys(state), ['value']);

		let count = 0;
		const accessor = proxy<any>({
			get value() {
				return ++count;
			},
			set value(value) {
				count = value;
			}
		});
		const discarded_accessor = fork(() => {
			delete accessor.value;
		});

		discarded_accessor.discard();
		assert.equal(accessor.value, 1);
		assert.equal(accessor.value, 2);
		accessor.value = 10;
		assert.equal(accessor.value, 11);

		const committed = fork(() => {
			delete state.value;
		});

		await committed.commit();
		assert.equal(state.value, undefined);
		assert.deepEqual(Object.keys(state), []);
	} finally {
		disable_async_mode_flag();
	}
});

test('restores a deleted object as state when a fork is discarded', () => {
	enable_async_mode_flag();

	try {
		const original = { nested: { value: 1 } };
		const state = proxy<any>(original);

		fork(() => {
			delete state.nested;
		}).discard();

		state.nested.value = 2;

		assert.equal(state.nested.value, 2);
		assert.equal(Object.getOwnPropertyDescriptor(state, 'nested')?.value, state.nested);
		assert.equal(original.nested.value, 1);
	} finally {
		disable_async_mode_flag();
	}
});

test('keeps a property that a committed fork deletes and assigns again', async () => {
	enable_async_mode_flag();

	try {
		const state = proxy<any>({ value: 1 });

		await fork(() => {
			delete state.value;
			state.value = 1;
		}).commit();

		assert.equal(state.value, 1);
		assert.deepEqual(Object.keys(state), ['value']);
	} finally {
		disable_async_mode_flag();
	}
});

test('assigning an inherited accessor or read-only property adds no own property', () => {
	const object = proxy<any>({});
	object.__proto__ = { polluted: true };

	assert.deepEqual(Object.keys(object), []);
	assert.equal(snapshot(object).polluted, undefined);

	const array = proxy<any>([]);
	array[Symbol.unscopables] = 'own';

	assert.equal(Object.hasOwn(array, Symbol.unscopables), false);
});

test('assigning an inherited name to a non-extensible object adds no own property', () => {
	for (const target of [Object.freeze({}), Object.preventExtensions({})]) {
		const object = proxy<any>(target);
		object.toString = 'own';

		assert.equal(Object.hasOwn(object, 'toString'), false);
		assert.deepEqual(Object.keys(object), []);
	}
});

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
