import { assert } from '../../utils.js';
import * as $ from 'svelte/internal/client';
import { create_test } from './kairo/util.js';

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

export default create_test('mol_bench', () => {
	let res = [];
	const A = $.state(0);
	const B = $.state(0);
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
			$.flush(() => {
				$.set(B, 1);
				$.set(A, 1 + i * 2);
			});
			$.flush(() => {
				$.set(A, 2 + i * 2);
				$.set(B, 2);
			});
			assert(res[0] === 3198 && res[1] === 1601 && res[2] === 3195 && res[3] === 1598);
		}
	};
});
