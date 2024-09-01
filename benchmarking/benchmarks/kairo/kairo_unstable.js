import { assert, fastest_test } from '../../utils.js';
import * as $ from '../../../packages/svelte/src/internal/client/index.js';

function setup() {
	let head = $.state(0);
	const double = $.derived(() => $.get(head) * 2);
	const inverse = $.derived(() => -$.get(head));
	let current = $.derived(() => {
		let result = 0;
		for (let i = 0; i < 20; i++) {
			result += $.get(head) % 2 ? $.get(double) : $.get(inverse);
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
			assert($.get(current) === 40);
			counter = 0;
			for (let i = 0; i < 100; i++) {
				$.flush_sync(() => {
					$.set(head, i);
				});
			}
			assert(counter === 100);
		}
	};
}

export async function kairo_unstable_unowned() {
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
		benchmark: 'kairo_unstable_unowned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function kairo_unstable_owned() {
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
		benchmark: 'kairo_unstable_owned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}
