import fs from 'fs';
import assert from 'assert';
import MagicString from 'magic-string';
import { parse } from 'acorn';
import { Store } from '../../store.js';

describe('store', () => {
	describe('get', () => {
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

			assert.equal(store.get().foo, 'bar');
		});
	});

	describe('on', () => {
		it('listens to an event', () => {
			let newFoo;
			let oldFoo;

			const store = new Store({
				foo: 'bar'
			});

			store.on('state', ({ changed, current, previous }) => {
				newFoo = current.foo;
				oldFoo = previous.foo;
			});

			store.set({ foo: 'baz' });

			assert.equal(newFoo, 'baz');
			assert.equal(oldFoo, 'bar');
		});
	});

	describe('fire', () => {
		let answer;

		const store = new Store();

		store.on('custom', event => {
			answer = event.answer;
		});

		store.fire('custom', { answer: 42 });

		assert.equal(answer, 42);
	});

	it('allows user to cancel state change callback', () => {
		const store = new Store();
		const handler = store.on('state', () => {});

		assert.doesNotThrow(() => {
			handler.cancel();
		}, TypeError, 'this._handlers is undefined');
	});

	describe('computed', () => {
		it('computes a property based on data', () => {
			const store = new Store({
				foo: 1
			});

			store.compute('bar', ['foo'], foo => foo * 2);
			assert.equal(store.get().bar, 2);

			const values = [];

			store.on('state', ({ current }) => {
				values.push(current.bar);
			});

			store.set({ foo: 2 });
			assert.deepEqual(values, [4]);
		});

		it('computes a property based on another computed property', () => {
			const store = new Store({
				foo: 1
			});

			store.compute('bar', ['foo'], foo => foo * 2);
			store.compute('baz', ['bar'], bar => bar * 2);
			assert.equal(store.get().baz, 4);

			const values = [];

			store.on('state', ({ current }) => {
				values.push(current.baz);
			});

			store.set({ foo: 2 });
			assert.deepEqual(values, [8]);
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

		it('allows multiple dependents to depend on the same computed property', () => {
			const store = new Store({
				a: 1
			});

			store.compute('b', ['a'], a => a * 2);
			store.compute('c', ['b'], b => b * 3);
			store.compute('d', ['b'], b => b * 4);

			assert.deepEqual(store.get(), { a: 1, b: 2, c: 6, d: 8 });

			// bit cheeky, testing a private property, but whatever
			assert.equal(store._sortedComputedProperties.length, 3);
		});

		it('prevents cyclical dependencies', () => {
			const store = new Store();

			assert.throws(() => {
				store.compute('a', ['b'], b => b + 1);
				store.compute('b', ['a'], a => a + 1);
			}, /Cyclical dependency detected/);
		});
	});

	describe('immutable', () => {
		it('observing state only changes on immutable updates', () => {
			let newFoo;
			let oldFoo;
			let callCount = 0;
			let value1 = {};
			let value2 = {};

			const store = new Store({
				foo: value1
			}, { immutable: true });

			store.on('state', ({ current, previous }) => {
				callCount++;
				newFoo = current.foo;
				oldFoo = previous.foo;
			});

			store.set({ foo: value1 });

			assert.equal(callCount, 0);

			store.set({ foo: value2 });

			assert.equal(callCount, 1);
			assert.equal(newFoo, value2);
			assert.equal(oldFoo, value1);
		});
	});
});
