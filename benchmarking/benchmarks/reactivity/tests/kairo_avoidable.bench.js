import { assert } from '../../../utils.js';
import * as $ from 'svelte/internal/client';
import { busy } from '../util.js';

export default () => {
	let head = $.state(0);
	let computed1 = $.derived(() => $.get(head));
	let computed2 = $.derived(() => ($.get(computed1), 0));
	let computed3 = $.derived(() => (busy(), $.get(computed2) + 1)); // heavy computation
	let computed4 = $.derived(() => $.get(computed3) + 2);
	let computed5 = $.derived(() => $.get(computed4) + 3);

	const destroy = $.effect_root(() => {
		$.render_effect(() => {
			$.get(computed5);
			busy(); // heavy side effect
		});
	});

	return {
		destroy,
		run() {
			$.flush(() => {
				$.set(head, 1);
			});
			assert($.get(computed5) === 6);
			for (let i = 0; i < 1000; i++) {
				$.flush(() => {
					$.set(head, i);
				});
				assert($.get(computed5) === 6);
			}
		}
	};
};
