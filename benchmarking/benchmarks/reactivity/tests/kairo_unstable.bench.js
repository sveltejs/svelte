import assert from 'node:assert';
import * as $ from 'svelte/internal/client';

export default () => {
	let head = $.state(0);
	const double = $.derived(() => $.get(head) * 2);
	const inverse = $.derived(() => -$.get(head));
	let current = $.derived(() => {
		let result = 0;
		for (let i = 0; i < 20; i++) {
			result += $.get(head) % 2 ? $.get(double) : $.get(inverse);
		}
		return result;
	});

	let counter = 0;

	const destroy = $.effect_root(() => {
		$.render_effect(() => {
			$.get(current);
			counter++;
		});
	});

	return {
		destroy,
		run() {
			$.flush(() => {
				$.set(head, 1);
			});
			assert.equal($.get(current), 40);
			counter = 0;
			for (let i = 0; i < 100; i++) {
				$.flush(() => {
					$.set(head, i);
				});
			}
			assert.equal(counter, 100);
		}
	};
};
