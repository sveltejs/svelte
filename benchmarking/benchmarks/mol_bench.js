import { assert, fastest_test } from '../utils.js';
import * as $ from '../../packages/svelte/src/internal/client/index.js';

/**
 * @param {number} n
 */
function fib(n) {
	if (n < 2) return 1;
	return fib(n - 1) + fib(n - 2);
}

/**
 * @param {number} n
 */
function hard(n) {
	return n + fib(16);
}

const numbers = Array.from({ length: 5 }, (_, i) => i);

function setup() {
	let res = [];
	const A = $.source(0);
	const B = $.source(0);
	const C = $.derived(() => ($.get(A) % 2) + ($.get(B) % 2));
	const D = $.derived(() => numbers.map((i) => i + ($.get(A) % 2) - ($.get(B) % 2)));
	D.equals = function (/** @type {number[]} */ l) {
		var r = this.v;
		return r !== null && l.length === r.length && l.every((v, i) => v === r[i]);
	};
	const E = $.derived(() => hard($.get(C) + $.get(A) + $.get(D)[0]));
	const F = $.derived(() => hard($.get(D)[0] && $.get(B)));
	const G = $.derived(() => $.get(C) + ($.get(C) || $.get(E) % 2) + $.get(D)[0] + $.get(F));

	const destroy = $.effect_root(() => {
		$.render_effect(() => {
			res.push(hard($.get(G)));
		});
		$.render_effect(() => {
			res.push($.get(G));
		});
		$.render_effect(() => {
			res.push(hard($.get(F)));
		});
	});

	return {
		destroy,
		/**
		 * @param {number} i
		 */
		run(i) {
			res.length = 0;
			$.flush_sync(() => {
				$.set(B, 1);
				$.set(A, 1 + i * 2);
			});
			$.flush_sync(() => {
				$.set(A, 2 + i * 2);
				$.set(B, 2);
			});
			assert(res[0] === 3198 && res[1] === 1601 && res[2] === 3195 && res[3] === 1598);
		}
	};
}

export async function mol_bench() {
	// Do 10 loops to warm up JIT
	for (let i = 0; i < 10; i++) {
		const { run, destroy } = setup();
		run(0);
		destroy();
	}

	const { run, destroy } = setup();

	const { timing } = await fastest_test(10, () => {
		for (let i = 0; i < 1e4; i++) {
			run(i);
		}
	});

	destroy();

	return {
		benchmark: 'mol_bench',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}
