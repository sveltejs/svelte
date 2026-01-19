import { assert } from '../../../utils.js';
import * as $ from 'svelte/internal/client';

let size = 30;

export default () => {
	let head = $.state(0);
	let current = $.derived(() => {
		let result = 0;
		for (let i = 0; i < size; i++) {
			result += $.get(head);
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
			assert($.get(current) === size);
			counter = 0;
			for (let i = 0; i < 100; i++) {
				$.flush(() => {
					$.set(head, i);
				});
				assert($.get(current) === i * size);
			}
			assert(counter === 100);
		}
	};
};
