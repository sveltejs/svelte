import { assert } from '../../../utils.js';
import * as $ from 'svelte/internal/client';
import { create_test } from '../util.js';

export default create_test('kairo_mux', () => {
	let heads = new Array(100).fill(null).map((_) => $.state(0));
	const mux = $.derived(() => {
		return Object.fromEntries(heads.map((h) => $.get(h)).entries());
	});
	const splited = heads
		.map((_, index) => $.derived(() => $.get(mux)[index]))
		.map((x) => $.derived(() => $.get(x) + 1));

	const destroy = $.effect_root(() => {
		splited.forEach((x) => {
			$.render_effect(() => {
				$.get(x);
			});
		});
	});

	return {
		destroy,
		run() {
			for (let i = 0; i < 10; i++) {
				$.flush(() => {
					$.set(heads[i], i);
				});
				assert($.get(splited[i]) === i + 1);
			}
			for (let i = 0; i < 10; i++) {
				$.flush(() => {
					$.set(heads[i], i * 2);
				});
				assert($.get(splited[i]) === i * 2 + 1);
			}
		}
	};
});
