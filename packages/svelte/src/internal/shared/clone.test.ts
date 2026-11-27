import { snapshot } from './clone';
import { assert, expectTypeOf, test } from 'vitest';
import { proxy } from '../client/proxy';
import { SvelteMap } from '../../reactivity/map';
import { SvelteSet } from '../../reactivity/set';

function capture_warnings() {
	const warnings: string[] = [];

	// eslint-disable-next-line no-console
	const warn = console.warn;

	// eslint-disable-next-line no-console
	console.warn = (message) => warnings.push(message);

	return () => {
		// eslint-disable-next-line no-console
		console.warn = warn;
		return warnings;
	};
}

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

	const warnings = capture_warnings();
	const copy = snapshot(fn);

	assert.equal(fn, copy);
	assert.deepEqual(warnings(), [
		'%c[svelte] state_snapshot_uncloneable\n%cValue cannot be cloned with `$state.snapshot` — the original value was returned\nhttps://svelte.dev/e/state_snapshot_uncloneable'
	]);
});

test('uncloneable properties', () => {
	const object = {
		a: () => {},
		b: () => {},
		c: [() => {}, () => {}, () => {}, () => {}, () => {}, () => {}, () => {}, () => {}]
	};

	const warnings = capture_warnings();
	const copy = snapshot(object);

	assert.notEqual(object, copy);
	assert.equal(object.a, copy.a);
	assert.equal(object.b, copy.b);

	assert.notEqual(object.c, copy.c);
	assert.equal(object.c[0], copy.c[0]);

	assert.deepEqual(warnings(), [
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
- <value>.c[7]
https://svelte.dev/e/state_snapshot_uncloneable`
	]);
});

test('many uncloneable properties', () => {
	const array = Array.from({ length: 100 }, () => () => {});

	const warnings = capture_warnings();
	snapshot(array);

	assert.deepEqual(warnings(), [
		`%c[svelte] state_snapshot_uncloneable
%cThe following properties cannot be cloned with \`$state.snapshot\` — the return value contains the originals:

- <value>[0]
- <value>[1]
- <value>[2]
- <value>[3]
- <value>[4]
- <value>[5]
- <value>[6]
- ...and 93 more
https://svelte.dev/e/state_snapshot_uncloneable`
	]);
});

for (const MapClass of [Map, SvelteMap]) {
	test(`${MapClass.name} contents are deeply cloned`, () => {
		const key = proxy({ k: 1 });
		const value = proxy({ x: 1 });
		const map = new MapClass([[key, value]]);
		const data = proxy({ map, key, value, alias: map });
		const copy = snapshot(data);

		key.k = 99;
		value.x = 99;
		map.set({ k: 2 }, { x: 2 });

		assert.equal(Object.getPrototypeOf(copy.map), Map.prototype);
		assert.equal(copy.map.size, 1);
		assert.equal(copy.map, copy.alias);
		assert.equal(copy.map.get(copy.key), copy.value);
		assert.equal(copy.map.has(key), false);
		assert.equal(copy.key.k, 1);
		assert.equal(copy.value.x, 1);
		assert.deepEqual(structuredClone(copy), copy);
	});
}

for (const SetClass of [Set, SvelteSet]) {
	test(`${SetClass.name} contents are deeply cloned`, () => {
		const value = proxy({ x: 1 });
		const set = new SetClass([value]);
		const copy = snapshot(set);
		value.x = 99;
		set.add({ x: 2 });

		assert.equal(Object.getPrototypeOf(copy), Set.prototype);
		assert.equal(copy.size, 1);
		assert.equal([...copy][0].x, 1);
		assert.equal(copy.has(value), false);
		assert.deepEqual(structuredClone(copy), copy);
	});
}

test('collection cycles and shared references', () => {
	const map = new Map<any, any>();
	const set = new Set<any>();
	const object = { map, set, alias: set };
	map.set(map, set);
	map.set(object, object);
	set.add(set);
	set.add(map);

	const copy = snapshot(object);
	assert.notEqual(copy.map, map);
	assert.notEqual(copy.set, set);
	assert.equal(copy.set, copy.alias);
	assert.equal(copy.map.get(copy.map), copy.set);
	assert.equal(copy.map.get(copy), copy);
	assert.equal(copy.set.has(copy.set), true);
	assert.equal(copy.set.has(copy.map), true);
});

test('toJSON returning circular collections', () => {
	class MapJSON {
		toJSON(): Map<string, MapJSON> {
			return new Map([['self', this]]);
		}
	}

	class SetJSON {
		toJSON(): Set<SetJSON> {
			return new Set([this]);
		}
	}

	const map = snapshot(new MapJSON());
	const set = snapshot(new SetJSON());
	assert.equal<unknown>(map.get('self'), map);
	assert.equal<unknown>([...set][0], set);
});

test('collection entries respect no_tojson', () => {
	class Foo {
		x = 1;
		toJSON() {
			return { x: 2 };
		}
	}

	const value = new Foo();
	const data = { map: new Map([[value, value]]), set: new Set([value]) };
	const copy = snapshot(data);
	assert.deepEqual([...copy.map], [[{ x: 2 }, { x: 2 }]]);
	assert.deepEqual([...copy.set], [{ x: 2 }]);
	expectTypeOf(copy.map).toEqualTypeOf<Map<{ x: number }, { x: number }>>();
	expectTypeOf(copy.set).toEqualTypeOf<Set<{ x: number }>>();

	const inspected = snapshot(data, true, true);
	assert.deepEqual([...inspected.map], [[{ x: 1 }, { x: 1 }]]);
	assert.deepEqual([...inspected.set], [{ x: 1 }]);
});

test('uncloneable collection entries', () => {
	const fn = () => {};
	const object = { x: 1 };
	const data = { map: new Map([[fn, { object, fn }]]), set: new Set([fn]) };
	const warnings = capture_warnings();
	const copy = snapshot(data);
	assert.deepEqual(warnings(), [
		`%c[svelte] state_snapshot_uncloneable
%cThe following properties cannot be cloned with \`$state.snapshot\` — the return value contains the originals:

- <value>.map.entries()[0][0]
- <value>.map.entries()[0][1].fn
- <value>.set.values()[0]
https://svelte.dev/e/state_snapshot_uncloneable`
	]);
	assert.equal([...copy.map.keys()][0], fn);
	assert.equal(copy.map.get(fn)!.fn, fn);
	assert.notEqual(copy.map.get(fn)!.object, object);
	assert.equal([...copy.set][0], fn);

	const ignored_warnings = capture_warnings();
	snapshot(data, true);
	assert.deepEqual(ignored_warnings(), []);
});
