import { assert, fastest_test } from '../../utils.js';
import * as $ from '../../../packages/svelte/src/internal/client/index.js';

function setup() {
	let heads = new Array(100).fill(null).map((_) => $.state(0));
	const mux = $.derived(() => {
		return Object.fromEntries(heads.map((h) => $.get(h)).entries());
	});
	const splited = heads
		.map((_, index) => $.derived(() => $.get(mux)[index]))
		.map((x) => $.derived(() => $.get(x) + 1));

	const destroy = $.effect_root(() => {
		splited.forEach((x) => {
			$.render_effect(() => {
				$.get(x);
			});
		});
	});

	return {
		destroy,
		run() {
			for (let i = 0; i < 10; i++) {
				$.flush_sync(() => {
					$.set(heads[i], i);
				});
				assert($.get(splited[i]) === i + 1);
			}
			for (let i = 0; i < 10; i++) {
				$.flush_sync(() => {
					$.set(heads[i], i * 2);
				});
				assert($.get(splited[i]) === i * 2 + 1);
			}
		}
	};
}

export async function kairo_mux_unowned() {
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
		benchmark: 'kairo_mux_unowned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function kairo_mux_owned() {
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
		benchmark: 'kairo_mux_owned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}
