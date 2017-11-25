import assert from 'assert';
import { Store, combineStores } from '../../store.js';

describe.only('store', () => {
	describe('get', () => {
		it('gets a specific key', () => {
			const store = new Store({
				foo: 'bar'
			});

			assert.equal(store.get('foo'), 'bar');
		});

		it('gets the entire state object', () => {
			const store = new Store({
				foo: 'bar'
			});

			assert.deepEqual(store.get(), { foo: 'bar' });
		});
	});

	describe('set', () => {
		it('sets state', () => {
			const store = new Store();

			store.set({
				foo: 'bar'
			});

			assert.equal(store.get('foo'), 'bar');
		});
	});

	describe('observe', () => {
		it('observes state', () => {
			let newFoo;
			let oldFoo;

			const store = new Store({
				foo: 'bar'
			});

			store.observe('foo', (n, o) => {
				newFoo = n;
				oldFoo = o;
			});

			assert.equal(newFoo, 'bar');
			assert.equal(oldFoo, undefined);

			store.set({
				foo: 'baz'
			});

			assert.equal(newFoo, 'baz');
			assert.equal(oldFoo, 'bar');
		});
	});

	describe('onchange', () => {
		it('fires a callback when state changes', () => {
			const store = new Store();

			let count = 0;
			let args;

			store.onchange((state, changed) => {
				count += 1;
				args = { state, changed };
			});

			store.set({ foo: 'bar' });

			assert.equal(count, 1);
			assert.deepEqual(args, {
				state: { foo: 'bar' },
				changed: { foo: true }
			});

			// this should be a noop
			store.set({ foo: 'bar' });
			assert.equal(count, 1);

			// this shouldn't
			store.set({ foo: 'baz' });

			assert.equal(count, 2);
			assert.deepEqual(args, {
				state: { foo: 'baz' },
				changed: { foo: true }
			});
		});
	});

	describe('computed', () => {
		it('computes a property based on data', () => {
			const store = new Store({
				foo: 1
			});

			store.compute('bar', ['foo'], foo => foo * 2);
			assert.equal(store.get('bar'), 2);

			const values = [];

			store.observe('bar', bar => {
				values.push(bar);
			});

			store.set({ foo: 2 });
			assert.deepEqual(values, [2, 4]);
		});

		it('computes a property based on another computed property', () => {
			const store = new Store({
				foo: 1
			});

			store.compute('bar', ['foo'], foo => foo * 2);
			store.compute('baz', ['bar'], bar => bar * 2);
			assert.equal(store.get('baz'), 4);

			const values = [];

			store.observe('baz', baz => {
				values.push(baz);
			});

			store.set({ foo: 2 });
			assert.deepEqual(values, [4, 8]);
		});

		it('prevents computed properties from being set', () => {
			const store = new Store({
				foo: 1
			});

			store.compute('bar', ['foo'], foo => foo * 2);

			assert.throws(() => {
				store.set({ bar: 'whatever' });
			}, /'bar' is a read-only property/);
		});
	});

	describe('combineStores', () => {
		it('merges stores', () => {
			const a = new Store({
				x: 1,
				y: 2
			});

			a.compute('z', ['x', 'y'], (x, y) => x + y);

			const b = new Store({
				x: 3,
				y: 4
			});

			b.compute('z', ['x', 'y'], (x, y) => x + y);

			const c = combineStores({ a, b });

			c.compute('total', ['a', 'b'], (a, b) => a.z + b.z);

			assert.deepEqual(c.get(), {
				a: {
					x: 1,
					y: 2,
					z: 3
				},
				b: {
					x: 3,
					y: 4,
					z: 7
				},
				total: 10
			});

			const values = [];

			c.observe('total', total => {
				values.push(total);
			});

			a.set({ x: 2, y: 3 });
			b.set({ x: 5, y: 6 });

			assert.deepEqual(values, [10, 12, 16]);
		});
	});
});
