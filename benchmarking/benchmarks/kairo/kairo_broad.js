import { assert, fastest_test } from '../../utils.js';
import * as $ from '../../../packages/svelte/src/internal/client/index.js';

function setup() {
	let head = $.source(0);
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
			$.flush_sync(() => {
				$.set(head, 1);
			});
			counter = 0
			for (let i = 0; i < 50; i++) {
				$.flush_sync(() => {
					$.set(head, i);
				});
				assert($.get(last) === i + 50);
			}
			assert(counter === 50 * 50);
		}
	};
}

export async function kairo_broad() {
	// Do 10 loops to warm up JIT
	for (let i = 0; i < 10; i++) {
		const { run, destroy } = setup();
		run();
		destroy();
	}

	const { run, destroy } = setup();

	const { timing } = await fastest_test(10, () => {
		for (let i = 0; i < 100; i++) {
			run();
		}
	});

	destroy();

	return {
		benchmark: 'kairo_broad',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}
