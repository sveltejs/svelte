import { describe, it, assert } from 'vitest';
import {
	readable,
	writable,
	derived,
	get,
	readonly,
	toStore,
	type Readable,
	fromStore
} from 'svelte/store';
import { source, set } from '../../src/internal/client/reactivity/sources';
import * as $ from '../../src/internal/client/runtime';
import { effect_root, render_effect } from 'svelte/internal/client';

describe('writable', () => {
	it('creates a writable store', () => {
		const count = writable(0);

		const values: number[] = [];

		const unsubscribe = count.subscribe((value) => {
			values.push(value);
		});

		count.set(1);
		count.update((n) => n + 1);

		unsubscribe();

		count.set(3);
		count.update((n) => n + 1);

		assert.deepEqual(values, [0, 1, 2]);
	});

	it('creates an undefined writable store', () => {
		const store = writable();

		const values: unknown[] = [];

		const unsubscribe = store.subscribe((value) => {
			values.push(value);
		});

		unsubscribe();

		assert.deepEqual(values, [undefined]);
	});

	it('calls provided subscribe handler', () => {
		let called = 0;

		const store = writable(0, () => {
			called += 1;
			return () => (called -= 1);
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

	it('does not assume immutable data', () => {
		const obj = {};
		let called = 0;

		const store = writable(obj);

		store.subscribe(() => {
			called += 1;
		});

		store.set(obj);
		assert.equal(called, 2);

		store.update((obj) => obj);
		assert.equal(called, 3);
	});

	it('only calls subscriber once initially, including on resubscriptions', () => {
		let num = 0;
		const store = writable(num, (set) => set((num += 1)));

		let count1 = 0;
		let count2 = 0;

		store.subscribe(() => (count1 += 1))();
		assert.equal(count1, 1);

		const unsubscribe = store.subscribe(() => (count2 += 1));
		assert.equal(count2, 1);

		unsubscribe();
	});

	it('no error even if unsubscribe calls twice', () => {
		let num = 0;
		const store = writable(num, (set) => set((num += 1)));
		const unsubscribe = store.subscribe(() => {});
		unsubscribe();
		assert.doesNotThrow(() => unsubscribe());
	});
});

describe('readable', () => {
	it('creates a readable store', () => {
		let running;
		let tick = (value: any) => {};

		const store = readable(undefined, (set) => {
			tick = set;
			running = true;

			// @ts-ignore
			set(0);

			return () => {
				tick = () => {};
				running = false;
			};
		});

		assert.ok(!running);

		const values: number[] = [];

		const unsubscribe = store.subscribe((value) => {
			// @ts-ignore
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

	it('passes an optional update function', () => {
		let running;

		let tick = (value: any) => {};
		let add = (value: any) => {};

		const store = readable(undefined, (set, update) => {
			tick = set;
			running = true;
			add = (n) => update((value) => value + n);

			// @ts-ignore
			set(0);

			return () => {
				tick = () => {};
				add = (_) => {};
				running = false;
			};
		});

		assert.ok(!running);

		const values: number[] = [];

		const unsubscribe = store.subscribe((value) => {
			// @ts-ignore
			values.push(value);
		});

		assert.ok(running);
		tick(1);
		tick(2);
		add(3);
		add(4);
		tick(5);
		add(6);

		unsubscribe();

		assert.ok(!running);
		tick(7);
		add(8);

		assert.deepEqual(values, [0, 1, 2, 5, 9, 5, 11]);
	});

	it('creates an undefined readable store', () => {
		const store = readable();

		const values: unknown[] = [];

		const unsubscribe = store.subscribe((value) => {
			values.push(value);
		});

		unsubscribe();

		assert.deepEqual(values, [undefined]);
	});

	it('creates a readable store without updater', () => {
		const store = readable(100);

		const values: number[] = [];

		const unsubscribe = store.subscribe((value) => {
			values.push(value);
		});

		unsubscribe();

		assert.deepEqual(values, [100]);
	});
});

/** @type {any} */
const fake_observable = {
	subscribe(fn: (value: any) => void) {
		fn(42);
		return {
			unsubscribe: () => {}
		};
	}
};

describe('derived', () => {
	it('maps a single store', () => {
		const a = writable(1);

		const b = derived(a, (n) => n * 2);

		const values: number[] = [];

		const unsubscribe = b.subscribe((value) => {
			values.push(value as number);
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

		const c = derived([a, b], ([a, b]) => a * b);

		const values: number[] = [];

		const unsubscribe = c.subscribe((value) => {
			values.push(value as number);
		});

		a.set(4);
		b.set(5);
		assert.deepEqual(values, [6, 12, 20]);

		unsubscribe();

		a.set(6);
		assert.deepEqual(values, [6, 12, 20]);
	});

	it('passes optional set function', () => {
		const number = writable(1);
		const evens = derived(
			number,
			(n, set) => {
				if (n % 2 === 0) set(n);
			},
			0
		);

		const values: number[] = [];

		const unsubscribe = evens.subscribe((value) => {
			values.push(value);
		});

		number.set(2);
		number.set(3);
		number.set(4);
		number.set(5);
		assert.deepEqual(values, [0, 2, 4]);

		unsubscribe();

		number.set(6);
		number.set(7);
		number.set(8);
		assert.deepEqual(values, [0, 2, 4]);
	});

	it('passes optional set and update functions', () => {
		const number = writable(1);
		const evensAndSquaresOf4 = derived(
			number,
			(n, set, update) => {
				if (n % 2 === 0) set(n);
				if (n % 4 === 0) update((n) => n * n);
			},
			0
		);

		const values: number[] = [];

		const unsubscribe = evensAndSquaresOf4.subscribe((value) => {
			values.push(value);
		});

		number.set(2);
		number.set(3);
		number.set(4);
		number.set(5);
		number.set(6);
		assert.deepEqual(values, [0, 2, 4, 16, 6]);

		number.set(7);
		number.set(8);
		number.set(9);
		number.set(10);
		assert.deepEqual(values, [0, 2, 4, 16, 6, 8, 64, 10]);

		unsubscribe();

		number.set(11);
		number.set(12);
		assert.deepEqual(values, [0, 2, 4, 16, 6, 8, 64, 10]);
	});

	it('prevents glitches', () => {
		const lastname = writable('Jekyll');

		const firstname = derived(lastname, (n) => (n === 'Jekyll' ? 'Henry' : 'Edward'));

		const fullname = derived([firstname, lastname], (names) => names.join(' '));

		const values: string[] = [];

		const unsubscribe = fullname.subscribe((value) => {
			values.push(value as string);
		});

		lastname.set('Hyde');

		assert.deepEqual(values, ['Henry Jekyll', 'Edward Hyde']);

		unsubscribe();
	});

	it('prevents diamond dependency problem', () => {
		const count = writable(0);

		const values: string[] = [];

		const a = derived(count, ($count) => {
			return 'a' + $count;
		});

		const b = derived(count, ($count) => {
			return 'b' + $count;
		});

		const combined = derived([a, b], ([a, b]) => {
			return a + b;
		});

		const unsubscribe = combined.subscribe((v) => {
			values.push(v as string);
		});

		assert.deepEqual(values, ['a0b0']);

		count.set(1);
		assert.deepEqual(values, ['a0b0', 'a1b1']);

		unsubscribe();
	});

	it('derived dependency does not update and shared ancestor updates', () => {
		const root = writable({ a: 0, b: 0 });

		const values: string[] = [];

		const a = derived(root, ($root) => {
			return 'a' + $root.a;
		});

		const b = derived([a, root], ([$a, $root]) => {
			return 'b' + $root.b + $a;
		});

		const unsubscribe = b.subscribe((v) => {
			values.push(v as string);
		});

		assert.deepEqual(values, ['b0a0']);

		root.set({ a: 0, b: 1 });
		assert.deepEqual(values, ['b0a0', 'b1a0']);

		unsubscribe();
	});

	it('is updated with safe_not_equal logic', () => {
		const arr = [0];

		const number = writable(1);

		const numbers = derived(number, ($number) => {
			arr[0] = $number;
			return arr;
		});

		const concatenated: number[] = [];

		const unsubscribe = numbers.subscribe((value) => {
			concatenated.push(...(value as number[]));
		});

		number.set(2);
		number.set(3);

		assert.deepEqual(concatenated, [1, 2, 3]);

		unsubscribe();
	});

	it('calls a cleanup function', () => {
		const num = writable(1);

		const values: number[] = [];
		const cleaned_up: number[] = [];

		const d = derived(num, ($num, set) => {
			set($num * 2);

			return function cleanup() {
				cleaned_up.push($num);
			};
		});

		num.set(2);

		const unsubscribe = d.subscribe((value) => {
			values.push(value as number);
		});

		num.set(3);
		num.set(4);

		assert.deepEqual(values, [4, 6, 8]);
		assert.deepEqual(cleaned_up, [2, 3]);

		unsubscribe();

		assert.deepEqual(cleaned_up, [2, 3, 4]);
	});

	it('discards non-function return values', () => {
		const num = writable(1);

		const values: number[] = [];

		// @ts-expect-error TODO feels like inference should work here
		const d = derived(num, ($num, set) => {
			set($num * 2);
			return {};
		});

		num.set(2);

		const unsubscribe = d.subscribe((value) => {
			values.push(value as number);
		});

		num.set(3);
		num.set(4);

		assert.deepEqual(values, [4, 6, 8]);

		unsubscribe();
	});

	it('allows derived with different types', () => {
		const a = writable('one');
		const b = writable(1);

		const c = derived([a, b], ([a, b]) => `${a} ${b}`);

		assert.deepEqual(get(c), 'one 1');

		a.set('two');
		b.set(2);
		assert.deepEqual(get(c), 'two 2');
	});

	it('works with RxJS-style observables', () => {
		// @ts-expect-error TODO feels like inference should work here
		const d = derived(fake_observable, (_) => _);
		assert.equal(get(d), 42);
	});

	it("doesn't restart when unsubscribed from another store with a shared ancestor", () => {
		const a = writable(true);
		let b_started = false;

		const b = derived(a, (_, __) => {
			b_started = true;
			return () => {
				assert.equal(b_started, true);
				b_started = false;
			};
		});

		const c = derived(a, ($a, set) => {
			if ($a) return b.subscribe(set);
		});

		c.subscribe(() => {});
		a.set(false);
		assert.equal(b_started, false);
	});

	it('errors on undefined stores #1', () => {
		assert.throws(() => {
			// @ts-expect-error TODO feels like inference should work here
			derived(null, (n) => n);
		});
	});

	it('errors on undefined stores #2', () => {
		assert.throws(() => {
			const a = writable(1);
			// @ts-expect-error TODO feels like inference should work here
			derived([a, null, undefined], ([n]) => {
				return n * 2;
			});
		});
	});
});

describe('get', () => {
	it('gets the current value of a store', () => {
		const store = readable(42, () => {});
		assert.equal(get(store), 42);
	});

	it('works with RxJS-style observables', () => {
		assert.equal(get(fake_observable as unknown as Readable<number>), 42);
	});
});

describe('readonly', () => {
	it('makes a store readonly', () => {
		const writableStore = writable(1);
		const readableStore = readonly(writableStore);

		assert.equal(get(readableStore), get(writableStore));

		writableStore.set(2);

		assert.equal(get(readableStore), 2);
		assert.equal(get(readableStore), get(writableStore));

		// @ts-ignore
		assert.throws(() => readableStore.set(3));
	});
});

describe('toStore', () => {
	it('creates a readable store from state', () => {
		const count = source(0);

		const store = toStore(() => $.get(count));

		const log: number[] = [];

		const unsubscribe = store.subscribe((value) => {
			log.push(value);
		});

		assert.deepEqual(log, [0]);

		set(count, 1);
		$.flush_sync();
		assert.deepEqual(log, [0, 1]);

		unsubscribe();
	});

	it('creates a writable store from state', () => {
		const count = source(0);

		const store = toStore(
			() => $.get(count),
			(v) => set(count, v)
		);

		const log: number[] = [];

		const unsubscribe = store.subscribe((value) => {
			log.push(value);
		});

		assert.deepEqual(log, [0]);

		set(count, 1);
		$.flush_sync();
		assert.deepEqual(log, [0, 1]);

		store.set(2);
		assert.equal($.get(count), 2);

		unsubscribe();
	});
});

describe('fromStore', () => {
	it('creates state from a writable store', () => {
		const store = writable(0);

		const count = fromStore(store);

		assert.equal(count.current, 0);

		const log: number[] = [];

		const teardown = effect_root(() => {
			render_effect(() => {
				log.push(count.current);
			});
		});

		assert.deepEqual(log, [0]);

		store.set(1);
		$.flush_sync();
		assert.deepEqual(log, [0, 1]);

		count.current = 2;
		$.flush_sync();
		assert.deepEqual(log, [0, 1, 2]);

		assert.equal(get(store), 2);

		teardown();
	});

	it('creates state from a writable store that updates after timeout', async () => {
		const wait = () => new Promise((resolve) => setTimeout(resolve, 100));
		const store = {
			subscribe: (cb: any) => {
				// new object each time to force updates of underlying signals,
				// to test the whole thing doesn't rerun more often than it should
				setTimeout(() => cb({}), 0);
				return () => {};
			}
		};

		const count = fromStore(store);
		const log: any[] = [];

		const teardown = effect_root(() => {
			render_effect(() => {
				log.push(count.current);
			});
		});

		await wait();

		assert.deepEqual(log, [undefined, {}]);

		teardown();
	});

	it('creates state from a readable store', () => {
		const store = readable(0);

		const count = fromStore(store);

		assert.equal(count.current, 0);

		assert.throws(
			// @ts-expect-error property is readonly
			() => (count.current += 1),
			'Cannot set property current of #<Object> which has only a getter'
		);
	});
});
