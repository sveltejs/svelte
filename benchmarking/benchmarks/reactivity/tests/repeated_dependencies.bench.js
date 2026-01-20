import { assert } from '../../../utils.js';
import * as $ from 'svelte/internal/client';

const ARRAY_SIZE = 1000;

export default () => {
	const signals = Array.from({ length: ARRAY_SIZE }, (_, i) => $.state(i));
	const order = $.state(0);

	// break skipped_deps fast path by changing order of reads
	const total = $.derived(() => {
		const ord = $.get(order);
		let sum = 0;
		for (let i = 0; i < ARRAY_SIZE; i++) {
			sum += /** @type {number} */ ($.get(signals[(i + ord) % ARRAY_SIZE]));
		}
		return sum;
	});

	const destroy = $.effect_root(() => {
		$.render_effect(() => {
			$.get(total);
		});
	});

	return {
		destroy,
		run() {
			for (let i = 0; i < 100; i++) {
				$.flush(() => $.set(order, i));
				assert($.get(total) === (ARRAY_SIZE * (ARRAY_SIZE - 1)) / 2); // sum of 0..999
			}
		}
	};
};
