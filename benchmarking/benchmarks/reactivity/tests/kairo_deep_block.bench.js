import assert from 'node:assert';
import * as $ from 'svelte/internal/client';
import { block } from '../../../../packages/svelte/src/internal/client/reactivity/effects.js';

let len = 50;
const iter = 50;

// Like `kairo_deep`, but the derived chain is also read by a block effect, as
// happens with e.g. `{#if derived}` in a component. Measures our #traverse perf better.
export default () => {
	let head = $.state(0);
	let current = head;
	for (let i = 0; i < len; i++) {
		let c = current;
		current = $.derived(() => {
			return $.get(c) + 1;
		});
	}
	let counter = 0;

	const destroy = $.effect_root(() => {
		block(() => {
			$.get(current);
		});

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
			counter = 0;
			for (let i = 0; i < iter; i++) {
				$.flush(() => {
					$.set(head, i);
				});
				assert.equal($.get(current), len + i);
			}
			assert.equal(counter, iter);
		}
	};
};
