import fs from 'fs';
import assert from 'assert';
import MagicString from 'magic-string';
import { parse } from 'acorn';
import { Store } from '../../store.js';

describe('store', () => {
	it('is written in ES5', () => {
		const source = fs.readFileSync('store.js', 'utf-8');

		const ast = parse(source, {
			sourceType: 'module'
		});

		const magicString = new MagicString(source);
		ast.body.forEach(node => {
			if (/^(Im|Ex)port/.test(node.type)) magicString.remove(node.start, node.end);
		});

		parse(magicString.toString(), {
			ecmaVersion: 5
		});
	});

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
});
