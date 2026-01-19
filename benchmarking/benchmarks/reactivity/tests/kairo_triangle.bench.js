import { assert } from '../../../utils.js';
import * as $ from 'svelte/internal/client';

let width = 10;

function count(number) {
	return new Array(number)
		.fill(0)
		.map((_, i) => i + 1)
		.reduce((x, y) => x + y, 0);
}

export default () => {
	let head = $.state(0);
	let current = head;
	let list = [];
	for (let i = 0; i < width; i++) {
		let c = current;
		list.push(current);
		current = $.derived(() => {
			return $.get(c) + 1;
		});
	}
	let sum = $.derived(() => {
		return list.map((x) => $.get(x)).reduce((a, b) => a + b, 0);
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
			const constant = count(width);
			$.flush(() => {
				$.set(head, 1);
			});
			assert($.get(sum) === constant);
			counter = 0;
			for (let i = 0; i < 100; i++) {
				$.flush(() => {
					$.set(head, i);
				});
				assert($.get(sum) === constant - width + i * width);
			}
			assert(counter === 100);
		}
	};
};
