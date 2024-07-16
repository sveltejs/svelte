import { snapshot } from './clone';
import { assert, test } from 'vitest';
import { proxy } from '../client/proxy';

const warn = console.warn;

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

test('uncloneable value', () => {
	const fn = () => {};

	const warnings: string[] = [];
	console.warn = (message) => warnings.push(message);

	const copy = snapshot(fn);
	console.warn = warn;

	assert.equal(fn, copy);
	assert.deepEqual(warnings, [
		'%c[svelte] state_snapshot_uncloneable\n%cValue cannot be cloned with `$state.snapshot` — the original value was returned'
	]);
});

test('uncloneable properties', () => {
	const object = {
		a: () => {},
		b: () => {},
		c: [() => {}, () => {}, () => {}, () => {}, () => {}, () => {}, () => {}, () => {}]
	};

	const warnings: string[] = [];
	console.warn = (message) => warnings.push(message);

	const copy = snapshot(object);
	console.warn = warn;

	assert.notEqual(object, copy);
	assert.equal(object.a, copy.a);
	assert.equal(object.b, copy.b);

	assert.notEqual(object.c, copy.c);
	assert.equal(object.c[0], copy.c[0]);

	assert.deepEqual(warnings, [
		`%c[svelte] state_snapshot_uncloneable
%cThe following properties cannot be cloned with \`$state.snapshot\` — the return value contains the originals:

- <value>.a
- <value>.b
- <value>.c[0]
- <value>.c[1]
- <value>.c[2]
- <value>.c[3]
- <value>.c[4]
- <value>.c[5]
- <value>.c[6]
- <value>.c[7]`
	]);
});

test('many uncloneable properties', () => {
	const array = Array.from({ length: 100 }, () => () => {});

	const warnings: string[] = [];
	console.warn = (message) => warnings.push(message);

	snapshot(array);
	console.warn = warn;

	assert.deepEqual(warnings, [
		`%c[svelte] state_snapshot_uncloneable
%cThe following properties cannot be cloned with \`$state.snapshot\` — the return value contains the originals:

- <value>[0]
- <value>[1]
- <value>[2]
- <value>[3]
- <value>[4]
- <value>[5]
- <value>[6]
- ...and 93 more`
	]);
});
