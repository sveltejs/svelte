import assert from 'node:assert';
import * as $ from 'svelte/internal/client';

let width = 5;

export default () => {
	let head = $.state(0);
	let current = [];
	for (let i = 0; i < width; i++) {
		current.push(
			$.derived(() => {
				return $.get(head) + 1;
			})
		);
	}
	let sum = $.derived(() => {
		return current.map((x) => $.get(x)).reduce((a, b) => a + b, 0);
	});
	let counter = 0;

	const destroy = $.effect_root(() => {
		$.render_effect(() => {
			$.get(sum);
			counter++;
		});
	});

	return {
		destroy,
		run() {
			$.flush(() => {
				$.set(head, 1);
			});
			assert.equal($.get(sum), 2 * width);
			counter = 0;
			for (let i = 0; i < 500; i++) {
				$.flush(() => {
					$.set(head, i);
				});
				assert.equal($.get(sum), (i + 1) * width);
			}
			assert.equal(counter, 500);
		}
	};
};
