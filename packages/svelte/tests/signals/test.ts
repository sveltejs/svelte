import { describe, assert, it } from 'vitest';
import * as $ from '../../src/internal/client/runtime';

function run_test(runes: boolean, fn: () => void) {
	return () => {
		// Create a component context to test runes vs legacy mode
		$.push({}, runes);
		// Create a render context so that effect validations etc don't fail
		const signal = $.render_effect(fn, null, true, true);
		$.destroy_signal(signal);
		$.pop();
	};
}

function test(text: string, fn: () => any) {
	it(`${text} (legacy mode)`, run_test(false, fn));
	it(`${text} (runes mode)`, run_test(true, fn));
}

describe('signals', () => {
	test('effect with state and derived in it', () => {
		const log: string[] = [];

		let count = $.source(0);
		let double = $.derived(() => $.get(count) * 2);

		$.effect(() => {
			log.push(`${$.get(count)}:${$.get(double)}`);
		});
		$.flushSync(() => $.set(count, 1));
		$.flushSync(() => $.set(count, 2));

		assert.deepEqual(log, ['0:0', '1:2', '2:4']);
	});

	test('multiple effects with state and derived in it#1', () => {
		const log: string[] = [];

		let count = $.source(0);
		let double = $.derived(() => $.get(count) * 2);

		$.effect(() => {
			log.push(`A:${$.get(count)}:${$.get(double)}`);
		});
		$.effect(() => {
			log.push(`B:${$.get(double)}`);
		});

		$.flushSync(() => $.set(count, 1));
		$.flushSync(() => $.set(count, 2));

		assert.deepEqual(log, ['A:0:0', 'B:0', 'A:1:2', 'B:2', 'A:2:4', 'B:4']);
	});

	test('multiple effects with state and derived in it#2', () => {
		const log: string[] = [];

		let count = $.source(0);
		let double = $.derived(() => $.get(count) * 2);

		$.effect(() => {
			log.push(`A:${$.get(double)}`);
		});
		$.effect(() => {
			log.push(`B:${$.get(count)}:${$.get(double)}`);
		});

		$.flushSync(() => $.set(count, 1));
		$.flushSync(() => $.set(count, 2));

		assert.deepEqual(log, ['A:0', 'B:0:0', 'A:2', 'B:1:2', 'A:4', 'B:2:4']);
	});

	test('derived from state', () => {
		const log: number[] = [];

		let count = $.source(0);
		let double = $.derived(() => $.get(count) * 2);

		$.effect(() => {
			log.push($.get(double));
		});
		$.flushSync(() => $.set(count, 1));
		$.flushSync(() => $.set(count, 2));

		assert.deepEqual(log, [0, 2, 4]);
	});

	test('derived from derived', () => {
		const log: number[] = [];

		let count = $.source(0);
		let double = $.derived(() => $.get(count) * 2);
		let quadruple = $.derived(() => $.get(double) * 2);

		$.effect(() => {
			log.push($.get(quadruple));
		});
		$.flushSync(() => $.set(count, 1));
		$.flushSync(() => $.set(count, 2));

		assert.deepEqual(log, [0, 4, 8]);
	});

	test('https://perf.js.hyoo.ru/#!bench=9h2as6_u0mfnn', () => {
		let res: number[] = [];

		const numbers = Array.from({ length: 2 }, (_, i) => i);
		const fib = (n: number): number => (n < 2 ? 1 : fib(n - 1) + fib(n - 2));
		const hard = (n: number, l: string) => n + fib(16);

		const A = $.source(0);
		const B = $.source(0);
		const C = $.derived(() => ($.get(A) % 2) + ($.get(B) % 2));
		const D = $.derived(
			() => numbers.map((i) => i + ($.get(A) % 2) - ($.get(B) % 2)),
			(l: number[], r: number[]) => l.length === r.length && l.every((v, i) => v === r[i])
		);
		const E = $.derived(() => hard($.get(C) + $.get(A) + $.get(D)[0]!, 'E'));
		const F = $.derived(() => hard($.get(D)[0]! && $.get(B), 'F'));
		const G = $.derived(() => $.get(C) + ($.get(C) || $.get(E) % 2) + $.get(D)[0]! + $.get(F));
		let H = $.effect(() => {
			res.push(hard($.get(G), 'H'));
		});
		let I = $.effect(() => {
			res.push($.get(G));
		});
		let J = $.effect(() => {
			res.push(hard($.get(F), 'J'));
		});

		$.flushSync();

		let i = 2;
		while (--i) {
			res.length = 0;
			$.set(B, 1);
			$.set(A, 1 + i * 2);
			$.flushSync();

			$.set(A, 2 + i * 2);
			$.set(B, 2);
			$.flushSync();

			assert.equal(res.length, 4);
			assert.deepEqual(res, [3198, 1601, 3195, 1598]);
		}
	});
});
