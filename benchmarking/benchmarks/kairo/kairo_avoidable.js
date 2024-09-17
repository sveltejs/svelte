import { assert, fastest_test } from '../../utils.js';
import * as $ from '../../../packages/svelte/src/internal/client/index.js';
import { busy } from './util.js';

function setup() {
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
			$.flush_sync(() => {
				$.set(head, 1);
			});
			assert($.get(computed5) === 6);
			for (let i = 0; i < 1000; i++) {
				$.flush_sync(() => {
					$.set(head, i);
				});
				assert($.get(computed5) === 6);
			}
		}
	};
}

export async function kairo_avoidable_unowned() {
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
		benchmark: 'kairo_avoidable_unowned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function kairo_avoidable_owned() {
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
		benchmark: 'kairo_avoidable_owned',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}
