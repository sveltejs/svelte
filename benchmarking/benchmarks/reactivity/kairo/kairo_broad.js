import { assert } from '../../../utils.js';
import * as $ from 'svelte/internal/client';
import { create_test } from '../util.js';

export default create_test('kairo_broad', () => {
	let head = $.state(0);
	let last = head;
	let counter = 0;

	const destroy = $.effect_root(() => {
		for (let i = 0; i < 50; i++) {
			let current = $.derived(() => {
				return $.get(head) + i;
			});
			let current2 = $.derived(() => {
				return $.get(current) + 1;
			});
			$.render_effect(() => {
				$.get(current2);
				counter++;
			});
			last = current2;
		}
	});

	return {
		destroy,
		run() {
			$.flush(() => {
				$.set(head, 1);
			});
			counter = 0;
			for (let i = 0; i < 50; i++) {
				$.flush(() => {
					$.set(head, i);
				});
				assert($.get(last) === i + 50);
			}
			assert(counter === 50 * 50);
		}
	};
});
