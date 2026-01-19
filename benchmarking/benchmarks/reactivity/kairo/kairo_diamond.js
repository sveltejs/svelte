import { assert } from '../../../utils.js';
import * as $ from 'svelte/internal/client';
import { create_test } from './util.js';

let width = 5;

export default create_test('kairo_diamond', () => {
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
			assert($.get(sum) === 2 * width);
			counter = 0;
			for (let i = 0; i < 500; i++) {
				$.flush(() => {
					$.set(head, i);
				});
				assert($.get(sum) === (i + 1) * width);
			}
			assert(counter === 500);
		}
	};
});
