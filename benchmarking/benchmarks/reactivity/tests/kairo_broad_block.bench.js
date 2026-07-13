import assert from 'node:assert';
import * as $ from 'svelte/internal/client';
import { block } from '../../../../packages/svelte/src/internal/client/reactivity/effects.js';

// Like `kairo_broad`, but each derived is also read by a block effect, as
// happens with e.g. `{#if derived}` in a component. Measures our #traverse perf better.
export default () => {
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
			block(() => {
				$.get(current2);
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
				assert.equal($.get(last), i + 50);
			}
			assert.equal(counter, 50 * 50);
		}
	};
};
