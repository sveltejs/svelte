import * as $ from 'svelte/internal/client';
import { fastest_test } from '../../utils.js';

export function busy() {
	let a = 0;
	for (let i = 0; i < 1_00; i++) {
		a++;
	}
}

/**
 *
 * @param {string} label
 * @param {() => { run: (i?: number) => void, destroy: () => void }} setup
 */
export function create_test(label, setup) {
	return {
		unowned: async () => {
			// Do 10 loops to warm up JIT
			for (let i = 0; i < 10; i++) {
				const { run, destroy } = setup();
				run(0);
				destroy();
			}

			const { run, destroy } = setup();

			const { time, gc_time } = await fastest_test(10, () => {
				for (let i = 0; i < 1000; i++) {
					run(i);
				}
			});

			destroy();

			return {
				benchmark: `${label}_unowned`,
				time,
				gc_time
			};
		},
		owned: async () => {
			let run, destroy;

			const destroy_owned = $.effect_root(() => {
				// Do 10 loops to warm up JIT
				for (let i = 0; i < 10; i++) {
					const { run, destroy } = setup();
					run(0);
					destroy();
				}

				({ run, destroy } = setup());
			});

			const { time, gc_time } = await fastest_test(10, () => {
				for (let i = 0; i < 1000; i++) {
					run(i);
				}
			});

			// @ts-ignore
			destroy();
			destroy_owned();

			return {
				benchmark: `${label}_owned`,
				time,
				gc_time
			};
		}
	};
}
