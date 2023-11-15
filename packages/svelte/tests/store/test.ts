import { describe, it, assert } from 'vitest';
import { readable, writable, derived, get, readonly, type Readable } from 'svelte/store';

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

	it('creates an `undefined` writable store', () => {
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
			return () => {
				called -= 1;
			};
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

		store.subscribe(() => {
			count1 += 1;
		})();
		assert.equal(count1, 1);

		const unsubscribe = store.subscribe(() => {
			count2 += 1;
		});
		assert.equal(count2, 1);

		unsubscribe();
	});

	it('does not throw an error if `unsubscribe` is called more than once', () => {
		let num = 0;
		const store = writable(num, (set) => set((num += 1)));
		const unsubscribe = store.subscribe(() => {});
		unsubscribe();
		assert.doesNotThrow(() => unsubscribe());
	});

	it('allows multiple subscriptions of one handler', () => {
		let call_count = 0;

		const value = writable(1);

		const handle_new_value = () => {
			call_count += 1;
		};
		const unsubscribers = [1, 2, 3].map((_) => value.subscribe(handle_new_value));

		assert.equal(call_count, 3);
		value.set(2);
		assert.equal(call_count, 6);

		for (const unsubscribe of unsubscribers) unsubscribe();
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

	it('passes an optional `update` function', () => {
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

	it('creates an `undefined` readable store', () => {
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

	it('allows derived with different types', () => {
		const a = writable('one');
		const b = writable(1);
		const c = derived([a, b], ([a, b]) => `${a} ${b}`);

		assert.deepEqual(get(c), 'one 1');

		a.set('two');
		b.set(2);
		assert.deepEqual(get(c), 'two 2');
	});

	it('errors on undefined stores #1', () => {
		assert.throws(() => {
			// @ts-expect-error `null` and `undefined` should create type errors, but this code is testing
			// that the implementation also throws an error.
			derived(null, (n) => n);
		});
	});

	it('errors on undefined stores #2', () => {
		assert.throws(() => {
			const a = writable(1);
			// @ts-expect-error `null` and `undefined` should create type errors, but this code is testing
			// that the implementation also throws an error.
			derived([a, null, undefined], ([n]) => {
				return n * 2;
			});
		});
	});

	it('works with RxJS-style observables', () => {
		const d = derived(fake_observable, (_) => _);
		assert.equal(get(d), 42);
	});

	it('passes optional `set` function', () => {
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

	it('passes optional `set` and `update` functions', () => {
		const number = writable(1);
		const evens_and_squares_of_4 = derived(
			number,
			(n, set, update) => {
				if (n % 2 === 0) set(n);
				if (n % 4 === 0) update((n) => n * n);
			},
			0
		);

		const values: number[] = [];

		const unsubscribe = evens_and_squares_of_4.subscribe((value) => {
			values.push(value);
		});

		number.set(2);
		number.set(3);
		number.set(4);
		number.set(5);
		number.set(6);
		assert.deepEqual(values, [0, 2, 16, 6]);

		number.set(7);
		number.set(8);
		number.set(9);
		number.set(10);
		assert.deepEqual(values, [0, 2, 16, 6, 64, 10]);

		unsubscribe();

		number.set(11);
		number.set(12);
		assert.deepEqual(values, [0, 2, 16, 6, 64, 10]);
	});

	it('prevents glitches', () => {
		const last_name = writable('Jekyll');
		const first_name = derived(last_name, (n) => (n === 'Jekyll' ? 'Henry' : 'Edward'));
		const full_name = derived([first_name, last_name], (names) => names.join(' '));

		const values: string[] = [];

		const unsubscribe = full_name.subscribe((value) => {
			values.push(value as string);
		});

		last_name.set('Hyde');

		assert.deepEqual(values, ['Henry Jekyll', 'Edward Hyde']);

		unsubscribe();
	});

	it('only calls `derive_value` when necessary', () => {
		let call_count = 0;

		const sequence = writable(['a', 'b']);
		const length = derived(sequence, ($sequence) => {
			call_count += 1;
			return $sequence.length;
		});

		assert.equal(call_count, 0);

		const unsubscribes = [
			length.subscribe(() => {}),
			length.subscribe(() => {}),
			length.subscribe(() => {})
		];
		assert.equal(call_count, 1);

		for (const unsubscribe of unsubscribes) unsubscribe();
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

	it('avoids premature updates of dependent stores on invalid state', () => {
		const values: number[] = [];

		const sequence = writable(['a', 'b']);
		const length = derived(sequence, ($sequence) => $sequence.length);
		const lengths_sum = derived(
			[sequence, length],
			([$sequence, $length]) => $sequence.length + $length
		);

		const unsubscribe = lengths_sum.subscribe((value) => values.push(value));

		assert.deepEqual(values, [4]);
		sequence.set(['a', 'b', 'c']);
		assert.deepEqual(values, [4, 6]);

		unsubscribe();
	});

	it('avoids premature updates of dependent stores on invalid state', () => {
		const values: number[] = [];

		const sequence = writable(['a', 'b']);
		const length = derived(sequence, ($sequence) => $sequence.length);
		const length_dec = derived(length, ($length) => $length - 1);
		const lengths_sum = derived(
			[sequence, length_dec],
			([$sequence, $length_dec]) => $sequence.length + $length_dec
		);

		const unsubscribe = lengths_sum.subscribe((value) => values.push(value));

		assert.deepEqual(values, [3]);
		sequence.set(['a', 'b', 'c']);
		assert.deepEqual(values, [3, 5]);

		unsubscribe();
	});

	it('avoids premature updates of dependent stores on invalid state', () => {
		const values: string[] = [];

		const length = writable(2);
		const length_dec = derived(length, ($length) => $length - 1);
		const length_dec_inc = derived(length_dec, ($length_dec) => $length_dec + 1);
		const sequence = derived(length_dec_inc, ($length_dec_inc) =>
			[...Array($length_dec_inc)].map((_, i) => i)
		);
		const last_as_string = derived([length_dec_inc, sequence], ([$length_dec_inc, $sequence]) =>
			$sequence[$length_dec_inc - 1].toString()
		);

		const unsubscribe = last_as_string.subscribe((value) => values.push(value));

		assert.deepEqual(values, ['1']);
		length.set(3);
		assert.deepEqual(values, ['1', '2']);

		unsubscribe();
	});

	it('does not freeze when depending on an asynchronous store', () => {
		const values: number[] = [];

		const noop = () => {};
		// `do_later` allows deferring store updates in `length_delayed` without having to handle
		// strictly asynchronous execution.
		let do_later = noop;

		const length = writable(1);
		const length_delayed = derived(
			length,
			($length, set) => {
				do_later = () => {
					set($length);
				};
				return () => {
					do_later = noop;
				};
			},
			0
		);
		const lengths_derivative = derived(
			[length, length_delayed],
			([$length, $length_delayed]) => $length * 3 - $length_delayed
		);

		const unsubscribe = lengths_derivative.subscribe((value) => values.push(value));

		if (typeof do_later === 'function') do_later();
		length.set(2);
		length.set(3);
		length.set(4);
		if (typeof do_later === 'function') do_later();
		if (typeof do_later === 'function') do_later();
		assert.deepEqual(values, [3, 2, 5, 8, 11, 8]);

		unsubscribe();
	});

	it('disables `set` and `update` functions during `on_start` clean-up (`on_stop`)', () => {
		const noop = () => {};
		// `do_later()` allows deferring store updates in `length_delayed` without having to handle
		// strictly asynchronous execution.
		let do_later = noop;

		const length = readable(0, (set) => {
			if (do_later === noop) do_later = () => set(1);
			// No clean-up function is returned, so `do_later()` remains set even after it should.
		});

		assert.equal(get(length, true), 0);

		const unsubscribe = length.subscribe(noop);
		unsubscribe();

		assert.equal(get(length, true), 0);
		if (typeof do_later === 'function') do_later();
		assert.equal(get(length, true), 0);

		// The original `set()` is still disabled even after re-subscribing, since `set` and `update`
		// are created anew each time.
		const unsubscribe_2 = length.subscribe(noop);
		if (typeof do_later === 'function') do_later();
		assert.equal(get(length, true), 0);

		unsubscribe_2();
	});

	it('disables `set` and `update` functions during `derived` clean-up', () => {
		const noop = () => {};
		// `do_later()` allows deferring store updates in `length_delayed` without having to handle
		// strictly asynchronous execution.
		let do_later = noop;

		const length = writable(1);
		const length_delayed = derived(
			length,
			($length, _, update) => {
				if (do_later === noop) do_later = () => update((_) => $length);
				// No clean-up function is returned, so `do_later()` remains set even after it should.
			},
			0
		);

		assert.equal(get(length_delayed, true), 0);

		const unsubscribe = length_delayed.subscribe(noop);
		unsubscribe();

		assert.equal(get(length_delayed, true), 0);
		if (typeof do_later === 'function') do_later();
		assert.equal(get(length_delayed, true), 0);

		// The original `update()` is still disabled even after re-subscribing, since `set` and `update`
		// are created anew each time.
		const unsubscribe_2 = length.subscribe(noop);
		if (typeof do_later === 'function') do_later();
		assert.equal(get(length_delayed, true), 0);

		unsubscribe_2();
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

	it('is updated with `safe_not_equal` logic', () => {
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

	it('calls an `on_stop` function', () => {
		const num = writable(1);

		const values: number[] = [];
		const cleaned_up: number[] = [];

		const d = derived(num, ($num, set) => {
			set($num * 2);

			return function on_stop() {
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

		// @ts-expect-error Returning a non-function value from `derive_value` forces TypeScript to
		// assume the function is a `SimpleDeriveValue<S, T>` as opposed to a `ComplexDeriveValue<S,
		// T>`. Since the value will be discarded by the implementation, showing a type error is
		// justified.
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

	it('does not restart when unsubscribed from another store with a shared ancestor', () => {
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
		const writable_store = writable(1);
		const readable_store = readonly(writable_store);

		assert.equal(get(readable_store), get(writable_store));

		writable_store.set(2);

		assert.equal(get(readable_store), 2);
		assert.equal(get(readable_store), get(writable_store));

		// @ts-expect-error This should create a type errors, but this code is testing that the
		// implementation also throws an error.
		assert.throws(() => readable_store.set(3));
	});
});
