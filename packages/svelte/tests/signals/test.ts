import { describe, assert, it } from 'vitest';
import * as $ from '../../src/internal/client/runtime';
import {
	destroy_effect,
	effect,
	render_effect,
	user_effect
} from '../../src/internal/client/reactivity/effects';
import { source, set } from '../../src/internal/client/reactivity/sources';
import type { Derived } from '../../src/internal/client/types';
import { proxy } from '../../src/internal/client/proxy';
import { derived } from '../../src/internal/client/reactivity/deriveds';

/**
 * @param runes runes mode
 * @param fn A function that returns a function because we first need to setup all the signals
 * 			 and then execute the test in order to simulate a real component
 */
function run_test(runes: boolean, fn: (runes: boolean) => () => void) {
	return () => {
		// Create a component context to test runes vs legacy mode
		$.push({}, runes);
		// Create a render context so that effect validations etc don't fail
		let execute: any;
		const signal = render_effect(() => {
			execute = fn(runes);
		});
		$.pop();
		execute();
		destroy_effect(signal);
	};
}

function test(text: string, fn: (runes: boolean) => any) {
	it(`${text} (legacy mode)`, run_test(false, fn));
	it(`${text} (runes mode)`, run_test(true, fn));
}

describe('signals', () => {
	test('effect with state and derived in it', () => {
		const log: string[] = [];

		let count = source(0);
		let double = derived(() => $.get(count) * 2);
		effect(() => {
			log.push(`${$.get(count)}:${$.get(double)}`);
		});

		return () => {
			$.flushSync(() => set(count, 1));
			$.flushSync(() => set(count, 2));

			assert.deepEqual(log, ['0:0', '1:2', '2:4']);
		};
	});

	test('multiple effects with state and derived in it#1', () => {
		const log: string[] = [];

		let count = source(0);
		let double = derived(() => $.get(count) * 2);

		effect(() => {
			log.push(`A:${$.get(count)}:${$.get(double)}`);
		});
		effect(() => {
			log.push(`B:${$.get(double)}`);
		});

		return () => {
			$.flushSync(() => set(count, 1));
			$.flushSync(() => set(count, 2));

			assert.deepEqual(log, ['A:0:0', 'B:0', 'A:1:2', 'B:2', 'A:2:4', 'B:4']);
		};
	});

	test('multiple effects with state and derived in it#2', () => {
		const log: string[] = [];

		let count = source(0);
		let double = derived(() => $.get(count) * 2);

		effect(() => {
			log.push(`A:${$.get(double)}`);
		});
		effect(() => {
			log.push(`B:${$.get(count)}:${$.get(double)}`);
		});

		return () => {
			$.flushSync(() => set(count, 1));
			$.flushSync(() => set(count, 2));

			assert.deepEqual(log, ['A:0', 'B:0:0', 'A:2', 'B:1:2', 'A:4', 'B:2:4']);
		};
	});

	test('derived from state', () => {
		const log: number[] = [];

		let count = source(0);
		let double = derived(() => $.get(count) * 2);

		effect(() => {
			log.push($.get(double));
		});

		return () => {
			$.flushSync(() => set(count, 1));
			$.flushSync(() => set(count, 2));

			assert.deepEqual(log, [0, 2, 4]);
		};
	});

	test('derived from derived', () => {
		const log: number[] = [];

		let count = source(0);
		let double = derived(() => $.get(count) * 2);
		let quadruple = derived(() => $.get(double) * 2);

		effect(() => {
			log.push($.get(quadruple));
		});

		return () => {
			$.flushSync(() => set(count, 1));
			$.flushSync(() => set(count, 2));

			assert.deepEqual(log, [0, 4, 8]);
		};
	});

	test('https://perf.js.hyoo.ru/#!bench=9h2as6_u0mfnn', () => {
		let res: number[] = [];

		const numbers = Array.from({ length: 2 }, (_, i) => i);
		const fib = (n: number): number => (n < 2 ? 1 : fib(n - 1) + fib(n - 2));
		const hard = (n: number, l: string) => n + fib(16);

		const A = source(0);
		const B = source(0);
		const C = derived(() => ($.get(A) % 2) + ($.get(B) % 2));
		const D = derived(() => numbers.map((i) => i + ($.get(A) % 2) - ($.get(B) % 2)));
		const E = derived(() => hard($.get(C) + $.get(A) + $.get(D)[0]!, 'E'));
		const F = derived(() => hard($.get(D)[0]! && $.get(B), 'F'));
		const G = derived(() => $.get(C) + ($.get(C) || $.get(E) % 2) + $.get(D)[0]! + $.get(F));
		effect(() => {
			res.push(hard($.get(G), 'H'));
		});
		effect(() => {
			res.push($.get(G));
		});
		effect(() => {
			res.push(hard($.get(F), 'J'));
		});

		return () => {
			$.flushSync();

			let i = 2;
			while (--i) {
				res.length = 0;
				set(B, 1);
				set(A, 1 + i * 2);
				$.flushSync();

				set(A, 2 + i * 2);
				set(B, 2);
				$.flushSync();

				assert.equal(res.length, 4);
				assert.deepEqual(res, [3198, 1601, 3195, 1598]);
			}
		};
	});

	test('effects correctly handle unowned derived values that do not change', () => {
		const log: number[] = [];

		let count = source(0);
		const read = () => {
			const x = derived(() => ({ count: $.get(count) }));
			return $.get(x);
		};
		const derivedCount = derived(() => read().count);
		user_effect(() => {
			log.push($.get(derivedCount));
		});

		return () => {
			$.flushSync(() => set(count, 1));
			// Ensure we're not leaking consumers
			assert.deepEqual(count.reactions?.length, 1);
			$.flushSync(() => set(count, 2));
			// Ensure we're not leaking consumers
			assert.deepEqual(count.reactions?.length, 1);
			$.flushSync(() => set(count, 3));
			// Ensure we're not leaking consumers
			assert.deepEqual(count.reactions?.length, 1);
			assert.deepEqual(log, [0, 1, 2, 3]);
		};
	});

	test('correctly cleanup onowned nested derived values', () => {
		return () => {
			const nested: Derived<string>[] = [];

			const a = source(0);
			const b = source(0);
			const c = derived(() => {
				const a_2 = derived(() => $.get(a) + '!');
				const b_2 = derived(() => $.get(b) + '?');
				nested.push(a_2, b_2);

				return { a: $.get(a_2), b: $.get(b_2) };
			});

			$.get(c);

			$.flushSync(() => set(a, 1));

			$.get(c);

			$.flushSync(() => set(b, 1));

			$.get(c);

			// Ensure we're not leaking dependencies
			assert.deepEqual(
				nested.slice(0, -2).map((s) => s.deps),
				[null, null]
			);
		};
	});

	// outside of test function so that they are unowned signals
	let count = source(0);
	let calc = derived(() => {
		if ($.get(count) >= 2) {
			return 'limit';
		}
		return $.get(count) * 2;
	});

	test('effect with derived using unowned derived every time', () => {
		const log: Array<number | string> = [];

		const effect = user_effect(() => {
			log.push($.get(calc));
		});

		return () => {
			$.flushSync(() => set(count, 1));
			$.flushSync(() => set(count, 2));
			$.flushSync(() => set(count, 3));
			$.flushSync(() => set(count, 4));
			$.flushSync(() => set(count, 0));
			// Ensure we're not leaking consumers
			assert.deepEqual(count.reactions?.length, 1);
			assert.deepEqual(log, [0, 2, 'limit', 0]);
			destroy_effect(effect);
			// Ensure we're not leaking consumers
			assert.deepEqual(count.reactions, null);
		};
	});

	let no_deps = derived(() => {
		return [];
	});

	test('two effects with an unowned derived that has no depedencies', () => {
		const log: Array<Array<any>> = [];

		render_effect(() => {
			log.push($.get(no_deps));
		});

		render_effect(() => {
			log.push($.get(no_deps));
		});

		return () => {
			$.flushSync();
			assert.deepEqual(log, [[], []]);
		};
	});

	let some_state = source({});
	let some_deps = derived(() => {
		return [$.get(some_state)];
	});

	test('two effects with an unowned derived that has some depedencies', () => {
		const log: Array<Array<any>> = [];

		render_effect(() => {
			log.push($.get(some_deps));
		});

		render_effect(() => {
			log.push($.get(some_deps));
		});

		return () => {
			$.flushSync();
			assert.deepEqual(log, [[{}], [{}]]);
		};
	});

	test('schedules rerun when writing to signal before reading it', (runes) => {
		if (!runes) return () => {};

		const value = source({ count: 0 });
		user_effect(() => {
			set(value, { count: 0 });
			$.get(value);
		});

		return () => {
			let errored = false;
			try {
				$.flushSync();
			} catch (e: any) {
				assert.include(e.message, 'ERR_SVELTE_TOO_MANY_UPDATES');
				errored = true;
			}
			assert.equal(errored, true);
		};
	});

	test('schedules rerun when writing to signal before reading it', (runes) => {
		if (!runes) return () => {};

		const value = proxy({ arr: [] });
		user_effect(() => {
			value.arr = [];
			value.arr;
		});

		return () => {
			let errored = false;
			try {
				$.flushSync();
			} catch (e: any) {
				assert.include(e.message, 'ERR_SVELTE_TOO_MANY_UPDATES');
				errored = true;
			}
			assert.equal(errored, true);
		};
	});

	test('effect teardown is removed on re-run', () => {
		const count = source(0);
		let first = true;
		let teardown = 0;

		user_effect(() => {
			$.get(count);
			if (first) {
				first = false;
				return () => {
					teardown += 1;
				};
			}
		});

		return () => {
			$.flushSync(() => set(count, 1));
			$.flushSync(() => set(count, 2));
			assert.equal(teardown, 1);
		};
	});
});
