import { assert, fastest_test } from '../../../utils.js';
import * as $ from 'svelte/internal/client';

let size = 30;

function setup() {
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
			$.flush_sync(() => {
				$.set(head, 1);
			});
			assert($.get(current) === size);
			counter = 0;
			for (let i = 0; i < 100; i++) {
				$.flush_sync(() => {
					$.set(head, i);
				});
				assert($.get(current) === i * size);
			}
			assert(counter === 100);
		}
	};
}

export async function kairo_repeated_unowned() {
	// Do 10 loops to warm up JIT
	for (let i = 0; i < 10; i++) {
		const { run, destroy } = setup();
		run();
		destroy();
	}

	const { run, destroy } = setup();

	const { timing } = await fastest_test(10, () => {
		for (let i = 0; i < 1000; i++) {
			run();
		}
	});

	destroy();

	return {
		benchmark: 'kairo_repeated_unowned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function kairo_repeated_owned() {
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
		for (let i = 0; i < 1000; i++) {
			run();
		}
	});

	// @ts-ignore
	destroy();
	destroy_owned();

	return {
		benchmark: 'kairo_repeated_owned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}
