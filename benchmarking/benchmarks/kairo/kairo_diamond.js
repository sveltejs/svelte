import { assert, fastest_test } from '../../utils.js';
import * as $ from '../../../packages/svelte/src/internal/client/index.js';

let width = 5;

function setup() {
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
			$.flush_sync(() => {
				$.set(head, 1);
			});
			assert($.get(sum) === 2 * width);
			counter = 0;
			for (let i = 0; i < 500; i++) {
				$.flush_sync(() => {
					$.set(head, i);
				});
				assert($.get(sum) === (i + 1) * width);
			}
			assert(counter === 500);
		}
	};
}

export async function kairo_diamond_unowned() {
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
		benchmark: 'kairo_diamond_unowned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function kairo_diamond_owned() {
	let run, destroy;

	const destroy_owned = $.effect_root(() => {
		// Do 10 loops to warm up JIT
		for (let i = 0; i < 10; i++) {
			const { run, destroy } = setup();
			run();
			destroy();
		}

		({ run, destroy } = setup());
	});

	const { timing } = await fastest_test(10, () => {
		for (let i = 0; i < 100; i++) {
			run();
		}
	});

	// @ts-ignore
	destroy();
	destroy_owned();

	return {
		benchmark: 'kairo_diamond_owned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}
