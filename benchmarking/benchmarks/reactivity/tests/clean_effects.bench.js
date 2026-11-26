import assert from 'node:assert';
import * as $ from 'svelte/internal/client';

export default () => {
	const a = $.state(1);
	const b = $.state(2);

	let total = 0;

	const destroy = $.effect_root(() => {
		for (let i = 0; i < 1000; i += 1) {
			$.render_effect(() => {
				total += $.get(a);
			});
		}

		$.render_effect(() => {
			total += $.get(b);
		});
	});

	return {
		destroy,
		run() {
			for (let i = 0; i < 5; i++) {
				total = 0;
				$.flush(() => $.set(b, i));
				assert.equal(total, i);
			}
		}
	};
};
