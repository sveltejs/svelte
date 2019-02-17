import * as assert from 'assert';
import { readable, writable, derive } from '../../store.js';

describe('store', () => {
	describe('writable', () => {
		it('creates a writable store', () => {
			const count = writable(0);
			const values = [];

			const unsubscribe = count.subscribe(value => {
				values.push(value);
			});

			count.set(1);
			count.update(n => n + 1);

			unsubscribe();

			count.set(3);
			count.update(n => n + 1);

			assert.deepEqual(values, [0, 1, 2]);
		});

		it('calls provided subscribe handler', () => {
			let called = 0;

			const store = writable(0, () => {
				called += 1;
				return () => called -= 1;
			});

			const unsubscribe1 = store.subscribe(() => {});
			assert.equal(called, 1);

			const unsubscribe2 = store.subscribe(() => {});
			assert.equal(called, 1);

			unsubscribe1();
			assert.equal(called, 1);

			unsubscribe2();
			assert.equal(called, 0);
		});
	});

	describe('readable', () => {
		it('creates a readable store', () => {
			let running;
			let tick;

			const store = readable(set => {
				tick = set;
				running = true;

				set(0);

				return () => {
					tick = () => {};
					running = false;
				};
			});

			assert.ok(!running);

			const values = [];

			const unsubscribe = store.subscribe(value => {
				values.push(value);
			});

			assert.ok(running);
			tick(1);
			tick(2);

			unsubscribe();

			assert.ok(!running);
			tick(3);
			tick(4);

			assert.deepEqual(values, [0, 1, 2]);
		});
	});

	describe('derive', () => {
		it('maps a single store', () => {
			const a = writable(1);
			const b = derive(a, n => n * 2);

			const values = [];

			const unsubscribe = b.subscribe(value => {
				values.push(value);
			});

			a.set(2);
			assert.deepEqual(values, [2, 4]);

			unsubscribe();

			a.set(3);
			assert.deepEqual(values, [2, 4]);
		});

		it('maps multiple stores', () => {
			const a = writable(2);
			const b = writable(3);
			const c = derive(([a, b]), ([a, b]) => a * b);

			const values = [];

			const unsubscribe = c.subscribe(value => {
				values.push(value);
			});

			a.set(4);
			b.set(5);
			assert.deepEqual(values, [6, 12, 20]);

			unsubscribe();

			a.set(6);
			assert.deepEqual(values, [6, 12, 20]);
		});

		it('passes optional set function', () => {
			const number = writable(0);
			const evens = derive(number, (n, set) => {
				if (n % 2 === 0) set(n);
			});

			const values = [];

			const unsubscribe = evens.subscribe(value => {
				values.push(value);
			});

			number.set(1);
			number.set(2);
			number.set(3);
			number.set(4);
			assert.deepEqual(values, [0, 2, 4]);

			unsubscribe();

			number.set(5);
			number.set(6);
			number.set(7);
			assert.deepEqual(values, [0, 2, 4]);
		});

		it('prevents glitches', () => {
			const lastname = writable('Jekyll');
			const firstname = derive(lastname, n => n === 'Jekyll' ? 'Henry' : 'Edward');

			const fullname = derive([firstname, lastname], names => names.join(' '));

			const values = [];

			const unsubscribe = fullname.subscribe(value => {
				values.push(value);
			});

			lastname.set('Hyde');

			assert.deepEqual(values, [
				'Henry Jekyll',
				'Edward Hyde'
			]);

			unsubscribe();
		});
	});
});
