import { snapshot } from './clone';
import { assert, test } from 'vitest';
import { proxy } from '../client/proxy';

test('primitive', () => {
	assert.equal(42, snapshot(42));
});

test('array', () => {
	const array = [1, 2, 3];
	const copy = snapshot(array);

	assert.deepEqual(copy, array);
	assert.notEqual(copy, array);
});

test('object', () => {
	const object = { a: 1, b: 2, c: 3 };
	const copy = snapshot(object);

	assert.deepEqual(copy, object);
	assert.notEqual(copy, object);
});

test('proxied state', () => {
	const object = proxy({
		a: {
			b: {
				c: 1
			}
		}
	});

	const copy = snapshot(object);

	assert.deepEqual(copy, object);
	assert.notEqual(copy, object);

	object.a.b.c = 2;
	assert.equal(copy.a.b.c, 1);
});

test('cycles', () => {
	const object: { self?: any } = {};
	object.self = object;
	const copy = snapshot(object);

	assert.equal(copy.self, copy);
});

test('class with state field', () => {
	class Foo {
		x = 1;
		#y = 2;

		get y() {
			return this.#y;
		}
	}

	const copy = snapshot(new Foo());

	// @ts-expect-error I can't figure out a way to exclude prototype properties
	assert.deepEqual(copy, { x: 1 });
});

test('class with toJSON', () => {
	class Foo {
		x = 1;
		#y = 2;

		get y() {
			return this.#y;
		}

		toJSON() {
			return {
				x: this.x,
				y: this.y
			};
		}
	}

	const copy = snapshot(new Foo());

	assert.deepEqual(copy, { x: 1, y: 2 });
});

test('reactive class', () => {
	class SvelteMap<T, U> extends Map<T, U> {
		constructor(init?: Iterable<[T, U]>) {
			super(init);
		}
	}

	const map = new SvelteMap([[1, 2]]);
	const copy = snapshot(map);

	assert.ok(copy instanceof Map);
	assert.notOk(copy instanceof SvelteMap);

	assert.equal(copy.get(1), 2);
});
