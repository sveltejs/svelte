import assert from 'node:assert';
import * as $ from 'svelte/internal/client';

export default () => {
	let heads = new Array(100).fill(null).map((_) => $.state(0));
	const mux = $.derived(() => {
		return Object.fromEntries(heads.map((h) => $.get(h)).entries());
	});
	const split = heads
		.map((_, index) => $.derived(() => $.get(mux)[index]))
		.map((x) => $.derived(() => $.get(x) + 1));

	const destroy = $.effect_root(() => {
		split.forEach((x) => {
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
				assert.equal($.get(split[i]), i + 1);
			}
			for (let i = 0; i < 10; i++) {
				$.flush(() => {
					$.set(heads[i], i * 2);
				});
				assert.equal($.get(split[i]), i * 2 + 1);
			}
		}
	};
};
