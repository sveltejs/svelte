import assert from 'assert';
import Store from '../../store.js';

describe('store', () => {
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
});
