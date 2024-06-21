import { assert, fastest_test } from '../../utils.js';
import * as $ from '../../../packages/svelte/src/internal/client/index.js';

let width = 10;

function count(number) {
	return new Array(number)
		.fill(0)
		.map((_, i) => i + 1)
		.reduce((x, y) => x + y, 0);
}

function setup() {
	let head = $.source(0);
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
			$.flush_sync(() => {
				$.set(head, 1);
			});
			assert($.get(sum) === constant);
			counter = 0;
			for (let i = 0; i < 100; i++) {
				$.flush_sync(() => {
					$.set(head, i);
				});
				assert($.get(sum) === constant - width + i * width);
			}
			assert(counter === 100);
		}
	};
}

export async function kairo_triangle_unowned() {
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
		benchmark: 'kairo_triangle_unowned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function kairo_triangle_owned() {
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
		benchmark: 'kairo_triangle_owned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}
